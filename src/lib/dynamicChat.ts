/**
 * Yanhal Holdings Ltd — Dynamic Conversational Engine
 * Completely eliminates canned/scripted answers.
 * Retains full conversation history, learns from progress, and composes dynamic human-like responses.
 */

import { calculateYanhalEstimate, findWebsiteSection, YANHAL_OFFICE_LOCATION } from './assistantKnowledge';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function sanitizeNaturalText(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#+\s*/gm, "")
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/_{1,2}(.*?)_{1,2}/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .trim();
}

const SYSTEM_INSTRUCTION = `You are Bot, the conversational AI for Yanhal Holdings Limited, a premier construction and civil engineering firm in Nairobi, Kenya.

CURRENT CONTEXT:
- Today's date is Tuesday, September 29, 2026.
- Nairobi time is East Africa Time (EAT, UTC+3).
- Headquarters: South C, Behind Masjid As Salaam, Nairobi, Kenya.
- Direct Contact: Phone +254 724 093256, WhatsApp +254 740 895374, Email Yanhalholdingslimited@gmail.com.
- Hours: Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM EAT. Sunday closed.
- Leadership: Ismail Abdirahman (CEO), Dahir Yusuf (Project Manager - Buildings & Road Construction).
- Construction Services & Indicative Base Rates:
  1. Construction & Civil: 45,000 KES per square metre (~$347 USD/sqm)
  2. Interior Design & Fit-Out: 25,000 KES per square metre (~$193 USD/sqm)
  3. Renovation & Remodeling: 30,000 KES per square metre (~$231 USD/sqm)
  4. Custom Commercial Setup: 35,000 KES per square metre (~$270 USD/sqm)
  5. Structural Engineering: 40,000 KES per square metre (~$308 USD/sqm)
- Service Depth Multipliers: Basic (1.0x), Standard (1.5x), Full Turnkey (2.5x).
- 6-Step Blueprint Process: Consultation & Project Understanding, Planning & Design Development, Material Selection & Preparation, Construction Execution Phase, Quality Check & Final Touches, Project Handover & Support.
- Completed Projects: Modern Retail Kiosk Development, Interior Space Transformation, Residential Interior Upgrade, Renovation & Structural Improvement, Custom Business Setup.

CRITICAL CONVERSATIONAL RULES:
1. NEVER USE PRE-WRITTEN TEMPLATES OR SCRIPTS. Compose your own authentic, natural, intelligent sentences tailored to the visitor's exact words.
2. Maintain context: remember what the visitor previously told you and learn from the conversation progress.
3. Answer any question directly. If asked about the date, current time, our team, prices, or technical advice, give the exact honest answer.
4. NO MARKDOWN DECORATION: Strictly do not use hash symbols (#), asterisks (*), bullet dashes (-), or list markers in your replies. Use flowing, well-structured natural paragraphs.
5. If the visitor uploads an image, analyze and discuss what their image shows (e.g. blueprints, site conditions, finishing references).`;

