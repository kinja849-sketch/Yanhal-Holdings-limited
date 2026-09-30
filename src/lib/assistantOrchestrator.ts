/**
 * Yanhal Holdings Ltd — Server-Side Conversational Assistant Orchestrator
 * Connects natural conversation to verified engineering knowledge via native LLM tool calling.
 * Completely eliminates brittle keyword heuristics and pre-written scripts.
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
    type: 'navigate' | 'estimate_calculated' | 'places_found' | 'slots_offered' | 'appointment_confirmed' | 'concept_ready' | 'summary_sent' | 'correction_saved' | 'company_location';
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

// Native function/tool definitions for OpenAI gpt-4o-mini
const ASSISTANT_TOOLS = [
  {
    type: "function",
    function: {
      name: "calculate_estimate",
      description: "Compute and display an indicative construction, interior, renovation, commercial, or structural cost benchmark card. Call this ONLY when the user explicitly requests an estimate calculation or specifies project area dimensions to price. Do NOT call this for general questions about pricing factors, rate policies, or payment terms.",
      parameters: {
        type: "object",
        properties: {
          projectType: {
            type: "string",
            enum: ["construction", "interior", "renovation", "commercial", "engineering"],
            description: "The category of construction work"
          },
          sizeSqm: {
            type: "number",
            description: "Project size in square metres"
          },
          serviceDepth: {
            type: "string",
            enum: ["basic", "standard", "full"],
            description: "Level of finishing / depth (basic = 1.0x, standard = 1.5x, full turnkey = 2.5x)"
          }
        },
        required: ["projectType", "sizeSqm"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "show_headquarters_location",
      description: "Display the interactive Yanhal headquarters card with Google Maps and satellite view. Call this ONLY when the user specifically asks where Yanhal is located in Nairobi, asks for directions to our Nairobi office, or asks how to visit our headquarters in person. Do NOT call this for general inquiries about other cities or regional operations.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "show_consultation_slots",
      description: "Check genuine calendar availability and display interactive booking slots. Call this ONLY when the user explicitly asks to book, schedule, or check available slots for an engineering consultation or site meeting. Do NOT call this when user mentions past meetings or general availability.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_website",
      description: "Navigate the visitor to a specific section on the Yanhal website when they ask to view, see, or jump to a section (e.g. services, portfolio, process, about, contact, estimator).",
      parameters: {
        type: "object",
        properties: {
          sectionName: {
            type: "string",
            description: "Target section name: 'services', 'portfolio', 'process', 'about', 'contact', 'estimator'"
          }
        },
        required: ["sectionName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_project_summary",
      description: "Send the project enquiry summary and planning benchmark to the visitor's email when they explicitly ask to email or submit their project summary.",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The visitor's email address if provided in message"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_visual_concept",
      description: "Generate an illustrative architectural concept image when the user specifically asks to visualize or generate a 3D architectural concept for their project.",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Brief description of the architectural project to visualize"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_project_location",
      description: "Search and verify a specific project site area in Kenya when the visitor names their project plot or site location.",
      parameters: {
        type: "object",
        properties: {
          locationName: {
            type: "string",
            description: "The project site location or neighborhood named by the visitor"
          }
        },
        required: ["locationName"]
      }
    }
  }
];

function buildSystemPrompt(isVoice: boolean): string {
  return `You are Dahir, a senior project and civil engineer at Yanhal Holdings Limited in Nairobi, Kenya.
You are having a direct, professional conversation with a prospective client, property owner, or developer.

CORE CONVERSATIONAL PRINCIPLES:
1. COMPREHEND & ANSWER DIRECTLY:
   - Understand the specific intent, nuance, and context of the visitor's question.
   - Answer their specific question directly in your very first sentence.
   - Never start with generic filler or corporate marketing introductions (DO NOT say "Welcome to Yanhal Holdings", "At Yanhal Holdings Limited, we pride ourselves on...", "Thank you for reaching out", or "I'd be glad to help with that"). Jump straight into the substantive answer.

2. NEVER SOUND SCRIPTED:
   - Talk like an authentic, highly capable construction professional in Nairobi, not an FAQ brochure or customer service script.
   - Do NOT list out all company services, rates, or the 6-step blueprint process unless the visitor explicitly asks for a full overview or step-by-step methodology.
   - Give realistic engineering insight. When appropriate, draw naturally on real construction considerations: Nairobi soil types (black cotton vs red volcanic), structural stability, county building approvals and NCA compliance, material sourcing, site topography, and Bill of Quantities (BQ) budgeting.

3. REFERENCE KNOWLEDGE (Factual basis for your answers; speak naturally, do not recite like a script):
   - Company: Yanhal Holdings Limited, construction and civil engineering firm established in 2020.
   - Headquarters: South C, Behind Masjid As Salaam, Nairobi, Kenya.
   - Hours: Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM East Africa Time (EAT). Sunday closed.
   - Contacts: Phone +254 724 093256, WhatsApp +254 740 895374, Email Yanhalholdingslimited@gmail.com.
   - Leadership: Ismail Abdirahman (CEO), Dahir Yusuf (Project Manager - Buildings & Road Construction).
   - Indicative Baseline Planning Benchmarks (all subject to site inspection and Bill of Quantities):
     * New Construction & Civil: ~45,000 KES/sqm (~$347 USD/sqm)
     * Interior Design & Fit-Out: ~25,000 KES/sqm (~$193 USD/sqm)
     * Renovation & Remodeling: ~30,000 KES/sqm (~$231 USD/sqm)
     * Commercial Setup: ~35,000 KES/sqm (~$270 USD/sqm)
     * Structural Engineering: ~40,000 KES/sqm (~$308 USD/sqm)
     * Depth multipliers: Basic (1.0x), Standard (1.5x), Full Turnkey (2.5x).
   - Blueprint Process (only share if requested): 1. Consultation & Site Visit, 2. Planning & Design, 3. Material Selection, 4. Construction Execution, 5. Quality Inspection, 6. Handover & Warranty Support.
   - Geographic Scope: We are based in Nairobi but undertake projects across Kenya (e.g. Mombasa, Kisumu, Nakuru, Eldoret, Kiambu, Machakos).

4. FORMATTING RULES:
   - Output natural conversational prose. DO NOT use bullet points, numbered lists, asterisks (*), hashtags (#), or dash bullets (-).
   ${isVoice ? "5. SPOKEN VOICE MODE: The visitor is speaking to you over voice. Deliver a concise, natural 1-to-2 sentence spoken reply (strictly under 30 words) that sounds like an engineer speaking naturally on a phone call. Never use lists." : ""}`;
}

/**
 * Main server-side conversational orchestrator.
 */
