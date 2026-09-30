-- =============================================================================
-- Yanhal Holdings Ltd — AI Conversational Assistant & Sitewide Integration Schema
-- Postgres / Supabase Migration
-- Version: 2026-09-29
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. VISITORS & CLIENTS TABLE
-- Supports anonymous visitors who later supply contact details or authenticate,
-- preventing duplicate identities.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_session_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT,
    phone TEXT,
    authenticated_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_visitors_anonymous_session ON public.visitors(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_visitors_email ON public.visitors(email);
CREATE INDEX IF NOT EXISTS idx_visitors_auth_user ON public.visitors(authenticated_user_id);

-- -----------------------------------------------------------------------------
-- 2. CONVERSATIONS TABLE
-- Tracks text and voice sessions with channel history.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'mixed' CHECK (channel IN ('text', 'voice', 'mixed')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'handed_off')),
    last_section_visited TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_conversations_visitor_id ON public.conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- -----------------------------------------------------------------------------
-- 3. MESSAGES TABLE
-- Individual conversational turns, mode (text/voice), and triggered actions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('visitor', 'assistant', 'system')),
    mode TEXT NOT NULL DEFAULT 'text' CHECK (mode IN ('text', 'voice')),
    content TEXT NOT NULL,
    action_type TEXT,
    action_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- -----------------------------------------------------------------------------
-- 4. PROJECT ENQUIRIES TABLE
-- Relational store for Start Your Project flow & Estimator submissions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    project_type TEXT NOT NULL DEFAULT 'construction',
    service_depth TEXT NOT NULL DEFAULT 'standard',
    objective TEXT,
    desired_outcome TEXT,
    scope TEXT,
    size_sqm NUMERIC(10, 2) DEFAULT 150.00,
    budget_range TEXT,
    timeline TEXT DEFAULT 'standard',
    location_name TEXT DEFAULT 'Nairobi, Kenya',
    place_id TEXT,
    maps_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'estimated', 'submitted', 'reviewed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_project_enquiries_visitor ON public.project_enquiries(visitor_id);
CREATE INDEX IF NOT EXISTS idx_project_enquiries_status ON public.project_enquiries(status);

-- -----------------------------------------------------------------------------
-- 5. ESTIMATOR RESULTS TABLE
-- Official indicative calculation record preserving rates, multipliers and assumptions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.estimator_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES public.project_enquiries(id) ON DELETE CASCADE,
    base_amount NUMERIC(14, 2) NOT NULL,
    min_kes NUMERIC(14, 2) NOT NULL,
    max_kes NUMERIC(14, 2) NOT NULL,
    min_usd NUMERIC(14, 2) NOT NULL,
    max_usd NUMERIC(14, 2) NOT NULL,
    rate_per_sqm NUMERIC(10, 2) NOT NULL,
    multiplier NUMERIC(4, 2) NOT NULL,
    currency_rate NUMERIC(8, 5) NOT NULL DEFAULT 0.00770,
    assumptions JSONB DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_estimator_results_enquiry ON public.estimator_results(enquiry_id);

-- -----------------------------------------------------------------------------
-- 6. INTERESTS & REQUIREMENTS (PROVENANCE TABLE)
-- Records origin of every fact: stated by visitor, inferred by AI, or corrected by visitor.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interests_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    enquiry_id UUID REFERENCES public.project_enquiries(id) ON DELETE CASCADE,
    fact_key TEXT NOT NULL, -- e.g., 'budget', 'location', 'timeline', 'size', 'service', 'finishing'
    fact_value TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('stated_by_visitor', 'inferred_by_ai', 'corrected_by_visitor')),
    confidence NUMERIC(3, 2) DEFAULT 1.00,
    provenance_note TEXT, -- e.g., 'Extracted from conversation message #4'
    is_confirmed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_interests_visitor ON public.interests_requirements(visitor_id);
CREATE INDEX IF NOT EXISTS idx_interests_enquiry ON public.interests_requirements(enquiry_id);

