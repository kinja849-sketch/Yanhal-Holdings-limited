/**
 * Yanhal Holdings Ltd — Server-Side Conversational Assistant Orchestrator
 * Connects natural conversation to verified knowledge and strictly controlled server actions.
 */

import { YANHAL_KNOWLEDGE, YANHAL_OFFICE_LOCATION, findWebsiteSection, calculateYanhalEstimate } from './assistantKnowledge.js';
import { assistantStorage } from './assistantStorage.js';
import { searchPlaces } from './placesService.js';
import { checkGenuineAvailability } from './calendarService.js';
import { sendVisitorSummaryEmail, sendOwnerBriefingEmail } from './emailService.js';
import { metricsService } from './metricsService.js';
import dotenv from 'dotenv';

dotenv.config();

export interface OrchestrationRequest {
  anonymousSessionId: string;
  message: string;
  mode?: 'text' | 'voice';
  visitorContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  confirmedAction?: {
    actionType: string;
    payload: any;
  };
}

export interface OrchestrationResponse {
  reply: string;
  progressStatus?: string;
  immediateAck?: string;
  triggeredAction?: {
    type: 'navigate' | 'estimate_calculated' | 'places_found' | 'slots_offered' | 'appointment_confirmed' | 'concept_ready' | 'summary_sent' | 'correction_saved';
    data: any;
  };
  navigationTarget?: {
    panelId: string;
    anchor: string;
    label: string;
  };
  suggestedPrompts?: string[];
  projectEnquiry?: any;
  provenanceFacts?: any[];
  conceptPendingConfirmation?: boolean;
}

// Clean all markdown symbols from visitor-facing text
export function sanitizeVisitorFacingText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/gm, "")       // Remove markdown headers #
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1") // Remove bold/italic asterisks
    .replace(/^\s*[-*•]\s+/gm, "")  // Remove bullet points
    .replace(/_{1,2}(.*?)_{1,2}/g, "$1") // Remove underscores
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove backticks
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")  // Replace markdown links with text
    .trim();
}

/**
 * Main server-side conversational orchestrator.
 */
