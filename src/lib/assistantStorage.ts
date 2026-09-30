import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Client Setup (using environment variables)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('[Storage] Failed to initialize Supabase client:', err);
  }
}

// Native SQL Database via node:sqlite
const DATA_DIR = path.resolve(__dirname, '../../.assistant_data');
if (!fs.existsSync(DATA_DIR)) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}
}

const DB_PATH = path.join(DATA_DIR, 'yanhal_sql.db');

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let sqlDb: any = null;
try {
  // Use node:sqlite built-in engine
  const { DatabaseSync } = require('node:sqlite');
  sqlDb = new DatabaseSync(DB_PATH);
  console.log('[Storage] Native SQL database initialized at:', DB_PATH);

  // Execute Core Relational SQL Schema
  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      anonymous_session_id TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT,
      phone TEXT,
      metadata TEXT,
      created_at TEXT,
      updated_at TEXT,
      last_active_at TEXT
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      last_section_visited TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      mode TEXT NOT NULL,
      content TEXT NOT NULL,
      action_type TEXT,
      action_payload TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS project_enquiries (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      conversation_id TEXT,
      project_type TEXT NOT NULL,
      service_depth TEXT NOT NULL,
      objective TEXT,
      desired_outcome TEXT,
      scope TEXT,
      size_sqm REAL,
      budget_range TEXT,
      timeline TEXT,
      location_name TEXT,
      place_id TEXT,
      maps_url TEXT,
      preferences TEXT,
      status TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS estimator_results (
      id TEXT PRIMARY KEY,
      enquiry_id TEXT NOT NULL,
      base_amount REAL,
      min_kes REAL,
      max_kes REAL,
      min_usd REAL,
      max_usd REAL,
      rate_per_sqm REAL,
      multiplier REAL,
      currency_rate REAL,
      assumptions TEXT,
      calculated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS interests_requirements (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      enquiry_id TEXT,
      fact_key TEXT NOT NULL,
      fact_value TEXT NOT NULL,
      source_type TEXT NOT NULL,
      confidence REAL,
      provenance_note TEXT,
      is_confirmed INTEGER,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      enquiry_id TEXT,
      start_time TEXT,
      end_time TEXT,
      timezone TEXT,
      status TEXT,
      meeting_type TEXT,
      location_address TEXT,
      notes TEXT,
      visitor_confirmed_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      content_html TEXT NOT NULL,
      status TEXT NOT NULL,
      retry_count INTEGER,
      last_error TEXT,
      enquiry_id TEXT,
      sent_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      enquiry_id TEXT,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      storage_path TEXT NOT NULL,
      ai_description TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS concept_images (
      id TEXT PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      enquiry_id TEXT,
      prompt TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_confirmed INTEGER,
      created_at TEXT
    );
  `);
} catch (e) {
  console.warn('[Storage] node:sqlite error, using in-memory fallback:', e);
}

// Helper to sanitize table name for per-user designated SQL table
function getUserTableName(sessionId: string): string {
  const clean = sessionId.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  return `user_table_${clean}`;
}

export const assistantStorage = {
  getSqlDb() {
    return sqlDb;
  },

  // Designated SQL table per user to strictly isolate and preserve individual context
  async ensureUserDesignatedTable(sessionId: string) {
    if (!sqlDb) return;
    const tableName = getUserTableName(sessionId);
    try {
      sqlDb.exec(`
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          action_type TEXT,
          metadata TEXT,
          created_at TEXT NOT NULL
        );
      `);
    } catch (err) {
      console.error(`[Storage] Failed creating designated table ${tableName}:`, err);
    }
  },

  async appendToUserTable(sessionId: string, role: string, content: string, actionType?: string, metadata?: any) {
    await this.ensureUserDesignatedTable(sessionId);
    if (!sqlDb) return;
    const tableName = getUserTableName(sessionId);
    try {
      const stmt = sqlDb.prepare(`
        INSERT INTO ${tableName} (id, session_id, role, content, action_type, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        crypto.randomUUID(),
        sessionId,
        role,
        content,
        actionType || null,
        metadata ? JSON.stringify(metadata) : null,
        new Date().toISOString()
      );
    } catch (err) {
      console.error(`[Storage] Error appending to user table ${tableName}:`, err);
    }
  },

  async getUserHistory(sessionId: string): Promise<any[]> {
    await this.ensureUserDesignatedTable(sessionId);
    if (!sqlDb) return [];
    const tableName = getUserTableName(sessionId);
    try {
      const stmt = sqlDb.prepare(`SELECT * FROM ${tableName} ORDER BY created_at ASC`);
      return stmt.all();
    } catch (_) {
      return [];
    }
  },

  // 1. VISITORS
  async getOrCreateVisitor(anonymousSessionId: string, details?: { name?: string; email?: string; phone?: string }): Promise<any> {
    const now = new Date().toISOString();
    await this.ensureUserDesignatedTable(anonymousSessionId);

    if (sqlDb) {
      const existing = sqlDb.prepare('SELECT * FROM visitors WHERE anonymous_session_id = ?').get(anonymousSessionId);
      if (existing) {
        if (details?.name && !existing.name) {
          sqlDb.prepare('UPDATE visitors SET name = ?, updated_at = ? WHERE id = ?').run(details.name, now, existing.id);
          existing.name = details.name;
        }
        if (details?.email && !existing.email) {
          sqlDb.prepare('UPDATE visitors SET email = ?, updated_at = ? WHERE id = ?').run(details.email, now, existing.id);
          existing.email = details.email;
        }
        if (details?.phone && !existing.phone) {
          sqlDb.prepare('UPDATE visitors SET phone = ?, updated_at = ? WHERE id = ?').run(details.phone, now, existing.id);
          existing.phone = details.phone;
        }
        return existing;
      }

      const id = crypto.randomUUID();
      sqlDb.prepare(`
        INSERT INTO visitors (id, anonymous_session_id, email, name, phone, metadata, created_at, updated_at, last_active_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, anonymousSessionId, details?.email || null, details?.name || null, details?.phone || null, '{}', now, now, now);

      return {
        id,
        anonymous_session_id: anonymousSessionId,
        email: details?.email || null,
        name: details?.name || null,
        phone: details?.phone || null,
        created_at: now,
        updated_at: now,
      };
    }

    return {
      id: crypto.randomUUID(),
      anonymous_session_id: anonymousSessionId,
      email: details?.email || null,
      name: details?.name || null,
      phone: details?.phone || null,
      created_at: now,
      updated_at: now,
    };
  },

  // 2. CONVERSATIONS
  async getOrCreateConversation(visitorId: string, channel: 'text' | 'voice' | 'mixed' = 'mixed'): Promise<any> {
    const now = new Date().toISOString();
    if (sqlDb) {
      const existing = sqlDb.prepare("SELECT * FROM conversations WHERE visitor_id = ? AND status = 'active'").get(visitorId);
      if (existing) return existing;

      const id = crypto.randomUUID();
      sqlDb.prepare(`
        INSERT INTO conversations (id, visitor_id, channel, status, last_section_visited, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, visitorId, channel, 'active', null, now, now);

      return { id, visitor_id: visitorId, channel, status: 'active', created_at: now, updated_at: now };
    }

    return { id: crypto.randomUUID(), visitor_id: visitorId, channel, status: 'active', created_at: now, updated_at: now };
  },

  // 3. MESSAGES
  async saveMessage(conversationId: string, sender: 'visitor' | 'assistant' | 'system', content: string, mode: 'text' | 'voice' = 'text', actionType?: string, actionPayload?: any): Promise<any> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    if (sqlDb) {
      sqlDb.prepare(`
        INSERT INTO messages (id, conversation_id, sender, mode, content, action_type, action_payload, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, conversationId, sender, mode, content, actionType || null, actionPayload ? JSON.stringify(actionPayload) : null, now);
    }

    return { id, conversation_id: conversationId, sender, mode, content, action_type: actionType, action_payload: actionPayload, created_at: now };
  },

  async getMessages(conversationId: string): Promise<any[]> {
    if (sqlDb) {
      return sqlDb.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId);
    }
    return [];
  },

  // 4. PROJECT ENQUIRIES
  async getOrCreateProjectEnquiry(visitorId: string, conversationId?: string): Promise<any> {
    const now = new Date().toISOString();
    if (sqlDb) {
      const existing = sqlDb.prepare("SELECT * FROM project_enquiries WHERE visitor_id = ? AND status != 'reviewed'").get(visitorId);
      if (existing) return existing;

      const id = crypto.randomUUID();
      sqlDb.prepare(`
        INSERT INTO project_enquiries (
          id, visitor_id, conversation_id, project_type, service_depth, objective,
          desired_outcome, scope, size_sqm, budget_range, timeline, location_name,
          place_id, maps_url, preferences, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, visitorId, conversationId || null, 'construction', 'standard', '', '', '', 150, '', 'standard', 'Nairobi, Kenya', null, null, '{}', 'in_progress', now, now);

      return {
        id, visitor_id: visitorId, conversation_id: conversationId, project_type: 'construction',
        service_depth: 'standard', objective: '', scope: '', size_sqm: 150, budget_range: '',
        timeline: 'standard', location_name: 'Nairobi, Kenya', status: 'in_progress', created_at: now
      };
    }

    return {
      id: crypto.randomUUID(), visitor_id: visitorId, project_type: 'construction',
      service_depth: 'standard', size_sqm: 150, location_name: 'Nairobi, Kenya', status: 'in_progress'
    };
  },

  async updateProjectEnquiry(enquiryId: string, updates: Partial<any>): Promise<any> {
    if (sqlDb) {
      const now = new Date().toISOString();
      const keys = Object.keys(updates);
      if (keys.length > 0) {
        const setClause = keys.map(k => `${k} = ?`).join(', ') + ', updated_at = ?';
        const values = [...keys.map(k => updates[k]), now, enquiryId];
        sqlDb.prepare(`UPDATE project_enquiries SET ${setClause} WHERE id = ?`).run(...values);
      }
      return sqlDb.prepare('SELECT * FROM project_enquiries WHERE id = ?').get(enquiryId);
    }
    return updates;
  },

  // 5. ESTIMATOR RESULTS
  async saveEstimatorResult(enquiryId: string, result: any): Promise<any> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    if (sqlDb) {
      sqlDb.prepare(`
        INSERT INTO estimator_results (
          id, enquiry_id, base_amount, min_kes, max_kes, min_usd, max_usd,
          rate_per_sqm, multiplier, currency_rate, assumptions, calculated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, enquiryId, result.baseAmountKes, result.minKes, result.maxKes,
        result.minUsd, result.maxUsd, result.ratePerSqmKes, result.multiplier,
        result.currencyRate, JSON.stringify(result.assumptions), now
      );
    }
    return { id, enquiry_id: enquiryId, ...result };
  },

  // 6. PROVENANCE FACTS
  async recordFact(visitorId: string, factKey: string, factValue: string, sourceType: 'stated_by_visitor' | 'inferred_by_ai' | 'corrected_by_visitor', enquiryId?: string, note?: string): Promise<any> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const isConfirmed = sourceType !== 'inferred_by_ai' ? 1 : 0;
    const confidence = sourceType === 'inferred_by_ai' ? 0.85 : 1.0;

    if (sqlDb) {
      const existing = sqlDb.prepare('SELECT * FROM interests_requirements WHERE visitor_id = ? AND fact_key = ?').get(visitorId, factKey);
      if (existing) {
        sqlDb.prepare(`
          UPDATE interests_requirements
          SET fact_value = ?, source_type = ?, is_confirmed = ?, provenance_note = ?, updated_at = ?
          WHERE id = ?
        `).run(factValue, sourceType, isConfirmed, note || `Updated via ${sourceType}`, now, existing.id);
        return { ...existing, fact_value: factValue, source_type: sourceType, is_confirmed: isConfirmed };
      }

      sqlDb.prepare(`
        INSERT INTO interests_requirements (
          id, visitor_id, enquiry_id, fact_key, fact_value, source_type,
          confidence, provenance_note, is_confirmed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, visitorId, enquiryId || null, factKey, factValue, sourceType, confidence, note || `Recorded from ${sourceType}`, isConfirmed, now, now);
    }

    return { id, visitor_id: visitorId, fact_key: factKey, fact_value: factValue, source_type: sourceType };
  },

  async getFactsForVisitor(visitorId: string, enquiryId?: string): Promise<any[]> {
    if (sqlDb) {
      return sqlDb.prepare('SELECT * FROM interests_requirements WHERE visitor_id = ?').all(visitorId);
    }
    return [];
  },

  // 7. APPOINTMENTS
  async createAppointment(data: { visitorId: string; enquiryId?: string; startTime: string; endTime: string; meetingType?: string; locationAddress?: string; notes?: string }): Promise<any> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    if (sqlDb) {
      sqlDb.prepare(`
        INSERT INTO appointments (
          id, visitor_id, enquiry_id, start_time, end_time, timezone, status,
          meeting_type, location_address, notes, visitor_confirmed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.visitorId, data.enquiryId || null, data.startTime, data.endTime,
        'Africa/Nairobi', 'confirmed', data.meetingType || 'site_consultation',
        data.locationAddress || 'Yanhal South C Headquarters or Designated Site',
        data.notes || '', now, now, now
      );
    }
    return { id, ...data, status: 'confirmed', timezone: 'Africa/Nairobi', created_at: now };
  },

  async getConfirmedAppointments(): Promise<any[]> {
    if (sqlDb) {
      return sqlDb.prepare("SELECT * FROM appointments WHERE status = 'confirmed'").all();
    }
    return [];
  },

  // 8. NOTIFICATIONS
  async recordNotification(data: { type: string; recipientEmail: string; subject: string; contentHtml: string; status: 'sent' | 'failed'; error?: string; enquiryId?: string }): Promise<any> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    if (sqlDb) {
      sqlDb.prepare(`
        INSERT INTO notifications (
          id, type, recipient_email, subject, content_html, status, retry_count,
          last_error, enquiry_id, sent_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, data.type, data.recipientEmail, data.subject, data.contentHtml,
        data.status, data.status === 'failed' ? 1 : 0, data.error || null,
        data.enquiryId || null, data.status === 'sent' ? now : null, now, now
      );
    }
    return { id, ...data };
  },

  // 8.5 FILE UPLOADS & CONCEPTS
  async saveUploadedFile(data: { visitorId: string; enquiryId?: string; fileName: string; fileType: string; fileSize: number; storagePath: string; aiDescription?: string }): Promise<any> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    if (sqlDb) {
      sqlDb.prepare(`
        INSERT INTO uploaded_files (id, visitor_id, enquiry_id, file_name, file_type, file_size, storage_path, ai_description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.visitorId, data.enquiryId || null, data.fileName, data.fileType, data.fileSize, data.storagePath, data.aiDescription || '', now);
    }
    return { id, ...data, created_at: now };
  },

  async saveConceptImage(data: { visitorId: string; enquiryId?: string; prompt: string; imageUrl: string; isConfirmed?: boolean }): Promise<any> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    if (sqlDb) {
      sqlDb.prepare(`
        INSERT INTO concept_images (id, visitor_id, enquiry_id, prompt, image_url, is_confirmed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.visitorId, data.enquiryId || null, data.prompt, data.imageUrl, data.isConfirmed ? 1 : 0, now);
    }
    return { id, ...data, created_at: now };
  },

  // 9. OWNER DASHBOARD AGGREGATE
  async getOwnerDashboardData() {
    if (sqlDb) {
      return {
        visitors: sqlDb.prepare('SELECT * FROM visitors ORDER BY created_at DESC LIMIT 50').all(),
        conversations: sqlDb.prepare('SELECT * FROM conversations ORDER BY created_at DESC LIMIT 50').all(),
        messages: sqlDb.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100').all(),
        enquiries: sqlDb.prepare('SELECT * FROM project_enquiries ORDER BY created_at DESC LIMIT 50').all(),
        estimates: sqlDb.prepare('SELECT * FROM estimator_results ORDER BY calculated_at DESC LIMIT 50').all(),
        facts: sqlDb.prepare('SELECT * FROM interests_requirements ORDER BY created_at DESC LIMIT 100').all(),
        appointments: sqlDb.prepare('SELECT * FROM appointments ORDER BY created_at DESC LIMIT 50').all(),
        notifications: sqlDb.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all(),
      };
    }
    return { visitors: [], enquiries: [], appointments: [], notifications: [] };
  }
};