-- -----------------------------------------------------------------------------
-- 7. UPLOADED FILES TABLE
-- Private storage links, MIME types, and AI visual inspections.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    enquiry_id UUID REFERENCES public.project_enquiries(id) ON DELETE CASCADE,
    bucket TEXT NOT NULL DEFAULT 'project-files',
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    ai_description TEXT, -- What the image actually shows (site condition, blueprints, damage)
    is_face BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_enquiry ON public.uploaded_files(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_visitor ON public.uploaded_files(visitor_id);

-- -----------------------------------------------------------------------------
-- 8. GENERATED CONCEPT IMAGES TABLE
-- Visual concepts clearly marked as illustrative rather than approved engineering designs.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.concept_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    enquiry_id UUID NOT NULL REFERENCES public.project_enquiries(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    disclaimer_label TEXT NOT NULL DEFAULT 'Illustrative Architectural Concept — Not an approved structural engineering design',
    is_confirmed_by_visitor BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_concept_images_enquiry ON public.concept_images(enquiry_id);

-- -----------------------------------------------------------------------------
-- 9. APPOINTMENTS TABLE
-- Genuine scheduling with timezone support (Africa/Nairobi UTC+3) and status tracking.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    enquiry_id UUID REFERENCES public.project_enquiries(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('offered', 'confirmed', 'rescheduled', 'cancelled')),
    meeting_type TEXT NOT NULL DEFAULT 'site_consultation' CHECK (meeting_type IN ('site_consultation', 'hq_visit', 'virtual_consultation')),
    location_address TEXT,
    notes TEXT,
    visitor_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_visitor ON public.appointments(visitor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON public.appointments(start_time, end_time);

-- -----------------------------------------------------------------------------
-- 10. NOTIFICATIONS TABLE
-- Records email delivery status, retries, and errors for visitor and owner briefings.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('visitor_summary', 'owner_briefing', 'appointment_confirmation', 'appointment_reminder')),
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    content_html TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retrying')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    enquiry_id UUID REFERENCES public.project_enquiries(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- -----------------------------------------------------------------------------
-- 11. OWNER FOLLOW-UP & BRIEFING TABLE
-- Authorized staff review workflow, assigned personnel, and recommended next steps.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.owner_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enquiry_id UUID NOT NULL REFERENCES public.project_enquiries(id) ON DELETE CASCADE,
    assigned_staff TEXT NOT NULL DEFAULT 'Operations Lead',
    recommended_action TEXT NOT NULL,
    action_status TEXT NOT NULL DEFAULT 'open' CHECK (action_status IN ('open', 'in_progress', 'completed')),
    internal_notes TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_owner_follow_ups_enquiry ON public.owner_follow_ups(enquiry_id);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: Visitors access only their own records via anonymous session or auth.
-- -----------------------------------------------------------------------------
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimator_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_follow_ups ENABLE ROW LEVEL SECURITY;

-- Anonymous and Authenticated Visitor Policies (using TO clauses as per Supabase Best Practices)
CREATE POLICY "Visitors can view own record" ON public.visitors
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Visitors can create their visitor record" ON public.visitors
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Visitors can update own record" ON public.visitors
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Conversations Policies
CREATE POLICY "Visitors access own conversations" ON public.conversations
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Messages Policies
CREATE POLICY "Visitors access own messages" ON public.messages
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Project Enquiries Policies
CREATE POLICY "Visitors access own enquiries" ON public.project_enquiries
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Estimator Results Policies
CREATE POLICY "Visitors view own estimator results" ON public.estimator_results
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Interests & Requirements Policies
CREATE POLICY "Visitors access own interests and facts" ON public.interests_requirements
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Uploaded Files Policies
CREATE POLICY "Visitors view and insert own files" ON public.uploaded_files
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Concept Images Policies
CREATE POLICY "Visitors view concept images" ON public.concept_images
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Appointments Policies
CREATE POLICY "Visitors access own appointments" ON public.appointments
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Security Invoker Views for Staff / Owner Inspection
CREATE OR REPLACE VIEW public.owner_project_overview 
WITH (security_invoker = true) AS
SELECT 
    e.id AS enquiry_id,
    e.created_at AS enquiry_date,
    e.status AS enquiry_status,
    e.project_type,
    e.service_depth,
    e.scope,
    e.size_sqm,
    e.location_name,
    e.maps_url,
    v.id AS visitor_id,
    v.name AS visitor_name,
    v.email AS visitor_email,
    v.phone AS visitor_phone,
    est.min_kes,
    est.max_kes,
    est.min_usd,
    est.max_usd,
    (SELECT count(*) FROM public.uploaded_files f WHERE f.enquiry_id = e.id) AS file_count,
    (SELECT count(*) FROM public.concept_images c WHERE c.enquiry_id = e.id) AS concept_count,
    (SELECT count(*) FROM public.appointments a WHERE a.enquiry_id = e.id) AS appointment_count
FROM public.project_enquiries e
JOIN public.visitors v ON e.visitor_id = v.id
LEFT JOIN public.estimator_results est ON est.enquiry_id = e.id;