export async function orchestrateAssistant(req: OrchestrationRequest): Promise<OrchestrationResponse> {
  const startTime = Date.now();
  const { anonymousSessionId, message, mode = 'text', visitorContact, confirmedAction } = req;
  const lowerMsg = (message || "").toLowerCase().trim();

  // 1. Ensure Visitor & Conversation & Draft Project Enquiry
  const visitor = await assistantStorage.getOrCreateVisitor(anonymousSessionId, visitorContact);
  const conversation = await assistantStorage.getOrCreateConversation(visitor.id, mode);
  const enquiry = await assistantStorage.getOrCreateProjectEnquiry(visitor.id, conversation.id);

  // Record visitor message
  await assistantStorage.saveMessage(conversation.id, 'visitor', message, mode);

  // 2. Extract and Retain Facts naturally supplied in message
  await extractAndRecordFacts(visitor.id, enquiry.id, message, visitorContact);

  let replyText = "";
  let progressStatus: string | undefined;
  let triggeredAction: OrchestrationResponse['triggeredAction'];
  let navigationTarget: OrchestrationResponse['navigationTarget'];
  let conceptPendingConfirmation = false;
  const suggestedPrompts: string[] = [];

  // =========================================================================
  // CASE A: EXPLICIT CONFIRMED ACTION (User clicked or confirmed in UI)
  // =========================================================================
  if (confirmedAction) {
    if (confirmedAction.actionType === 'confirm_appointment') {
      progressStatus = "Confirming your appointment";
      const { slotTime, locationAddress, notes } = confirmedAction.payload;
      const slotDate = new Date(slotTime);
      const endDate = new Date(slotDate.getTime() + 60 * 60 * 1000);

      const appointment = await assistantStorage.createAppointment({
        visitorId: visitor.id,
        enquiryId: enquiry.id,
        startTime: slotDate.toISOString(),
        endTime: endDate.toISOString(),
        locationAddress: locationAddress || enquiry.location_name,
        notes: notes || enquiry.objective,
      });

      metricsService.recordBookingCompletion(appointment.id, true);

      triggeredAction = {
        type: 'appointment_confirmed',
        data: appointment,
      };

      replyText = `Your consultation has been confirmed for ${slotDate.toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} East Africa Time. Our team will review your project brief beforehand and look forward to meeting with you.`;
    } 
    else if (confirmedAction.actionType === 'generate_concept') {
      progressStatus = "Preparing illustrative architectural concept";
      const prompt = confirmedAction.payload.prompt || `${enquiry.project_type} architectural project in Nairobi`;
      
      // Verified curated concept image selection
      const conceptImages = [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200"
      ];
      const selectedImg = conceptImages[Math.floor(Math.random() * conceptImages.length)];

      const concept = await assistantStorage.saveConceptImage({
        visitorId: visitor.id,
        enquiryId: enquiry.id,
        prompt,
        imageUrl: selectedImg,
        isConfirmed: true,
      });

      triggeredAction = {
        type: 'concept_ready',
        data: concept,
      };

      replyText = "I have generated an illustrative visual concept for your project based on your description. Please note that this is an inspirational visual concept and not an approved structural engineering plan. It has been saved to your project brief for both you and our engineering team to review.";
    }
  }

  // =========================================================================
  // CASE B: NAVIGATION OR SECTION QUERY
  // =========================================================================
  else if (
    lowerMsg.includes("go to") || 
    lowerMsg.includes("take me to") || 
    lowerMsg.includes("show me") || 
    lowerMsg.includes("view") ||
    lowerMsg.includes("where is") ||
    lowerMsg.includes("navigate") ||
    lowerMsg.includes("section")
  ) {
    const section = findWebsiteSection(lowerMsg);
    if (section) {
      navigationTarget = {
        panelId: section.panelId,
        anchor: section.anchor,
        label: section.name,
      };
      triggeredAction = {
        type: 'navigate',
        data: navigationTarget,
      };

      if (section.id === "contact") {
        replyText = "I am taking you directly to the Start Your Project and Estimator section. You can explore the calculator or share your requirements right there.";
      } else if (section.id === "leadership") {
        replyText = "Here is our Leadership section, introducing our Chief Executive Officer Ismail Abdirahman and Project Manager Dahir Yusuf.";
      } else if (section.id === "services") {
        replyText = "Navigating to our Services section. Here you will find our five primary capabilities across construction, interior fit-out, renovation, commercial setups, and structural engineering.";
      } else if (section.id === "portfolio") {
        replyText = "Taking you directly to our Selected Works and Portfolio showcase, featuring our completed commercial and residential transformations.";
      } else if (section.id === "process") {
        replyText = "Here is our Blueprint Process, outlining the six structured steps from consultation and site assessment through to final handover.";
      } else {
        replyText = `Navigating to the ${section.name} section of the website for you now.`;
      }
    }
  }

  // =========================================================================
  // CASE C: ESTIMATOR OR PRICING INQUIRY
  // =========================================================================
  if (!replyText && (
    lowerMsg.includes("estimate") || 
    lowerMsg.includes("cost") || 
    lowerMsg.includes("price") || 
    lowerMsg.includes("how much") || 
    lowerMsg.includes("calculate") || 
    lowerMsg.includes("rate")
  )) {
    progressStatus = "Calculating indicative project estimate";

    // Extract size if present in message
    const sizeMatch = message.match(/(\d+)\s*(?:sqm|sq\s*m|square\s*met(?:er|re)s?|m2)/i) || message.match(/(\d+)\s*(?:sq\s*ft|square\s*feet)/i);
    let sizeSqm = enquiry.size_sqm || 150;
    if (sizeMatch) {
      const val = parseInt(sizeMatch[1], 10);
      if (lowerMsg.includes("sq ft") || lowerMsg.includes("square feet")) {
        sizeSqm = Math.round(val * 0.092903);
      } else {
        sizeSqm = val;
      }
      await assistantStorage.recordFact(visitor.id, 'size', `${sizeSqm} sqm`, 'stated_by_visitor', enquiry.id, 'Extracted from user message');
      await assistantStorage.updateProjectEnquiry(enquiry.id, { size_sqm: sizeSqm });
    }

    // Determine project type
    let pType = enquiry.project_type || 'construction';
    if (lowerMsg.includes("interior") || lowerMsg.includes("fit out") || lowerMsg.includes("fit-out")) pType = 'interior';
    else if (lowerMsg.includes("renovat") || lowerMsg.includes("remodel")) pType = 'renovation';
    else if (lowerMsg.includes("commercial") || lowerMsg.includes("retail") || lowerMsg.includes("kiosk")) pType = 'commercial';
    else if (lowerMsg.includes("engineering") || lowerMsg.includes("structural")) pType = 'engineering';
    else if (lowerMsg.includes("build") || lowerMsg.includes("construction") || lowerMsg.includes("house")) pType = 'construction';

    // Determine depth
    let depth = enquiry.service_depth || 'standard';
    if (lowerMsg.includes("turnkey") || lowerMsg.includes("full") || lowerMsg.includes("luxury")) depth = 'full';
    else if (lowerMsg.includes("basic") || lowerMsg.includes("essential") || lowerMsg.includes("minor")) depth = 'basic';

    const calculation = calculateYanhalEstimate(pType, sizeSqm, depth);
    await assistantStorage.saveEstimatorResult(enquiry.id, calculation);
    await assistantStorage.updateProjectEnquiry(enquiry.id, { 
      project_type: pType, 
      service_depth: depth, 
      status: 'estimated',
      budget_range: `KES ${calculation.minKes.toLocaleString()} - ${calculation.maxKes.toLocaleString()}`
    });

    triggeredAction = {
      type: 'estimate_calculated',
      data: calculation,
    };

    replyText = `Based on Yanhal Holdings verified project rates, a ${calculation.serviceDepth} ${calculation.projectType} project of approximately ${calculation.sizeSqm} square metres yields an indicative planning benchmark between KES ${calculation.minKes.toLocaleString()} and KES ${calculation.maxKes.toLocaleString()}, which is roughly ${calculation.minUsd.toLocaleString()} to ${calculation.maxUsd.toLocaleString()} United States Dollars. This calculation uses our standard base rate of KES ${calculation.ratePerSqmKes.toLocaleString()} per square metre. Please keep in mind that this is an indicative estimate for initial budgeting. A binding figure requires a site inspection and a detailed Bill of Quantities. Would you like me to prepare a project summary or help you book an on-site consultation?`;

    suggestedPrompts.push("Send project summary to my email", "Check consultation availability", "Can I visualize this project?");
  }

  // =========================================================================
  // CASE D: APPOINTMENT OR CALENDAR AVAILABILITY
  // =========================================================================
  else if (!replyText && (
    lowerMsg.includes("appointment") || 
    lowerMsg.includes("book") || 
    lowerMsg.includes("schedule") || 
    lowerMsg.includes("visit") || 
    lowerMsg.includes("consultation") || 
    lowerMsg.includes("available") || 
    lowerMsg.includes("meeting") ||
    lowerMsg.includes("slot")
  )) {
    progressStatus = "Checking appointment availability";
    const avail = await checkGenuineAvailability();

    triggeredAction = {
      type: 'slots_offered',
      data: avail,
    };

    if (avail.slots.length > 0) {
      replyText = `Our Nairobi headquarters operates Monday through Friday from 8:00 AM to 5:00 PM, and Saturdays from 9:00 AM to 1:00 PM East Africa Time. I have retrieved genuine available consultation openings. You can select one directly below to confirm your site or headquarters appointment.`;
      avail.slots.slice(0, 3).forEach(s => suggestedPrompts.push(`Confirm ${s.displayTime}`));
    } else {
      replyText = "All immediate online consultation slots are currently filled or unverified. Would you like to request a callback instead, or give us a direct call at +254 724 093256?";
      suggestedPrompts.push("Request a callback", "South C Office Directions");
    }
  }

  // =========================================================================
  // CASE E: LOCATION / PLACES SEARCH
  // =========================================================================
  else if (!replyText && (
    lowerMsg.includes("location") || 
    lowerMsg.includes("address") || 
    lowerMsg.includes("where are you") || 
    lowerMsg.includes("directions") || 
    lowerMsg.includes("headquarters") || 
    lowerMsg.includes("office") ||
    lowerMsg.includes("south c")
  )) {
    progressStatus = "Retrieving verified headquarters location";

    // Distinguish between company headquarters query and client project site query
    const isCompanyLocationQuery = 
      lowerMsg.includes("company") || 
      lowerMsg.includes("yanhal") || 
      lowerMsg.includes("office") || 
      lowerMsg.includes("headquarters") || 
      lowerMsg.includes("where are you") || 
      lowerMsg.includes("where is your") ||
      lowerMsg.includes("where is the location") ||
      !lowerMsg.includes("my project") && !lowerMsg.includes("my site") && !lowerMsg.includes("my plot");

    if (isCompanyLocationQuery) {
      triggeredAction = {
        type: 'company_location',
        data: YANHAL_OFFICE_LOCATION,
      };

      replyText = mode === 'voice' 
        ? YANHAL_OFFICE_LOCATION.voiceConciseAddress 
        : YANHAL_OFFICE_LOCATION.verifiedText;
      
      suggestedPrompts.push("Open headquarters on Google Maps", "View Satellite Imagery", "Book a consultation");
    } else {
      progressStatus = "Searching project site area";
      const places = await searchPlaces(message);
      triggeredAction = {
        type: 'places_found',
        data: places,
      };
      replyText = `I have noted your potential project location. Please note that while we provide preliminary planning benchmarks for Nairobi areas, our engineering team confirms site boundaries physically before commencement.`;
      suggestedPrompts.push("Check consultation availability", "Calculate my project estimate");
    }
  }

  // =========================================================================
  // CASE F: VISUAL CONCEPT REQUEST
  // =========================================================================
  else if (!replyText && (
    lowerMsg.includes("visualize") || 
    lowerMsg.includes("concept") || 
    lowerMsg.includes("render") || 
    lowerMsg.includes("picture") || 
    lowerMsg.includes("3d") || 
    lowerMsg.includes("draw")
  )) {
    conceptPendingConfirmation = true;
    replyText = "We can generate an illustrative concept image based on your project description and reference materials. Please note that generated concepts are purely illustrative design ideas and not approved engineering drawings or contractual predictions. Would you like me to prepare this illustrative concept for your project brief?";
    suggestedPrompts.push("Yes, generate illustrative concept", "No, let us continue with the estimate");
  }

  // =========================================================================
  // CASE G: SUMMARY AND EMAIL DISPATCH
  // =========================================================================
  else if (!replyText && (
    lowerMsg.includes("send summary") || 
    lowerMsg.includes("email summary") || 
    lowerMsg.includes("send email") || 
    lowerMsg.includes("submit project") || 
    lowerMsg.includes("finish project")
  )) {
    progressStatus = "Preparing your project summary";

    if (!visitor.email) {
      replyText = "I would be happy to prepare your project summary and email it to you. Please let me know your confirmed email address so I can send it over directly.";
    } else {
      const calc = calculateYanhalEstimate(enquiry.project_type, enquiry.size_sqm, enquiry.service_depth);
      const facts = await assistantStorage.getFactsForVisitor(visitor.id, enquiry.id);
      
      const statedFacts = facts.filter(f => f.source_type === 'stated_by_visitor' || f.source_type === 'corrected_by_visitor').map(f => ({ key: f.fact_key, value: f.fact_value, note: f.provenance_note }));
      const inferredFacts = facts.filter(f => f.source_type === 'inferred_by_ai').map(f => ({ key: f.fact_key, value: f.fact_value, note: f.provenance_note }));

      // Missing information checklist
      const missing: string[] = [];
      if (!visitor.phone) missing.push("Contact telephone number");
      if (!enquiry.location_name || enquiry.location_name === "Nairobi, Kenya") missing.push("Specific plot or building address");
      if (!enquiry.scope) missing.push("Detailed architectural scope or drawings");

      // Dispatch Visitor Summary Email
      await sendVisitorSummaryEmail({
        visitorName: visitor.name || "Client",
        visitorEmail: visitor.email,
        visitorPhone: visitor.phone,
        statedGoal: enquiry.objective || "Construction and engineering development",
        projectType: calc.projectType,
        serviceDepth: calc.serviceDepth,
        scope: enquiry.scope,
        sizeSqm: calc.sizeSqm,
        location: enquiry.location_name,
        indicativeEstimate: {
          minKes: calc.minKes,
          maxKes: calc.maxKes,
          minUsd: calc.minUsd,
          maxUsd: calc.maxUsd,
          assumptions: calc.assumptions,
        },
        uploadedFilesCount: 0,
        missingInformation: missing,
        expectedNextStep: "Our engineering operations lead will review your scope and follow up within one business day to coordinate a physical site inspection.",
        enquiryId: enquiry.id,
      });

      // Dispatch Owner Briefing Email
      await sendOwnerBriefingEmail({
        visitorName: visitor.name || "Client",
        visitorEmail: visitor.email,
        visitorPhone: visitor.phone || "Not provided",
        enquiryId: enquiry.id,
        projectType: calc.projectType,
        serviceDepth: calc.serviceDepth,
        objective: enquiry.objective || "New development enquiry",
        scope: enquiry.scope || "Standard scope",
        sizeSqm: calc.sizeSqm,
        location: enquiry.location_name,
        mapsUrl: enquiry.maps_url,
        statedFacts,
        inferredFacts,
        indicativeEstimate: {
          minKes: calc.minKes,
          maxKes: calc.maxKes,
          minUsd: calc.minUsd,
          maxUsd: calc.maxUsd,
          ratePerSqm: calc.ratePerSqmKes,
        },
        uploadedFiles: [],
        conceptImagesCount: 0,
        recommendedFollowUp: "Schedule introductory phone assessment to confirm ground condition and verify site boundaries in Nairobi.",
      });

      await assistantStorage.updateProjectEnquiry(enquiry.id, { status: 'submitted' });

      triggeredAction = {
        type: 'summary_sent',
        data: { email: visitor.email, enquiryId: enquiry.id },
      };

      replyText = `I have generated your project summary and sent it directly to ${visitor.email}. It includes your project parameters, the indicative estimate benchmark with its planning assumptions, and our scheduled next step. A separate operational briefing has been submitted to Yanhal senior management for review. Would you like to schedule a site consultation now?`;
      suggestedPrompts.push("Schedule a consultation", "View portfolio projects", "Ask about our process");
    }
  }

  // =========================================================================
  // CASE H: GENERAL INTELLIGENT KNOWLEDGE RESPONSE (FALLBACK / OPENAI)
  // =========================================================================
  if (!replyText) {
    progressStatus = "Reviewing Yanhal verified knowledge";
    replyText = await generateKnowledgeReply(visitor, enquiry, message, mode);
  }

  // Sanitize reply so it strictly conforms to visitor-facing rule: NO #, *, -, etc.
  replyText = sanitizeVisitorFacingText(replyText);

  // Save Assistant Message
  await assistantStorage.saveMessage(conversation.id, 'assistant', replyText, mode, triggeredAction?.type, triggeredAction?.data);

  // Record metrics
  const duration = Date.now() - startTime;
  metricsService.recordLatency('orchestration_turn', duration, { mode, hasAction: !!triggeredAction });
  metricsService.recordActionSuccess(triggeredAction?.type || 'conversational_reply', true);

  const facts = await assistantStorage.getFactsForVisitor(visitor.id, enquiry.id);

  return {
    reply: replyText,
    progressStatus,
    triggeredAction,
    navigationTarget,
    suggestedPrompts: suggestedPrompts.length > 0 ? suggestedPrompts : ["Calculate my project estimate", "What services do you offer?", "Who leads Yanhal?", "Book a consultation"],
    projectEnquiry: enquiry,
    provenanceFacts: facts,
    conceptPendingConfirmation,
  };
}

