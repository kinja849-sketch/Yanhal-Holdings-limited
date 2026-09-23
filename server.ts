import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { VERIFICATION_TEMPLATE, CONTACT_TEMPLATE, ESTIMATE_TEMPLATE } from "./src/emailTemplates.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const { name, phone, location, service, scope, size, budget, message, profileImageUrl } = req.body;
    const images = req.files as Express.Multer.File[];

    if (!name || !phone || !service) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const imageLink = images && images.length > 0 
      ? `<p><strong>Attached Images:</strong> ${images.length} image(s) attached to this email.</p>` 
      : "<p>No images provided</p>";

    const html = ESTIMATE_TEMPLATE
      .replace("{{name}}", name)
      .replace("{{phone}}", phone)
      .replace("{{location}}", location || "Not Specified")
      .replace("{{service}}", service)
      .replace("{{scope}}", scope || "Not Specified")
      .replace("{{size}}", size || "Not Specified")
      .replace("{{budget}}", budget || "Not Specified")
      .replace("{{message}}", message || "No additional message")
      .replace("{{image_link}}", imageLink)
      .replace("{{profile_url}}", profileImageUrl || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg");

    // Format attachments for Nodemailer
    const mailAttachments: any[] = [];
    if (images && images.length > 0) {
      images.forEach((file, index) => {
        mailAttachments.push({
          filename: file.originalname || `estimate_image_${index + 1}.jpg`,
          content: file.buffer
        });
      });
    }

    try {
      await transporter.sendMail({
        from: '"Yanhal Estimator" <system@yanhalholdings.com>',
        to: process.env.COMPANY_EMAIL || "Yanhalholdingslimited@gmail.com",
        subject: `New Project Estimate: ${service} - ${name}`,
        html: html,
        attachments: mailAttachments
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending estimate email:", error);
      res.status(500).json({ error: "Failed to send email" });
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
