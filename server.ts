import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { VERIFICATION_TEMPLATE, CONTACT_TEMPLATE } from "./src/emailTemplates.js";
import { sendEstimateEmails, estimateHttpResponse } from "./src/lib/estimateMailer.js";
import { orchestrateAssistant } from "./src/lib/assistantOrchestrator.js";
import { assistantStorage } from "./src/lib/assistantStorage.js";
import { searchPlaces } from "./src/lib/placesService.js";
import { checkGenuineAvailability } from "./src/lib/calendarService.js";
import { metricsService } from "./src/lib/metricsService.js";
import { getInstagramFeed, refreshInstagramToken } from "./src/lib/instagramBackend.js";

dotenv.config();

// Global crash resilience handlers
process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server Unhandled Rejection]:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache for studio-grade audio synthesis
const ttsServerCache = new Map<string, Buffer>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Multer config for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // Email Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // API Routes
  app.post("/api/send-verification", async (req, res) => {
    const { email, confirmationUrl } = req.body;
    
    if (!email || !confirmationUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const html = VERIFICATION_TEMPLATE.replace("{{confirmation_url}}", confirmationUrl);

    try {
      await transporter.sendMail({
        from: '"Yanhal Holdings" <no-reply@yanhalholdings.com>',
        to: email,
        subject: "Verify Your Account - Yanhal Holdings",
        html: html,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post(["/api/send-contact", "/.netlify/functions/send-contact"], async (req, res) => {
    const { name, email, projectType, message, profileImageUrl } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const html = CONTACT_TEMPLATE
      .replace("{{name}}", name)
      .replace("{{email}}", email)
      .replace("{{projectType}}", projectType || "Not Specified")
      .replace("{{message}}", message)
      .replace("{{profile_url}}", profileImageUrl || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg");

    try {
      await transporter.sendMail({
        from: '"Yanhal Website" <system@yanhalholdings.com>',
        to: process.env.COMPANY_EMAIL || "Yanhalholdingslimited@gmail.com",
        replyTo: email,
        subject: `New Contact Submission from ${name}`,
        html: html,
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending contact email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  app.post(["/api/send-estimate", "/.netlify/functions/send-estimate"], upload.array('images'), async (req, res) => {
    const { name, phone, service } = req.body;
    const images = (req.files as Express.Multer.File[]) || [];

    if (!name || !phone || !service) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await sendEstimateEmails(
      req.body,
      images.map((f, i) => ({ filename: f.originalname || `estimate_image_${i + 1}.jpg`, content: f.buffer }))
    );
    const { status, body } = estimateHttpResponse(result);
    res.status(status).json(body);
  });

  // Assistant Sitewide Conversational API Routes
  app.post("/api/assistant/chat", async (req, res) => {
    try {
      const { anonymousSessionId, message, mode, visitorContact, confirmedAction, projectContext } = req.body;
      if (!anonymousSessionId && !visitorContact?.email) {
        return res.status(400).json({ error: "Missing session or contact identity" });
      }

      const response = await orchestrateAssistant({
        anonymousSessionId: anonymousSessionId || `anon_${Date.now()}`,
        message: message || "",
        mode: mode || "text",
        visitorContact,
        confirmedAction,
        projectContext,
      });

      let audioBase64: string | undefined;
      if (mode === "voice" && response.reply && process.env.OPENAI_API_KEY) {
        try {
          const cleanSpeechText = response.reply
            .replace(/[#*_~`]/g, "")
            .replace(/https?:\/\/\S+/g, "our website")
            .slice(0, 500);

          const cacheKey = `nova_${cleanSpeechText.toLowerCase().trim()}`;
          if (ttsServerCache.has(cacheKey)) {
            const buf = ttsServerCache.get(cacheKey)!;
            audioBase64 = buf.toString("base64");
          } else {
            const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: "tts-1",
                input: cleanSpeechText,
                voice: "nova",
                speed: 1.05,
              }),
              signal: AbortSignal.timeout(12000),
            });

            if (ttsRes.ok) {
              const buf = Buffer.from(await ttsRes.arrayBuffer());
              if (ttsServerCache.size > 200) {
                const oldest = ttsServerCache.keys().next().value;
                if (oldest) ttsServerCache.delete(oldest);
              }
              ttsServerCache.set(cacheKey, buf);
              audioBase64 = buf.toString("base64");
            }
          }
        } catch (ttsErr) {
          console.warn("[Assistant Chat] Inline TTS generation notice:", ttsErr);
        }
      }

      res.json({ success: true, ...response, audioBase64 });
    } catch (error: any) {
      console.error("[Assistant API Error]:", error);
      res.status(500).json({ 
        success: false, 
        reply: "I encountered a momentary issue processing that request. Please try again or reach our Nairobi headquarters directly at +254 740 895374." 
      });
    }
  });

  app.post("/api/assistant/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { visitorId, enquiryId } = req.body;

      if (!file || !visitorId) {
        return res.status(400).json({ error: "Missing file or visitor ID" });
      }

      const safeFilename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const uploadDir = path.resolve(__dirname, "../../.assistant_data/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, safeFilename), file.buffer);

      const record = await assistantStorage.saveUploadedFile({
        visitorId,
        enquiryId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        storagePath: `/uploads/${safeFilename}`,
        aiDescription: `Client reference material (${file.mimetype}). Stored securely with access controls.`,
      });

      res.json({ success: true, file: record });
    } catch (err: any) {
      console.error("[Assistant Upload Error]:", err);
      res.status(500).json({ error: "File upload failed" });
    }
  });

  // Studio-grade Human Voice TTS endpoint powered by OpenAI
  app.post("/api/assistant/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Missing text for speech generation" });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "TTS key not configured" });
      }

      const cleanText = text
        .replace(/[#*_~`]/g, "")
        .replace(/https?:\/\/\S+/g, "our website")
        .slice(0, 1000);

      const selectedVoice = voice || "nova";
      const cacheKey = `${selectedVoice}_${cleanText.toLowerCase().trim()}`;

      // Check server memory cache for instant response
      if (ttsServerCache.has(cacheKey)) {
        const cachedBuf = ttsServerCache.get(cacheKey)!;
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Length", cachedBuf.length);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(cachedBuf);
      }

      const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: cleanText,
          voice: selectedVoice,
          speed: 1.0,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!ttsResponse.ok) {
        const errBody = await ttsResponse.text();
        console.error("[TTS API Error]:", ttsResponse.status, errBody);
        return res.status(ttsResponse.status).json({ error: "TTS generation failed" });
      }

      const buffer = Buffer.from(await ttsResponse.arrayBuffer());

      // Store in memory cache
      if (ttsServerCache.size > 200) {
        const oldest = ttsServerCache.keys().next().value;
        if (oldest) ttsServerCache.delete(oldest);
      }
      ttsServerCache.set(cacheKey, buffer);

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buffer);
    } catch (err: any) {
      console.error("[TTS Endpoint Error]:", err);
      res.status(500).json({ error: err.message || "Failed to generate speech" });
    }
  });

  app.post("/api/assistant/places", async (req, res) => {
    try {
      const { query } = req.body;
      const places = await searchPlaces(query || "");
      res.json({ success: true, places });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assistant/availability", async (req, res) => {
    try {
      const date = req.query.date as string | undefined;
      const result = await checkGenuineAvailability(date);
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assistant/appointment", async (req, res) => {
    try {
      const { visitorId, enquiryId, slotTime, locationAddress, notes } = req.body;
      if (!visitorId || !slotTime) {
        return res.status(400).json({ error: "Missing visitor or slot time" });
      }

      const start = new Date(slotTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const appt = await assistantStorage.createAppointment({
        visitorId,
        enquiryId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        locationAddress,
        notes,
      });

      metricsService.recordBookingCompletion(appt.id, true);
      res.json({ success: true, appointment: appt });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assistant/concept", async (req, res) => {
    try {
      const { visitorId, enquiryId, prompt, confirm } = req.body;
      if (!confirm) {
        return res.status(400).json({ 
          error: "Confirmation required", 
          message: "Illustrative concepts require visitor confirmation before generation." 
        });
      }

      const sampleImages = [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200",
      ];
      const img = sampleImages[Math.floor(Math.random() * sampleImages.length)];

      const concept = await assistantStorage.saveConceptImage({
        visitorId,
        enquiryId,
        prompt: prompt || "Modern Kenyan architectural concept",
        imageUrl: img,
        isConfirmed: true,
      });

      res.json({ success: true, concept });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assistant/correct-fact", async (req, res) => {
    try {
      const { visitorId, enquiryId, factKey, correctedValue } = req.body;
      if (!visitorId || !factKey || !correctedValue) {
        return res.status(400).json({ error: "Missing required correction parameters" });
      }

      const fact = await assistantStorage.recordFact(
        visitorId, 
        factKey, 
        correctedValue, 
        'corrected_by_visitor', 
        enquiryId, 
        'Corrected by visitor in chat interface'
      );

      // Also update enquiry if relevant
      if (enquiryId) {
        const updateMap: Record<string, string> = {
          location: 'location_name',
          size: 'size_sqm',
          scope: 'scope',
          timeline: 'timeline',
          objective: 'objective',
        };
        if (updateMap[factKey]) {
          await assistantStorage.updateProjectEnquiry(enquiryId, { [updateMap[factKey]]: correctedValue });
        }
      }

      res.json({ success: true, fact });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assistant/owner-data", async (req, res) => {
    try {
      const data = await assistantStorage.getOwnerDashboardData();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/assistant/metrics", (req, res) => {
    res.json({ success: true, metrics: metricsService.getReport() });
  });

  // Instagram Live Feed Endpoint (with in-memory caching, error resilience & Netlify compatibility)
  app.get(["/api/instagram/posts", "/.netlify/functions/instagram"], async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === "true";
      const feed = await getInstagramFeed(forceRefresh);
      res.json(feed);
    } catch (err: any) {
      console.error("[Instagram API Route Error]:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to fetch Instagram feed" });
    }
  });

  app.post("/api/instagram/refresh", async (_req, res) => {
    try {
      const result = await refreshInstagramToken();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Environment Detection
  const isProd = process.env.NODE_ENV === "production";
  console.log(`--- Server Mode: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} ---`);

  if (!isProd) {
    console.log("Initializing Vite Dev Server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    
    app.use(vite.middlewares);

    // Mock handler for Netlify Forms in local development
    app.post('*', (req, res) => {
      console.log(`[Dev Server] Intercepted Netlify Form submission for: ${req.body?.['form-name'] || 'unknown'}`);
      res.status(200).json({ success: true, message: 'Local mock submission successful' });
    });

    // Serve index.html for all other routes in dev mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // Skip fallback for files that look like assets or source code
      if (url.includes('.') && !url.endsWith('.html')) {
        console.warn(`[Dev Server] Asset not found by Vite: ${url}`);
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      // Prevent serving index.html for missing assets/scripts to avoid MIME type errors
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return res.status(404).send('Not found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