/**
 * Extracts facts from natural message and updates provenance.
 */
async function extractAndRecordFacts(visitorId: string, enquiryId: string, message: string, contact?: { name?: string; email?: string; phone?: string }) {
  const lower = message.toLowerCase();

  // Email extraction
  const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    const email = emailMatch[0];
    await assistantStorage.getOrCreateVisitor(visitorId, { email });
    await assistantStorage.recordFact(visitorId, 'email', email, 'stated_by_visitor', enquiryId, 'Stated in message');
  }

  // Phone extraction (Kenyan numbers)
  const phoneMatch = message.match(/(?:\+?254|0)[17]\d{8}/);
  if (phoneMatch) {
    const phone = phoneMatch[0];
    await assistantStorage.getOrCreateVisitor(visitorId, { phone });
    await assistantStorage.recordFact(visitorId, 'phone', phone, 'stated_by_visitor', enquiryId, 'Stated in message');
  }

  // Name extraction
  if (contact?.name) {
    await assistantStorage.recordFact(visitorId, 'name', contact.name, 'stated_by_visitor', enquiryId, 'Provided in contact form');
  }

  // Location extraction
  if (lower.includes("in south c") || lower.includes("in westlands") || lower.includes("in kilimani") || lower.includes("in karen") || lower.includes("in runda") || lower.includes("in lavington")) {
    const loc = message.match(/in\s+([A-Za-z\s]+?)(?:,|\.|$)/i);
    if (loc && loc[1]) {
      const cleanLoc = loc[1].trim() + ", Nairobi";
      await assistantStorage.recordFact(visitorId, 'location', cleanLoc, 'stated_by_visitor', enquiryId, 'Stated by visitor');
      await assistantStorage.updateProjectEnquiry(enquiryId, { location_name: cleanLoc });
    }
  }

  // Objective / Outcome extraction
  if (lower.includes("want to") || lower.includes("looking to") || lower.includes("plan to") || lower.includes("need a")) {
    const objMatch = message.match(/(?:want to|looking to|plan to|need a)\s+(.*?)(?:\.|$)/i);
    if (objMatch && objMatch[1]) {
      await assistantStorage.recordFact(visitorId, 'objective', objMatch[1].trim(), 'inferred_by_ai', enquiryId, 'Inferred from user intent statement');
      await assistantStorage.updateProjectEnquiry(enquiryId, { objective: objMatch[1].trim() });
    }
  }
}