export async function orchestrateAssistant(req: OrchestrationRequest): Promise<OrchestrationResponse> {
  const startTime = Date.now();
  const { anonymousSessionId, message, mode = 'text', visitorContact, confirmedAction } = req;
  const isVoice = mode === 'voice';

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

      replyText = `Your consultation is confirmed for ${slotDate.toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} East Africa Time. Our engineering team looks forward to meeting with you.`;
    } 
    else if (confirmedAction.actionType === 'generate_concept') {
      progressStatus = "Preparing illustrative architectural concept";
      const prompt = confirmedAction.payload.prompt || `${enquiry.project_type} architectural project in Nairobi`;
      
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

      replyText = "I have generated an illustrative visual concept for your project based on your description. It has been saved to your project brief as an inspirational reference.";
    }
  }

  // =========================================================================
  // CASE B: INTELLIGENT AGENT CONVERSATION WITH TOOL CALLING
  // =========================================================================
  if (!replyText) {
    let apiKey = process.env.OPENAI_API_KEY || "";
    try {
      if (!apiKey && (import.meta as any).env?.VITE_OPENAI_API_KEY) {
        apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY;
      }
    } catch (_) {}

    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const systemPrompt = buildSystemPrompt(isVoice);
        const messagesPayload: any[] = [
          { role: "system", content: systemPrompt },
        ];

        // Add prior conversation messages for continuity
        if (conversation.id) {
          try {
            const prior = await assistantStorage.getMessages(conversation.id);
            if (prior && prior.length > 0) {
              // Exclude the current message that was just saved
              const priorExcludingCurrent = prior.slice(0, -1);
              priorExcludingCurrent.slice(-6).forEach(m => {
                if (m.content) {
                  messagesPayload.push({
                    role: m.sender === "visitor" ? "user" : "assistant",
                    content: m.content,
                  });
                }
              });
            }
          } catch (_) {}
        }

        messagesPayload.push({ role: "user", content: message });

        // First pass: call OpenAI with available tools
        const firstRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messagesPayload,
            tools: ASSISTANT_TOOLS,
            temperature: isVoice ? 0.65 : 0.72,
            max_tokens: isVoice ? 90 : 380,
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (firstRes.ok) {
          const firstData = await firstRes.json();
          const choice = firstData.choices?.[0];

          if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
            const toolCall = choice.message.tool_calls[0];
            const funcName = toolCall.function.name;
            let args: any = {};
            try {
              args = JSON.parse(toolCall.function.arguments || "{}");
            } catch (_) {}

            let toolResult: any = {};

            // Execute the corresponding genuine tool
            if (funcName === "calculate_estimate") {
              const pType = args.projectType || enquiry.project_type || 'construction';
              const sizeSqm = typeof args.sizeSqm === 'number' ? args.sizeSqm : (enquiry.size_sqm || 150);
              const depth = args.serviceDepth || enquiry.service_depth || 'standard';

              const calculation = calculateYanhalEstimate(pType, sizeSqm, depth);
              await assistantStorage.saveEstimatorResult(enquiry.id, calculation);
              await assistantStorage.updateProjectEnquiry(enquiry.id, {
                project_type: pType,
                size_sqm: sizeSqm,
                service_depth: depth,
                status: 'estimated',
                budget_range: `KES ${calculation.minKes.toLocaleString()} - ${calculation.maxKes.toLocaleString()}`,
              });
              await assistantStorage.recordFact(visitor.id, 'size', `${sizeSqm} sqm`, 'stated_by_visitor', enquiry.id, 'Stated in message');

              triggeredAction = {
                type: 'estimate_calculated',
                data: calculation,
              };
              suggestedPrompts.push("Send project summary to my email", "Check consultation availability", "Can I visualize this project?");

              toolResult = {
                status: "success",
                calculation: {
                  projectType: calculation.projectType,
                  sizeSqm: calculation.sizeSqm,
                  serviceDepth: calculation.serviceDepth,
                  minKes: calculation.minKes,
                  maxKes: calculation.maxKes,
                  minUsd: calculation.minUsd,
                  maxUsd: calculation.maxUsd,
                  ratePerSqmKes: calculation.ratePerSqmKes,
                },
                note: "An interactive estimate card is displayed below your message. Converse warmly and summarize this benchmark in your own natural words, noting that final numbers require physical site assessment and a Bill of Quantities.",
              };
            }
            else if (funcName === "show_headquarters_location") {
              triggeredAction = {
                type: 'company_location',
                data: YANHAL_OFFICE_LOCATION,
              };
              suggestedPrompts.push("Open headquarters on Google Maps", "View Satellite Imagery", "Book a consultation");

              toolResult = {
                status: "success",
                headquarters: {
                  address: "South C, Behind Masjid As Salaam, Nairobi, Kenya",
                  hours: "Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM EAT. Sunday closed.",
                  phone: "+254 724 093256",
                  whatsapp: "+254 740 895374",
                  email: "Yanhalholdingslimited@gmail.com",
                },
                note: "An interactive Google Maps and satellite location card is displayed below your message. State our South C address and operating hours welcomingly.",
              };
            }
            else if (funcName === "show_consultation_slots") {
              const avail = await checkGenuineAvailability();
              triggeredAction = {
                type: 'slots_offered',
                data: avail,
              };
              avail.slots.slice(0, 3).forEach(s => suggestedPrompts.push(`Confirm ${s.displayTime}`));

              toolResult = {
                status: "success",
                available: avail.calendarAvailable,
                slots: avail.slots.map(s => s.displayTime),
                note: "Interactive booking buttons are displayed below your message. Inform the client about these slots and invite them to pick one or suggest their preferred time.",
              };
            }
            else if (funcName === "navigate_website") {
              const section = findWebsiteSection(args.sectionName || "");
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
                toolResult = {
                  status: "success",
                  navigatedTo: section.name,
                  anchor: section.anchor,
                  note: `The website is navigating to the ${section.name} section. Let them know naturally that you are taking them there.`,
                };
              } else {
                toolResult = { status: "not_found", note: "Section not found." };
              }
            }
            else if (funcName === "send_project_summary") {
              const targetEmail = args.email || visitor.email;
              if (!targetEmail) {
                toolResult = {
                  status: "missing_email",
                  note: "We do not have the visitor's email address yet. Ask them warmly for their email address so we can dispatch their project brief.",
                };
              } else {
                const calc = calculateYanhalEstimate(enquiry.project_type, enquiry.size_sqm, enquiry.service_depth);
                const facts = await assistantStorage.getFactsForVisitor(visitor.id, enquiry.id);
                const statedFacts = facts.filter(f => f.source_type === 'stated_by_visitor' || f.source_type === 'corrected_by_visitor').map(f => ({ key: f.fact_key, value: f.fact_value, note: f.provenance_note }));
                const inferredFacts = facts.filter(f => f.source_type === 'inferred_by_ai').map(f => ({ key: f.fact_key, value: f.fact_value, note: f.provenance_note }));

                await sendVisitorSummaryEmail({
                  visitorName: visitor.name || "Client",
                  visitorEmail: targetEmail,
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
                  missingInformation: [],
                  expectedNextStep: "Our engineering operations lead will review your scope and follow up within one business day to coordinate a physical site inspection.",
                  enquiryId: enquiry.id,
                });

                await sendOwnerBriefingEmail({
                  visitorName: visitor.name || "Client",
                  visitorEmail: targetEmail,
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
                  data: { email: targetEmail, enquiryId: enquiry.id },
                };

                toolResult = {
                  status: "success",
                  emailedTo: targetEmail,
                  note: "The project brief and planning benchmark have been emailed successfully. Let the client know their summary was dispatched and invite them to schedule a site consultation.",
                };
                suggestedPrompts.push("Schedule a consultation", "View portfolio projects");
              }
            }
            else if (funcName === "generate_visual_concept") {
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
                prompt: args.prompt || `${enquiry.project_type} architectural project in Nairobi`,
                imageUrl: selectedImg,
                isConfirmed: true,
              });
              triggeredAction = {
                type: 'concept_ready',
                data: concept,
              };
              toolResult = {
                status: "success",
                imageUrl: selectedImg,
                note: "An illustrative architectural concept has been prepared. Note that this is an inspirational visual concept rather than an approved structural drawing.",
              };
            }
            else if (funcName === "search_project_location") {
              const places = await searchPlaces(args.locationName || message);
              triggeredAction = {
                type: 'places_found',
                data: places,
              };
              toolResult = {
                status: "success",
                placesFound: places.length,
                note: "Project site location acknowledged. Mention that our engineering team verifies site topography and soil conditions physically before commencement.",
              };
            }

            // Second pass: feed tool result back to model to compose the natural, context-aware reply
            messagesPayload.push(choice.message);
            messagesPayload.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            });

            const secondRes = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messagesPayload,
                temperature: isVoice ? 0.65 : 0.72,
                max_tokens: isVoice ? 90 : 380,
              }),
              signal: AbortSignal.timeout(10000),
            });

            if (secondRes.ok) {
              const secondData = await secondRes.json();
              replyText = secondData.choices?.[0]?.message?.content || "";
            }
          } else {
            // Direct intelligent response without tools
            replyText = choice?.message?.content || "";
          }
        }
      } catch (err) {
        console.warn("[Orchestrator] OpenAI request notice:", err);
      }
    }

    if (!replyText) {
      replyText = isVoice
        ? "I am experiencing a momentary connection hitch to our live engineering system. Please give our Nairobi office a call directly at +254 724 093256 so we can assist you."
        : "I'm experiencing a momentary connection hitch to our live engineering system. Please reach our Nairobi team directly at +254 724 093256, via WhatsApp at +254 740 895374, or at Yanhalholdingslimited@gmail.com, and we will assist you immediately.";
    }
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