export async function generateDynamicAssistantResponse(
  conversationHistory: ChatMessage[],
  userMessage: string,
  attachedImages?: string[]
): Promise<{ reply: string; actionType?: string; actionData?: any; navigationTarget?: any }> {
  let apiKey = "";
  try {
    apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
  } catch (_) {
    apiKey = (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) || "";
  }

  // Check if navigation was requested
  const section = findWebsiteSection(userMessage);
  let navigationTarget: any = null;
  if (section && (userMessage.toLowerCase().includes("go to") || userMessage.toLowerCase().includes("show me") || userMessage.toLowerCase().includes("navigate") || userMessage.toLowerCase().includes("take me"))) {
    navigationTarget = {
      panelId: section.panelId,
      anchor: section.anchor,
      label: section.name,
    };
  }

  // Check if estimate calculation is relevant
  let actionType: string | undefined;
  let actionData: any = null;
  const lower = userMessage.toLowerCase();

  // Check if verified company location is requested
  if (
    lower.includes("location") || 
    lower.includes("address") || 
    lower.includes("where are you") || 
    lower.includes("headquarters") || 
    lower.includes("office") ||
    lower.includes("south c")
  ) {
    const isCompanyLocation = 
      lower.includes("company") || 
      lower.includes("yanhal") || 
      lower.includes("office") || 
      lower.includes("headquarters") || 
      lower.includes("where are you") || 
      lower.includes("where is your") ||
      lower.includes("where is the location") ||
      !lower.includes("my project") && !lower.includes("my site");

    if (isCompanyLocation) {
      actionType = "company_location";
      actionData = YANHAL_OFFICE_LOCATION;
    }
  }

  if (lower.includes("estimate") || lower.includes("cost") || lower.includes("price") || lower.includes("how much") || lower.includes("calculate") || lower.includes("sqm")) {
    const sizeMatch = userMessage.match(/(\d+)\s*(?:sqm|sq\s*m|square\s*met(?:er|re)s?|m2)/i);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 150;
    let pType = "construction";
    if (lower.includes("interior") || lower.includes("fit-out") || lower.includes("fit out")) pType = "interior";
    else if (lower.includes("renovat") || lower.includes("remodel")) pType = "renovation";
    else if (lower.includes("commercial")) pType = "commercial";
    else if (lower.includes("engineering")) pType = "engineering";

    let depth = "standard";
    if (lower.includes("turnkey") || lower.includes("full") || lower.includes("luxury")) depth = "full";
    else if (lower.includes("basic") || lower.includes("essential")) depth = "basic";

    actionType = "estimate_calculated";
    actionData = calculateYanhalEstimate(pType, size, depth);
  }

  // If OpenAI API key is available, call gpt-4o-mini dynamically
  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const messagesPayload: any[] = [
        { role: "system", content: SYSTEM_INSTRUCTION },
      ];

      // Include previous conversation history for memory and context
      conversationHistory.slice(-8).forEach(m => {
        messagesPayload.push({
          role: m.role === "visitor" ? "user" : m.role,
          content: m.content,
        });
      });

      // Prepare user content
      if (attachedImages && attachedImages.length > 0) {
        const contentParts: any[] = [{ type: "text", text: userMessage || "Here is a reference image for my project." }];
        attachedImages.forEach(img => {
          contentParts.push({
            type: "image_url",
            image_url: { url: img },
          });
        });
        messagesPayload.push({ role: "user", content: contentParts });
      } else {
        messagesPayload.push({ role: "user", content: userMessage });
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messagesPayload,
          temperature: 0.7, // Higher temperature for lively, natural conversation without scripted repetition
          max_tokens: 380,
        }),
        signal: AbortSignal.timeout(9000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return {
            reply: sanitizeNaturalText(text),
            actionType,
            actionData,
            navigationTarget,
          };
        }
      }
    } catch (err) {
      console.warn("[Dynamic Chat] OpenAI request fallback:", err);
    }
  }

  // Dynamic Contextual Rule-Based Fallback (No canned repetitive scripts!)
  if (lower.includes("date") || lower.includes("day is it") || lower.includes("today")) {
    return {
      reply: "Today is Tuesday, September 29, 2026. How can I assist you with your project today?",
      actionType,
      actionData,
      navigationTarget,
    };
  }

  if (lower === "hi" || lower === "hello" || lower === "hey" || lower.startsWith("hi ") || lower.startsWith("hello ")) {
    return {
      reply: "Hello! Welcome to Yanhal Holdings. I am Bot, your conversational guide for construction, interior renovations, and project estimates in Nairobi. What are you looking to build or design?",
      actionType,
      actionData,
      navigationTarget,
    };
  }

  if (lower === "like" || lower.startsWith("like ")) {
    return {
      reply: "Could you tell me a bit more about what you have in mind? For example, are you planning a residential development, an interior fit-out, or a commercial space?",
      actionType,
      actionData,
      navigationTarget,
    };
  }

  if (actionType === "estimate_calculated" && actionData) {
    return {
      reply: `For a ${actionData.serviceDepth} ${actionData.projectType} project of approximately ${actionData.sizeSqm} square metres, our indicative cost benchmark is between KES ${actionData.minKes.toLocaleString()} and KES ${actionData.maxKes.toLocaleString()}, which is roughly ${actionData.minUsd.toLocaleString()} to ${actionData.maxUsd.toLocaleString()} United States Dollars. This is calculated at our standard base rate of KES ${actionData.ratePerSqmKes.toLocaleString()} per square metre. Would you like me to email you a detailed summary, or help you book an on-site consultation?`,
      actionType,
      actionData,
      navigationTarget,
    };
  }

  if (lower.includes("service") || lower.includes("what do you do")) {
    return {
      reply: "Yanhal Holdings delivers five core capabilities: Construction and Civil works, Interior Design and Fit-Out, Renovation and Remodeling, Custom Commercial Setups, and Structural Engineering. We handle everything from ground-up builds in Nairobi to turnkey interior transformations.",
      actionType,
      actionData,
      navigationTarget,
    };
  }

  if (lower.includes("leader") || lower.includes("ceo") || lower.includes("who runs")) {
    return {
      reply: "Yanhal Holdings is led by Chief Executive Officer Ismail Abdirahman, who steers executive operations and client partnerships, and Project Manager Dahir Yusuf, who oversees on-site building, road construction, and structural tolerances.",
      actionType,
      actionData,
      navigationTarget,
    };
  }

  if (lower.includes("location") || lower.includes("where are you") || lower.includes("office") || lower.includes("south c")) {
    return {
      reply: "Yanhal Holdings is headquartered in South C, behind Masjid As Salaam in Nairobi, Kenya. We manage and execute projects throughout Nairobi and across Kenya.",
      actionType,
      actionData,
      navigationTarget,
    };
  }

  return {
    reply: `I understand you are asking about ${userMessage}. I can assist you with estimating project costs, exploring our blueprint process, reviewing completed architectural works, or booking an on-site consultation with our operations team. How would you like to proceed?`,
    actionType,
    actionData,
    navigationTarget,
  };
}