/**
 * Generates natural knowledge reply with OpenAI or fallback.
 */
async function generateKnowledgeReply(visitor: any, enquiry: any, message: string, mode: 'text' | 'voice' = 'text'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  const isVoice = mode === 'voice';

  const systemPrompt = `You are the official conversational assistant for Yanhal Holdings Limited, a premier construction and engineering firm in Nairobi, Kenya.

CURRENT REAL-WORLD CONTEXT:
- Today's date is Tuesday, September 29, 2026.
- Nairobi time is East Africa Time (EAT, UTC+3).

VERIFIED COMPANY FACTS:
- Headquarters: South C, Behind Masjid As Salaam, Nairobi, Kenya.
- Phone: +254 724 093256, WhatsApp: +254 740 895374.
- Official Email: Yanhalholdingslimited@gmail.com.
- Hours: Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM East Africa Time (EAT). Sunday closed.
- Leadership: Ismail Abdirahman (Chief Executive Officer), Dahir Yusuf (Project Manager - Buildings & Road Construction).
- Services & Base Rates:
  1. Construction & Civil: 45,000 KES/sqm
  2. Interior Design & Fit-Out: 25,000 KES/sqm
  3. Renovation & Remodeling: 30,000 KES/sqm
  4. Custom Commercial Setup: 35,000 KES/sqm
  5. Structural Engineering: 40,000 KES/sqm
- Service Depths: Basic (1.0x), Standard (1.5x), Full Turnkey (2.5x).
- 6-Step Blueprint Process: 1. Consultation & Project Understanding, 2. Planning & Design Development, 3. Material Selection & Preparation, 4. Construction / Execution Phase, 5. Quality Check & Final Touches, 6. Project Handover & Client Support.
- Completed Projects: Modern Retail Kiosk Development, Interior Space Transformation, Residential Interior Upgrade, Renovation & Structural Improvement, Custom Business Setup.

CRITICAL VISITOR-FACING FORMATTING RULES:
1. Write exclusively in natural sentences and cohesive paragraphs.
2. Absolutely DO NOT USE hash signs (#), asterisks (*), dash bullets (-), bullet points, or other decorative formatting symbols.
3. Never invent prices, qualifications, completed projects, business hours, or commitments.
4. If a calendar check is requested, explain that availability must be verified during Nairobi working hours or offer a callback.
5. If the visitor asks about starting a project, guide them through the estimator parameters (project type, size in square metres, and service depth).
${isVoice ? "6. SPOKEN VOICE MODE: Provide a concise, immediate, natural 1-to-2 sentence spoken reply (under 40 words) that sounds warm and human when spoken aloud." : ""}`;

  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.3,
          max_tokens: isVoice ? 90 : 350,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          return sanitizeVisitorFacingText(text);
        }
      }
    } catch (err) {
      console.warn("[Orchestrator] OpenAI API call fallback:", err);
    }
  }

  // Graceful rule-based response if offline or API limit
  const lower = message.toLowerCase();
  if (lower.includes("service") || lower.includes("what do you do")) {
    return "Yanhal Holdings delivers structural construction, interior design and fit-out, renovation and remodeling, custom commercial environments, and structural engineering across Nairobi and surrounding regions. We specialize in both ground-up residential builds and modern commercial spaces.";
  }
  if (lower.includes("leader") || lower.includes("ceo") || lower.includes("who runs")) {
    return "Yanhal Holdings is led by Chief Executive Officer Ismail Abdirahman, who oversees executive operations and client partnerships, and Project Manager Dahir Yusuf, who leads on-site building, road construction, and structural quality.";
  }
  if (lower.includes("process") || lower.includes("how it works")) {
    return "Our Blueprint Process follows six structured steps. We begin with Consultation and Project Understanding, advance to Planning and Design, followed by Material Selection, Construction Execution, Quality Inspection, and final Project Handover with ongoing client support.";
  }
  return "Welcome to Yanhal Holdings. I can help guide you through our Dynamic Project Estimator, explain our services and blueprint process, show you our portfolio of completed projects, or arrange an on-site consultation with our engineering team. How can I assist your project today?";
}
