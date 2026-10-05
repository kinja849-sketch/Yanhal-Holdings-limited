/**
 * Yanhal Holdings Ltd — Dynamic Conversational Engine
 * Completely eliminates canned/scripted answers and brittle regex matches.
 * Uses authentic engineering comprehension and native tool calling.
 */

import { calculateYanhalEstimate, findWebsiteSection, YANHAL_OFFICE_LOCATION, getGroundingCompanionResponse } from './assistantKnowledge';
import {
  answerClockQuestion, buildRuntimeFactsBlock, detectKnowledgeSources, guardReplyAgainstClock,
  logKnowledgeSources, NEVER_INVENT_RULES,
} from './runtimeClock';

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

const DYNAMIC_ASSISTANT_TOOLS = [
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
  }
];

export function buildDynamicSystemInstruction(now: Date = new Date()): string {
  return `You are Yani Bot (also known as YanniBot), the intelligent engineering companion and official digital representative of Yanhal Holdings Limited in Nairobi, Kenya. You work alongside Yanhal's executive and engineering leadership: Ismail Abdirahman (CEO) and Dahir Yusuf (Project Manager - Buildings & Road Construction).
${buildRuntimeFactsBlock(now)}
${NEVER_INVENT_RULES}
You are having a direct, professional conversation with a prospective client, property owner, or developer.

CORE CONVERSATIONAL PRINCIPLES:
1. BOT IDENTITY & DIRECT ANSWERS:
   - Your name is Yani Bot (or YanniBot). When asked for your name or identity, state your name directly, warmly, and clearly in your very first sentence. Never refer to yourself as Dahir or Ismail.
   - Understand the specific intent, nuance, and context of the visitor's question and answer it directly in your very first sentence.
   - Act as an attentive, highly conscious companion who knows every detail of the Yanhal platform, website, engineering services, and processes inside and out.
   - If asked "Who are the owners?" or about leadership, explain both Ismail Abdirahman (CEO) and Dahir Yusuf (Project Manager) in detail.
   - If asked "What are the services you provide?", go into comprehensive, articulate detail explaining all five core disciplines.
   - For date or time questions, answer with the exact date/time naturally (e.g. state the weekday and date directly) without reciting repetitive timezone tags unless the user specifically asks about timezones or Nairobi office hours.
   - Never start with generic corporate filler or marketing brochures (DO NOT say "Welcome to Yanhal Holdings", "At Yanhal Holdings Limited, we pride ourselves on...", "Thank you for reaching out", or "I'd be glad to help with that").

2. AUTHENTIC EXPERTISE & NATURAL DIALOGUE:
   - Speak with authoritative, conscious engineering depth about Kenyan construction, structural stability, county building approvals, NCA compliance, and Bill of Quantities (BOQ) budgeting.
   - Give realistic engineering insight tailored to what they ask: Nairobi ground conditions (black cotton vs red volcanic soil), structural stability, county approvals and NCA compliance, material sourcing, site topography, and Bill of Quantities (BQ) budgeting.

3. REFERENCE KNOWLEDGE (Factual basis for your answers; speak naturally, do not recite like a script):
   - Company: Yanhal Holdings Limited, construction and civil engineering firm established in 2020.
   - Headquarters: South C, Behind Masjid As Salaam, Nairobi, Kenya.
   - Hours: Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM East Africa Time (EAT). Sunday closed.
   - Contacts: Phone +254 724 093256, WhatsApp +254 740 895374, Email Yanhalholdingslimited@gmail.com.
   - Owners & Leadership: Ismail Abdirahman (CEO - strategic leadership, investor relations, client partnerships, commercial development), Dahir Yusuf (Project Manager - Buildings & Road Construction, managing ground-zero field execution, concrete pours, heavy equipment, and NCA engineering compliance).
   - Indicative Baseline Planning Benchmarks (all subject to site inspection and Bill of Quantities):
     * New Construction & Civil: ~45,000 KES/sqm (~$347 USD/sqm)
     * Interior Design & Fit-Out: ~25,000 KES/sqm (~$193 USD/sqm)
     * Renovation & Remodeling: ~30,000 KES/sqm (~$231 USD/sqm)
     * Commercial Setup: ~35,000 KES/sqm (~$270 USD/sqm)
     * Structural Engineering: ~40,000 KES/sqm (~$308 USD/sqm)
     * Depth multipliers: Basic (1.0x), Standard (1.5x), Full Turnkey (2.5x).
   - Blueprint Process: 1. Consultation & Site Visit, 2. Planning & Design, 3. Material Selection, 4. Construction Execution, 5. Quality Inspection, 6. Handover & Warranty Support.
   - Geographic Scope: We are based in Nairobi but undertake projects across Kenya (e.g. Mombasa, Kisumu, Nakuru, Eldoret, Kiambu, Machakos).

4. FORMATTING RULES:
   - Output natural conversational prose. DO NOT use bullet points, numbered lists, asterisks (*), hashtags (#), or dash bullets (-).
   - If the visitor uploads an image, analyze and discuss what their image shows (blueprints, site conditions, finishing references).`;
}

