// Netlify serverless chat endpoint (mirrors /api/assistant/chat in server.ts).
// NOTE: Netlify functions are stateless; the orchestrator therefore rebuilds the project
// enquiry on every turn from the `projectContext` the client sends.
import { orchestrateAssistant } from '../../src/lib/assistantOrchestrator.js';

const json = (statusCode: number, obj: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body: any = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const { anonymousSessionId, message, mode, visitorContact, confirmedAction, projectContext } = body;
  if (!anonymousSessionId && !visitorContact?.email) {
    return json(400, { error: 'Missing session or contact identity' });
  }

  try {
    const response = await orchestrateAssistant({
      anonymousSessionId: anonymousSessionId || `anon_${Date.now()}`,
      message: message || '',
      mode: mode || 'text',
      visitorContact,
      confirmedAction,
      projectContext,
    });
    return json(200, { success: true, ...response });
  } catch (error: any) {
    console.error('[assistant-chat] Error:', error);
    return json(500, {
      success: false,
      reply: 'I encountered a momentary issue processing that request. Please try again or reach our Nairobi headquarters directly at +254 740 895374.',
    });
  }
};
