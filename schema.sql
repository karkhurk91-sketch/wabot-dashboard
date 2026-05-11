--
-- PostgreSQL database dump
--

\restrict z1V1GVwUUUabCnQiUcqxnluYw4jWXvHVmyXMgzcf4JlNtmWjpo0ktyOd6LL9m9Y

-- Dumped from database version 14.22 (Homebrew)
-- Dumped by pg_dump version 14.22 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.user_permissions DROP CONSTRAINT user_permissions_user_id_fkey;
ALTER TABLE ONLY public.user_permissions DROP CONSTRAINT user_permissions_permission_id_fkey;
ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_organization_id_fkey;
ALTER TABLE ONLY public.social_posts DROP CONSTRAINT social_posts_campaign_id_fkey;
ALTER TABLE ONLY public.social_ad_campaigns DROP CONSTRAINT social_ad_campaigns_organization_id_fkey;
ALTER TABLE ONLY public.social_accounts DROP CONSTRAINT social_accounts_organization_id_fkey;
ALTER TABLE ONLY public.partners DROP CONSTRAINT partners_user_id_fkey;
ALTER TABLE ONLY public.partners DROP CONSTRAINT partners_created_by_fkey;
ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_partner_id_fkey;
ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_created_by_fkey;
ALTER TABLE ONLY public.organization_prompts DROP CONSTRAINT organization_prompts_organization_id_fkey;
ALTER TABLE ONLY public.organization_channels DROP CONSTRAINT organization_channels_organization_id_fkey;
ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_human_agent_id_fkey;
ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_conversation_id_fkey;
ALTER TABLE ONLY public.leads DROP CONSTRAINT leads_organization_id_fkey;
ALTER TABLE ONLY public.leads DROP CONSTRAINT leads_conversation_id_fkey;
ALTER TABLE ONLY public.knowledge_documents DROP CONSTRAINT knowledge_documents_organization_id_fkey;
ALTER TABLE ONLY public.knowledge_chunks DROP CONSTRAINT knowledge_chunks_organization_id_fkey;
ALTER TABLE ONLY public.knowledge_chunks DROP CONSTRAINT knowledge_chunks_document_id_fkey;
ALTER TABLE ONLY public.leads DROP CONSTRAINT fk_leads_campaign;
ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_organization_id_fkey;
ALTER TABLE ONLY public.conversations DROP CONSTRAINT conversations_organization_id_fkey;
ALTER TABLE ONLY public.conversations DROP CONSTRAINT conversations_campaign_id_fkey;
ALTER TABLE ONLY public.conversations DROP CONSTRAINT conversations_assigned_agent_id_fkey;
ALTER TABLE ONLY public.conversation_tags DROP CONSTRAINT conversation_tags_tag_id_fkey;
ALTER TABLE ONLY public.conversation_tags DROP CONSTRAINT conversation_tags_conversation_id_fkey;
ALTER TABLE ONLY public.conversation_notes DROP CONSTRAINT conversation_notes_conversation_id_fkey;
ALTER TABLE ONLY public.conversation_notes DROP CONSTRAINT conversation_notes_agent_id_fkey;
ALTER TABLE ONLY public.campaigns DROP CONSTRAINT campaigns_organization_id_fkey;
ALTER TABLE ONLY public.campaign_meta DROP CONSTRAINT campaign_meta_campaign_id_fkey;
ALTER TABLE ONLY public.campaign_creatives DROP CONSTRAINT campaign_creatives_campaign_id_fkey;
ALTER TABLE ONLY public.broadcast_templates DROP CONSTRAINT broadcast_templates_organization_id_fkey;
ALTER TABLE ONLY public.broadcast_history DROP CONSTRAINT broadcast_history_template_id_fkey;
ALTER TABLE ONLY public.broadcast_history DROP CONSTRAINT broadcast_history_organization_id_fkey;
ALTER TABLE ONLY public.bookings DROP CONSTRAINT bookings_organization_id_fkey;
ALTER TABLE ONLY public.ai_configurations DROP CONSTRAINT ai_configurations_organization_id_fkey;
DROP INDEX public.uq_customers_org_phone_deleted;
DROP INDEX public.ix_customers_org_phone;
DROP INDEX public.idx_partners_user_id;
DROP INDEX public.idx_organizations_partner_id;
DROP INDEX public.idx_org_prompts_org;
DROP INDEX public.idx_org_channels_type;
DROP INDEX public.idx_org_channels_org;
DROP INDEX public.idx_messages_status;
DROP INDEX public.idx_messages_channel;
DROP INDEX public.idx_message_logs_org;
DROP INDEX public.idx_knowledge_chunks_embedding;
DROP INDEX public.idx_kd_content_fts;
DROP INDEX public.idx_blogs_slug;
DROP INDEX public.idx_blogs_published;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
ALTER TABLE ONLY public.user_permissions DROP CONSTRAINT user_permissions_pkey;
ALTER TABLE ONLY public.conversations DROP CONSTRAINT unique_customer_per_org;
ALTER TABLE ONLY public.tags DROP CONSTRAINT tags_pkey;
ALTER TABLE ONLY public.social_posts DROP CONSTRAINT social_posts_pkey;
ALTER TABLE ONLY public.social_ad_campaigns DROP CONSTRAINT social_ad_campaigns_pkey;
ALTER TABLE ONLY public.social_accounts DROP CONSTRAINT social_accounts_pkey;
ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_pkey;
ALTER TABLE ONLY public.permissions DROP CONSTRAINT permissions_name_key;
ALTER TABLE ONLY public.partners DROP CONSTRAINT partners_pkey;
ALTER TABLE ONLY public.organizations DROP CONSTRAINT organizations_pkey;
ALTER TABLE ONLY public.organization_prompts DROP CONSTRAINT organization_prompts_pkey;
ALTER TABLE ONLY public.organization_channels DROP CONSTRAINT organization_channels_pkey;
ALTER TABLE ONLY public.organization_channels DROP CONSTRAINT organization_channels_organization_id_channel_type_key;
ALTER TABLE ONLY public.nano_tasks DROP CONSTRAINT nano_tasks_pkey;
ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
ALTER TABLE ONLY public.message_logs DROP CONSTRAINT message_logs_pkey;
ALTER TABLE ONLY public.leads DROP CONSTRAINT leads_pkey;
ALTER TABLE ONLY public.knowledge_documents DROP CONSTRAINT knowledge_documents_pkey;
ALTER TABLE ONLY public.knowledge_chunks DROP CONSTRAINT knowledge_chunks_pkey;
ALTER TABLE ONLY public.customers DROP CONSTRAINT customers_pkey;
ALTER TABLE ONLY public.conversations DROP CONSTRAINT conversations_pkey;
ALTER TABLE ONLY public.conversation_tags DROP CONSTRAINT conversation_tags_pkey;
ALTER TABLE ONLY public.conversation_notes DROP CONSTRAINT conversation_notes_pkey;
ALTER TABLE ONLY public.campaigns DROP CONSTRAINT campaigns_pkey;
ALTER TABLE ONLY public.campaign_meta DROP CONSTRAINT campaign_meta_pkey;
ALTER TABLE ONLY public.campaign_creatives DROP CONSTRAINT campaign_creatives_pkey;
ALTER TABLE ONLY public.broadcast_templates DROP CONSTRAINT broadcast_templates_pkey;
ALTER TABLE ONLY public.broadcast_history DROP CONSTRAINT broadcast_history_pkey;
ALTER TABLE ONLY public.bookings DROP CONSTRAINT bookings_pkey;
ALTER TABLE ONLY public.blogs DROP CONSTRAINT blogs_slug_key;
ALTER TABLE ONLY public.blogs DROP CONSTRAINT blogs_pkey;
ALTER TABLE ONLY public.ai_configurations DROP CONSTRAINT ai_configurations_pkey;
ALTER TABLE ONLY public.ai_configurations DROP CONSTRAINT ai_configurations_organization_id_key;
DROP TABLE public.users;
DROP TABLE public.user_permissions;
DROP TABLE public.tags;
DROP TABLE public.social_posts;
DROP TABLE public.social_ad_campaigns;
DROP TABLE public.social_accounts;
DROP TABLE public.permissions;
DROP TABLE public.partners;
DROP TABLE public.organizations;
DROP TABLE public.organization_prompts;
DROP TABLE public.organization_channels;
DROP TABLE public.nano_tasks;
DROP TABLE public.messages;
DROP TABLE public.message_logs;
DROP TABLE public.leads;
DROP TABLE public.knowledge_documents;
DROP TABLE public.knowledge_chunks;
DROP TABLE public.customers;
DROP TABLE public.conversations;
DROP TABLE public.conversation_tags;
DROP TABLE public.conversation_notes;
DROP TABLE public.campaigns;
DROP TABLE public.campaign_meta;
DROP TABLE public.campaign_creatives;
DROP TABLE public.broadcast_templates;
DROP TABLE public.broadcast_history;
DROP TABLE public.bookings;
DROP TABLE public.blogs;
DROP TABLE public.ai_configurations;
DROP EXTENSION vector;
DROP EXTENSION "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_configurations; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.ai_configurations (
    id uuid NOT NULL,
    organization_id uuid,
    system_prompt text,
    temperature double precision,
    max_tokens integer,
    model_name character varying(50),
    enable_lead_capture boolean,
    enable_auto_escalation boolean,
    escalation_keywords character varying[],
    updated_at timestamp with time zone
);