/** Single exit point for model text: sanity-check against the live clock and log provenance. */
function verifyReply(question: string, reply: string, toolsUsed: string[] = []): string {
  const guarded = guardReplyAgainstClock(reply);
  logKnowledgeSources('dynamicChat', {
    question,
    sources: detectKnowledgeSources(question, toolsUsed),
    corrected: guarded.corrected,
    badYear: guarded.badYear,
  });
  return guarded.reply;
}

export async function generateDynamicAssistantResponse(
  conversationHistory: ChatMessage[],
  userMessage: string,
  attachedImages?: string[]
): Promise<{ reply: string; actionType?: string; actionData?: any; navigationTarget?: any }> {
  // Calendar/time questions never go to the model: answered from the live clock.
  const clockAnswer = answerClockQuestion(userMessage);
  if (clockAnswer) {
    logKnowledgeSources('dynamicChat', { question: userMessage, sources: ['runtime_clock'], deterministic: true });
    return { reply: clockAnswer };
  }

  let apiKey = "";
  try {
    apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";
  } catch (_) {
    apiKey = (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) || "";
  }

  let actionType: string | undefined;
  let actionData: any = null;
  let navigationTarget: any = null;

  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const messagesPayload: any[] = [
        { role: "system", content: buildDynamicSystemInstruction() },
      ];

      // Include previous conversation history for memory and context
      conversationHistory.slice(-8).forEach(m => {
        messagesPayload.push({
          role: (m.role as string) === "visitor" ? "user" : m.role,
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

      // First pass: call model with tools
      const res1 = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messagesPayload,
          tools: DYNAMIC_ASSISTANT_TOOLS,
          temperature: 0.5,
          max_tokens: 380,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (res1.ok) {
        const data1 = await res1.json();
        const choice = data1.choices?.[0];

        if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
          const toolCall = choice.message.tool_calls[0];
          const funcName = toolCall.function.name;
          let args: any = {};
          try {
            args = JSON.parse(toolCall.function.arguments || "{}");
          } catch (_) {}

          let toolResult: any = {};

          if (funcName === "calculate_estimate") {
            const pType = args.projectType || "construction";
            const size = typeof args.sizeSqm === "number" ? args.sizeSqm : 150;
            const depth = args.serviceDepth || "standard";
            const calculation = calculateYanhalEstimate(pType, size, depth);
            actionType = "estimate_calculated";
            actionData = calculation;

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
              note: "Interactive estimate card is displayed below your message. Converse warmly and summarize this benchmark in your own natural words, noting that final figures require physical site assessment and a Bill of Quantities.",
            };
          }
          else if (funcName === "show_headquarters_location") {
            actionType = "company_location";
            actionData = YANHAL_OFFICE_LOCATION;

            toolResult = {
              status: "success",
              headquarters: {
                address: "South C, Behind Masjid As Salaam, Nairobi, Kenya",
                hours: "Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM EAT. Sunday closed.",
              },
              note: "Interactive Google Maps & satellite location card is displayed below your message. Welcomingly state our South C address and operating hours.",
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
              toolResult = {
                status: "success",
                navigatedTo: section.name,
                note: `Let the visitor know naturally that you are taking them to the ${section.name} section.`,
              };
            } else {
              toolResult = { status: "not_found", note: "Section not found." };
            }
          }

          // Second pass: compose final natural response
          messagesPayload.push(choice.message);
          messagesPayload.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          });

          const res2 = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: messagesPayload,
              temperature: 0.5,
              max_tokens: 380,
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (res2.ok) {
            const data2 = await res2.json();
            const text = data2.choices?.[0]?.message?.content;
            if (text && text.trim().length > 0) {
              return {
                reply: verifyReply(userMessage, sanitizeNaturalText(text), [funcName]),
                actionType,
                actionData,
                navigationTarget,
              };
            }
          }
        } else {
          const directText = choice?.message?.content;
          if (directText && directText.trim().length > 0) {
            return {
              reply: verifyReply(userMessage, sanitizeNaturalText(directText)),
              actionType,
              actionData,
              navigationTarget,
            };
          }
        }
      }
    } catch (err) {
      console.warn("[Dynamic Chat] OpenAI request notice:", err);
    }
  }

  // Intelligent companion fallback from verified company knowledge
  const grounded = getGroundingCompanionResponse(userMessage);
  return {
    reply: verifyReply(userMessage, sanitizeNaturalText(grounded.reply)),
    actionType: actionType || grounded.actionType,
    actionData: actionData || grounded.actionData,
    navigationTarget: navigationTarget || grounded.navigationTarget,
  };
}