ALTER TABLE public.ai_configurations OWNER TO vivek;

--
-- Name: blogs; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.blogs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description character varying(500),
    content text NOT NULL,
    image_url character varying(500),
    published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.blogs OWNER TO vivek;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.bookings (
    id uuid NOT NULL,
    organization_id uuid,
    customer_phone character varying(20) NOT NULL,
    customer_name character varying(255),
    service character varying(100),
    booking_date date,
    booking_time time without time zone,
    status character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.bookings OWNER TO vivek;

--
-- Name: broadcast_history; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.broadcast_history (
    id uuid NOT NULL,
    organization_id uuid,
    template_id uuid,
    recipient_count integer,
    sent_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.broadcast_history OWNER TO vivek;

--
-- Name: broadcast_templates; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.broadcast_templates (
    id uuid NOT NULL,
    organization_id uuid,
    name character varying(100) NOT NULL,
    content text NOT NULL,
    media_url text,
    status character varying(20),
    meta_template_id character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    meta_template_name character varying(100),
    language_code character varying(10) DEFAULT 'en_US'::character varying
);


ALTER TABLE public.broadcast_templates OWNER TO vivek;

--
-- Name: campaign_creatives; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.campaign_creatives (
    id uuid NOT NULL,
    campaign_id uuid,
    type character varying(20),
    content text,
    is_selected boolean,
    created_at timestamp with time zone DEFAULT now(),
    media_url text
);


ALTER TABLE public.campaign_creatives OWNER TO vivek;

--
-- Name: campaign_meta; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.campaign_meta (
    id uuid NOT NULL,
    campaign_id uuid,
    audience_suggestion text,
    budget_suggestion character varying(50),
    platform_suggestion character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.campaign_meta OWNER TO vivek;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.campaigns (
    id uuid NOT NULL,
    organization_id uuid,
    name character varying(255),
    product_name character varying(255),
    price character varying(50),
    location character varying(100),
    description text,
    whatsapp_link text,
    status character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.campaigns OWNER TO vivek;

--
-- Name: conversation_notes; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.conversation_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    agent_id uuid,
    note text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.conversation_notes OWNER TO vivek;

--
-- Name: conversation_tags; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.conversation_tags (
    conversation_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.conversation_tags OWNER TO vivek;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.conversations (
    id uuid NOT NULL,
    organization_id uuid,
    customer_phone_number character varying(20) NOT NULL,
    customer_name character varying(255),
    status character varying(20),
    lead_score integer,
    tags character varying[],
    started_at timestamp with time zone DEFAULT now(),
    last_message_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    service character varying(100),
    campaign_id uuid,
    reply_mode character varying(20) DEFAULT 'ai'::character varying,
    assigned_agent_id uuid,
    rule_state jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.conversations OWNER TO vivek;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    organization_id uuid,
    phone_number character varying(20) NOT NULL,
    name character varying(255),
    email character varying(255),
    notes text,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    fb_psid character varying(255),
    instagram_id character varying(255),
    telegram_chat_id character varying(255),
    country_code character varying(10),
    address text,
    pincode character varying(20),
    profession character varying(100),
    is_active boolean DEFAULT true
);


ALTER TABLE public.customers OWNER TO vivek;

--
-- Name: knowledge_chunks; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.knowledge_chunks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid,
    organization_id uuid,
    chunk_text text NOT NULL,
    chunk_index integer,
    embedding public.vector(1536),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.knowledge_chunks OWNER TO vivek;

--
-- Name: knowledge_documents; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.knowledge_documents (
    id uuid NOT NULL,
    organization_id uuid,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type character varying(50),
    status character varying(20),
    chunk_count integer,
    created_at timestamp with time zone DEFAULT now(),
    title character varying(255),
    description text,
    content text
);


ALTER TABLE public.knowledge_documents OWNER TO vivek;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.leads (
    id uuid NOT NULL,
    organization_id uuid,
    conversation_id uuid,
    customer_phone character varying(20) NOT NULL,
    customer_name character varying(255),
    email character varying(255),
    interest character varying(255),
    budget_range character varying(50),
    status character varying(20),
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    service character varying(100),
    lead_score integer DEFAULT 0,
    campaign_id uuid
);


ALTER TABLE public.leads OWNER TO vivek;

--
-- Name: message_logs; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.message_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid,
    channel character varying(50),
    direction character varying(10),
    status character varying(20),
    error text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.message_logs OWNER TO vivek;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    conversation_id uuid,
    direction character varying(10) NOT NULL,
    message_type character varying(20),
    content text NOT NULL,
    media_url text,
    is_ai_generated boolean,
    human_agent_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    channel character varying(50),
    external_id character varying(255),
    status character varying(20) DEFAULT 'sent'::character varying,
    whatsapp_message_id character varying(255)
);


ALTER TABLE public.messages OWNER TO vivek;

--
-- Name: nano_tasks; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.nano_tasks (
    id character varying(36) NOT NULL,
    task_name character varying(255) NOT NULL,
    payload text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    error text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.nano_tasks OWNER TO vivek;

--
-- Name: organization_channels; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.organization_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    channel_type character varying(50) NOT NULL,
    enabled boolean DEFAULT false,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.organization_channels OWNER TO vivek;

--
-- Name: organization_prompts; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.organization_prompts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    prompt_text text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.organization_prompts OWNER TO vivek;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    business_type character varying(100),
    status character varying(20),
    plan character varying(50),
    settings json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    marketing_message_count integer DEFAULT 0,
    utility_message_count integer DEFAULT 0,
    last_count_reset date DEFAULT CURRENT_DATE,
    whatsapp_phone_number character varying(100),
    partner_id uuid,
    created_by uuid
);


ALTER TABLE public.organizations OWNER TO vivek;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.partners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid
);


ALTER TABLE public.partners OWNER TO vivek;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.permissions OWNER TO vivek;

--
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.social_accounts (
    id uuid NOT NULL,
    organization_id uuid,
    platform character varying(50) NOT NULL,
    account_id character varying(255) NOT NULL,
    access_token text NOT NULL,
    token_expires_at timestamp with time zone,
    is_active boolean,
    settings json,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.social_accounts OWNER TO vivek;

--
-- Name: social_ad_campaigns; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.social_ad_campaigns (
    id uuid NOT NULL,
    organization_id uuid,
    platform character varying(50) NOT NULL,
    campaign_id character varying(255),
    adset_id character varying(255),
    ad_id character varying(255),
    lead_form_id character varying(255),
    name character varying(255),
    objective character varying(50),
    status character varying(50),
    daily_budget integer,
    targeting json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.social_ad_campaigns OWNER TO vivek;

--
-- Name: social_posts; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.social_posts (
    id uuid NOT NULL,
    campaign_id uuid,
    platform character varying(50) NOT NULL,
    post_id character varying(255),
    status character varying(50),
    content text,
    media_url text,
    published_at timestamp with time zone,
    platform_response json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.social_posts OWNER TO vivek;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#4F46E5'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tags OWNER TO vivek;

--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.user_permissions (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO vivek;

--
-- Name: users; Type: TABLE; Schema: public; Owner: vivek
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255),
    role character varying(50) NOT NULL,
    organization_id uuid,
    is_active boolean,
    last_login timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    email_verified boolean DEFAULT false,
    verification_token character varying(255)
);


ALTER TABLE public.users OWNER TO vivek;

--
-- Name: ai_configurations ai_configurations_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_organization_id_key UNIQUE (organization_id);


--
-- Name: ai_configurations ai_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_slug_key; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_slug_key UNIQUE (slug);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: broadcast_history broadcast_history_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.broadcast_history
    ADD CONSTRAINT broadcast_history_pkey PRIMARY KEY (id);


--
-- Name: broadcast_templates broadcast_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.broadcast_templates
    ADD CONSTRAINT broadcast_templates_pkey PRIMARY KEY (id);


--
-- Name: campaign_creatives campaign_creatives_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.campaign_creatives
    ADD CONSTRAINT campaign_creatives_pkey PRIMARY KEY (id);


--
-- Name: campaign_meta campaign_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.campaign_meta
    ADD CONSTRAINT campaign_meta_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: conversation_notes conversation_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversation_notes
    ADD CONSTRAINT conversation_notes_pkey PRIMARY KEY (id);


--
-- Name: conversation_tags conversation_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversation_tags
    ADD CONSTRAINT conversation_tags_pkey PRIMARY KEY (conversation_id, tag_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: knowledge_chunks knowledge_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_pkey PRIMARY KEY (id);


--
-- Name: knowledge_documents knowledge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: message_logs message_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.message_logs
    ADD CONSTRAINT message_logs_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: nano_tasks nano_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.nano_tasks
    ADD CONSTRAINT nano_tasks_pkey PRIMARY KEY (id);


--
-- Name: organization_channels organization_channels_organization_id_channel_type_key; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organization_channels
    ADD CONSTRAINT organization_channels_organization_id_channel_type_key UNIQUE (organization_id, channel_type);


--
-- Name: organization_channels organization_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organization_channels
    ADD CONSTRAINT organization_channels_pkey PRIMARY KEY (id);


--
-- Name: organization_prompts organization_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organization_prompts
    ADD CONSTRAINT organization_prompts_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_ad_campaigns social_ad_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.social_ad_campaigns
    ADD CONSTRAINT social_ad_campaigns_pkey PRIMARY KEY (id);


--
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: conversations unique_customer_per_org; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT unique_customer_per_org UNIQUE (organization_id, customer_phone_number);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_blogs_published; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_blogs_published ON public.blogs USING btree (published);


--
-- Name: idx_blogs_slug; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_blogs_slug ON public.blogs USING btree (slug);


--
-- Name: idx_kd_content_fts; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_kd_content_fts ON public.knowledge_documents USING gin (to_tsvector('english'::regconfig, content));


--
-- Name: idx_knowledge_chunks_embedding; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_knowledge_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding public.vector_cosine_ops);


--
-- Name: idx_message_logs_org; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_message_logs_org ON public.message_logs USING btree (organization_id);


--
-- Name: idx_messages_channel; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_messages_channel ON public.messages USING btree (channel);


--
-- Name: idx_messages_status; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_messages_status ON public.messages USING btree (status);


--
-- Name: idx_org_channels_org; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_org_channels_org ON public.organization_channels USING btree (organization_id);


--
-- Name: idx_org_channels_type; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_org_channels_type ON public.organization_channels USING btree (channel_type);


--
-- Name: idx_org_prompts_org; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_org_prompts_org ON public.organization_prompts USING btree (organization_id);


--
-- Name: idx_organizations_partner_id; Type: INDEX; Schema: public; Owner: vivek
--

CREATE INDEX idx_organizations_partner_id ON public.organizations USING btree (partner_id);


--
-- Name: idx_partners_user_id; Type: INDEX; Schema: public; Owner: vivek
--

CREATE UNIQUE INDEX idx_partners_user_id ON public.partners USING btree (user_id);


--
-- Name: ix_customers_org_phone; Type: INDEX; Schema: public; Owner: vivek
--

CREATE UNIQUE INDEX ix_customers_org_phone ON public.customers USING btree (organization_id, phone_number);


--
-- Name: uq_customers_org_phone_deleted; Type: INDEX; Schema: public; Owner: vivek
--

CREATE UNIQUE INDEX uq_customers_org_phone_deleted ON public.customers USING btree (organization_id, phone_number) WHERE (deleted_at IS NULL);


--
-- Name: ai_configurations ai_configurations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: broadcast_history broadcast_history_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.broadcast_history
    ADD CONSTRAINT broadcast_history_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: broadcast_history broadcast_history_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.broadcast_history
    ADD CONSTRAINT broadcast_history_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.broadcast_templates(id);


--
-- Name: broadcast_templates broadcast_templates_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.broadcast_templates
    ADD CONSTRAINT broadcast_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: campaign_creatives campaign_creatives_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.campaign_creatives
    ADD CONSTRAINT campaign_creatives_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_meta campaign_meta_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.campaign_meta
    ADD CONSTRAINT campaign_meta_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: conversation_notes conversation_notes_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversation_notes
    ADD CONSTRAINT conversation_notes_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: conversation_notes conversation_notes_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversation_notes
    ADD CONSTRAINT conversation_notes_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_tags conversation_tags_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversation_tags
    ADD CONSTRAINT conversation_tags_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_tags conversation_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversation_tags
    ADD CONSTRAINT conversation_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: conversations conversations_assigned_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_assigned_agent_id_fkey FOREIGN KEY (assigned_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: conversations conversations_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: conversations conversations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: customers customers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: leads fk_leads_campaign; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT fk_leads_campaign FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: knowledge_chunks knowledge_chunks_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.knowledge_documents(id) ON DELETE CASCADE;


--
-- Name: knowledge_chunks knowledge_chunks_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.knowledge_chunks
    ADD CONSTRAINT knowledge_chunks_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: knowledge_documents knowledge_documents_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.knowledge_documents
    ADD CONSTRAINT knowledge_documents_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: leads leads_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: leads leads_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_human_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_human_agent_id_fkey FOREIGN KEY (human_agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: organization_channels organization_channels_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organization_channels
    ADD CONSTRAINT organization_channels_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_prompts organization_prompts_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organization_prompts
    ADD CONSTRAINT organization_prompts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: organizations organizations_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE SET NULL;


--
-- Name: partners partners_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: partners partners_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: social_accounts social_accounts_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: social_ad_campaigns social_ad_campaigns_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.social_ad_campaigns
    ADD CONSTRAINT social_ad_campaigns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: social_posts social_posts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: tags tags_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vivek
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict z1V1GVwUUUabCnQiUcqxnluYw4jWXvHVmyXMgzcf4JlNtmWjpo0ktyOd6LL9m9Y

