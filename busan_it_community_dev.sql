--
-- PostgreSQL database dump
--

\restrict o7DykJBOuUja4YZHfaFP4RtLmjtHQOzbRbHSOlb46NL9UibN7pcDShhLTpzRdqk

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text,
    session_id uuid,
    event_name character varying(100) NOT NULL,
    event_version character varying(10) NOT NULL,
    page_path character varying(300),
    referrer_domain character varying(200),
    entity_type character varying(30),
    entity_id uuid,
    properties jsonb DEFAULT '{}'::jsonb NOT NULL,
    source character varying(20) NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: application_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.application_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    level character varying(20) NOT NULL,
    message character varying(300) NOT NULL,
    route character varying(300),
    method character varying(10),
    status character varying(20),
    user_id text,
    request_id character varying(120),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id text,
    actor_role character varying(30),
    action character varying(100) NOT NULL,
    target_type character varying(50),
    target_id text,
    reason character varying(500),
    request_id character varying(120),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(20) NOT NULL,
    title character varying(140) NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    author_user_id text NOT NULL,
    author_name character varying(80) NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_feedback_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_feedback_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feedback_id uuid NOT NULL,
    author_user_id text NOT NULL,
    author_name character varying(80) NOT NULL,
    body text NOT NULL,
    previous_status character varying(20),
    next_status character varying(20),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: deletion_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deletion_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    status character varying(20) NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    failure_code character varying(100)
);


--
-- Name: event_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    member_id text NOT NULL,
    participation_reason character varying(500),
    attendance_status character varying(30) DEFAULT 'registered'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: local_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.local_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    name character varying(80) NOT NULL,
    nickname character varying(30),
    phone_number character varying(30) NOT NULL,
    role character varying(20) DEFAULT 'member'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    terms_version character varying(30) NOT NULL,
    privacy_version character varying(30) NOT NULL,
    required_terms_accepted_at timestamp with time zone NOT NULL,
    email_verified_at timestamp with time zone,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: member_consents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_consents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    consent_type character varying(50) NOT NULL,
    policy_version character varying(30) NOT NULL,
    is_granted boolean NOT NULL,
    source character varying(30) NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: member_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    nickname character varying(30) NOT NULL,
    introduction character varying(500),
    job_category character varying(50),
    experience_range character varying(20),
    github_url character varying(300),
    portfolio_url character varying(300),
    profile_image_url character varying(500),
    metadata jsonb DEFAULT '{"activityAreas": [], "networkingGoals": [], "interestedTopics": [], "isOpenToNetworking": false}'::jsonb NOT NULL,
    is_profile_public boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    public_email character varying(255)
);


--
-- Name: offline_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offline_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(120) NOT NULL,
    slug character varying(140) NOT NULL,
    description text NOT NULL,
    location_name character varying(120) NOT NULL,
    address character varying(300),
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone,
    capacity integer NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    created_by_user_id text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    region character varying(80) DEFAULT '부산'::character varying NOT NULL,
    target_roles jsonb DEFAULT '[]'::jsonb NOT NULL,
    tech_topics jsonb DEFAULT '[]'::jsonb NOT NULL,
    participation_fee character varying(80) DEFAULT '무료'::character varying NOT NULL
);


--
-- Name: security_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.security_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text,
    event_type character varying(100) NOT NULL,
    severity character varying(20) NOT NULL,
    route character varying(300),
    request_id character varying(120),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	bdfad972fabf4e6aed0de3f4b5845f3f8046cdcbc4d7e3d7f681d2f90c29c1cd	1785303077146
2	3a83b0c1986c1e662273f5802b9e7c04505ac03b5973fb4a6d679a681f378f2d	1785304031992
3	30483481d4534994608880cf023ab41088f6062e48268edf36e42ca2c770022f	1785305637783
4	6b1001e529d27ff8f1e8848a7768763fc525bf6f61b497501085cc97584437ef	1785306811369
5	3c3d5651c140d26ee1881059385ce71f4d96ace1c42e3249e9879199071cb30a	1785380768821
6	61f846e9cf0e9c27a7171a6c776ddf6f1260a33808056365d9e2b0bb9d85976e	1785381746445
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analytics_events (id, user_id, session_id, event_name, event_version, page_path, referrer_domain, entity_type, entity_id, properties, source, occurred_at, received_at) FROM stdin;
b9262e64-62f6-4931-b50c-88aaab866151	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 06:44:08.781+00	2026-07-29 06:44:08.782556+00
c257c422-e707-4d70-9969-2d13e6d95af8	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-29 06:44:13.402+00	2026-07-29 06:44:13.403286+00
fa80f86c-a79d-4438-a391-7f5229e229e4	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_apply_clicked	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	web	2026-07-29 06:44:23.048+00	2026-07-29 06:44:23.048293+00
ee866227-7796-4fc0-a7c0-e1f8a5894794	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_registration_completed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{"attendanceStatus": "registered"}	web	2026-07-29 06:44:23.05+00	2026-07-29 06:44:23.050047+00
91056d9b-163b-4c8c-80d7-8345b04b8a6a	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-29 06:44:23.163+00	2026-07-29 06:44:23.16344+00
c8e647f6-2fc1-4545-b328-c30ee41fa619	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:10:59.874+00	2026-07-29 07:10:59.871177+00
ae6bca9c-ccf0-4ffc-8a02-b2bc7aa602ff	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-29 07:11:07.728+00	2026-07-29 07:11:07.724025+00
421742bc-71c1-4546-8aa3-072b0517857e	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:12:46.269+00	2026-07-29 07:12:46.280273+00
902b3054-9d9d-4948-9b10-e1496dba870c	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:13:13.675+00	2026-07-29 07:13:13.68667+00
98f624b2-5f5c-452f-aaa3-f2e58f1d84cf	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:13:31.757+00	2026-07-29 07:13:31.765358+00
3c416cf5-12a8-4c48-b736-120575a72212	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:13:35.717+00	2026-07-29 07:13:35.7201+00
ba880748-c5d9-4be2-9869-3a1133efd056	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:14:49.773+00	2026-07-29 07:14:49.789633+00
ce369bbd-ca84-418c-9419-78a2fa7f0494	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:15:49.876+00	2026-07-29 07:15:49.878055+00
da01eb3c-387d-4849-ad4e-97c123312375	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:15:49.962+00	2026-07-29 07:15:49.963489+00
0a7835d1-6a20-40fd-9dda-a715baa698c6	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:15:50.025+00	2026-07-29 07:15:50.025633+00
32f2958a-445c-4a82-978b-77a3782476b7	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:15:50.107+00	2026-07-29 07:15:50.107432+00
f454404a-cdfe-4ae5-adb1-aa7f6201d21c	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:15:50.23+00	2026-07-29 07:15:50.233121+00
1285f204-f1bd-4375-9149-da163c9827f7	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:15:50.443+00	2026-07-29 07:15:50.444447+00
b50a7992-2cc7-419a-ab07-e17991a9fd28	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:17:59.133+00	2026-07-29 07:17:59.134855+00
c95763e7-e2c6-4ad6-a50c-770d4e4f3d9a	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:19:04.741+00	2026-07-29 07:19:04.745536+00
ff1820a2-5948-4ca7-b2a9-161b1c9acdfd	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:28:23.835+00	2026-07-29 07:28:23.834389+00
584d8df6-afb2-461f-a168-70b3d39507a4	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:30:23.645+00	2026-07-29 07:30:23.641499+00
88194bab-6e14-47cf-a93f-d7675a8b424c	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:30:48.955+00	2026-07-29 07:30:48.951636+00
94771658-166a-498e-bd44-f346085cabbe	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:33:08.014+00	2026-07-29 07:33:08.015473+00
ad0e7e3d-1d99-4057-8995-fb2f4793f6a3	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:33:12.391+00	2026-07-29 07:33:12.391722+00
8e3beb69-b678-428d-8e8f-c9b0a2054fa2	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:33:53.172+00	2026-07-29 07:33:53.17332+00
d35e9d48-c555-423b-8ec9-542711f71621	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:34:36.481+00	2026-07-29 07:34:36.482519+00
1efb14c4-753f-4a68-8ace-3da14bb977e5	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:34:50.834+00	2026-07-29 07:34:50.835039+00
46ef0459-2d31-4183-9a06-986a0f2090e8	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:34:54.966+00	2026-07-29 07:34:54.970968+00
80adf54a-ad05-4888-aa46-8c954c9e0caa	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-29 07:53:38.838+00	2026-07-29 07:53:38.838504+00
693baeab-dd80-409f-b34f-7df03bcc8e4a	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-29 07:53:48.122+00	2026-07-29 07:53:48.139306+00
12990e24-8982-4d46-8e55-de419d31c74d	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	profile_completed	1	/profile	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{"hasGithubUrl": false, "hasPortfolioUrl": false, "isProfilePublic": true}	web	2026-07-29 07:54:04.406+00	2026-07-29 07:54:04.406127+00
37e06e11-0a03-4b16-a7bf-6211d00fdde2	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-29 07:54:04.492+00	2026-07-29 07:54:04.492233+00
4e37a174-0036-48fd-b6aa-b7d359d115cb	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-29 07:54:10.026+00	2026-07-29 07:54:10.027003+00
7aed2507-4f79-4179-821b-a649d6174e75	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-29 07:54:12.484+00	2026-07-29 07:54:12.484667+00
9cbf8c98-45b4-46fd-ba70-16b9f953df56	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-29 07:54:14.39+00	2026-07-29 07:54:14.391504+00
b308a289-d506-490d-91fc-873f2a145eca	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:54:22.164+00	2026-07-29 07:54:22.188485+00
b4677cbf-b61d-478b-8828-1418c65e4994	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:54:25.86+00	2026-07-29 07:54:25.86602+00
65e961c9-ef30-4a7e-8319-d9f2d0d8e17a	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-29 07:54:29.149+00	2026-07-29 07:54:29.149845+00
43420bff-1d80-49dc-af36-85fed788378a	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	profile_completed	1	/profile	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{"hasGithubUrl": false, "hasPortfolioUrl": false, "isProfilePublic": true}	web	2026-07-29 07:55:16.852+00	2026-07-29 07:55:16.851861+00
de421a6d-5c20-4b86-a654-955edb0128af	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-29 07:55:18.216+00	2026-07-29 07:55:18.215639+00
fd057382-9a03-402b-afa2-72646441a1f2	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-29 07:55:22.623+00	2026-07-29 07:55:22.638505+00
1cd825b8-d8b9-4893-9a34-965627572b05	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-29 07:55:26.214+00	2026-07-29 07:55:26.218402+00
bc9f04c6-5aae-4408-877a-78ff02a3ddb4	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-29 07:55:29.479+00	2026-07-29 07:55:29.479336+00
da6efc00-8804-4c14-9284-0383f11d59f4	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-29 07:55:30.774+00	2026-07-29 07:55:30.774454+00
44529575-2880-42b0-8299-395f556d1a91	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-29 07:55:32.129+00	2026-07-29 07:55:32.133921+00
a8ed6942-97e6-4417-ada7-2b7033175d81	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 02:48:39.591+00	2026-07-30 02:48:39.593116+00
78e147d5-c119-4a27-b593-7c39b909043a	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 02:48:44.055+00	2026-07-30 02:48:44.074016+00
6f724ee7-bc0d-4f0f-985e-cdffc9887507	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 02:55:46.182+00	2026-07-30 02:55:46.183019+00
8917728a-3536-4878-8419-b1077fb7d2b1	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 02:58:52.196+00	2026-07-30 02:58:52.19641+00
3b52fd3b-422f-44dc-9675-a2ff18ebeff2	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-30 02:58:59.691+00	2026-07-30 02:58:59.693027+00
86a0ee7f-7fb0-4d60-ad8e-aed812a0485a	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 02:59:53.77+00	2026-07-30 02:59:53.771607+00
8b7f6631-58bb-4304-ae3c-341bdf8acc00	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	signup_completed	1	/signup	\N	profile	\N	{}	web	2026-07-30 03:11:25.212+00	2026-07-30 03:11:25.211947+00
fe571d8a-2a23-4ede-a2a6-987e44376310	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 03:19:47.098+00	2026-07-30 03:19:47.11241+00
e1e0e62f-8ae1-44fa-95af-5d491caa837a	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 03:19:47.158+00	2026-07-30 03:19:47.16024+00
2d5eaaa3-4f20-45a7-a930-f1db0465f54b	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 03:19:47.361+00	2026-07-30 03:19:47.362771+00
0a8fcb41-2a53-4529-8614-e0f81426237e	\N	\N	member_profile_viewed	1	/members/3f9e54e0-0063-41e5-89f1-e68ce70d3865	\N	profile	3f9e54e0-0063-41e5-89f1-e68ce70d3865	{}	server	2026-07-30 03:19:52.985+00	2026-07-30 03:19:52.98674+00
acaeb381-1dcc-4b2d-9adb-b7bbda193072	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 03:20:20.476+00	2026-07-30 03:20:20.478887+00
ae1a5b3c-80d2-42e4-95ed-1eb952f41e18	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 03:20:25.774+00	2026-07-30 03:20:25.774492+00
d22bb95f-9f6a-472c-b421-0c435f5b4405	\N	\N	member_directory_viewed	1	/members	\N	\N	\N	{}	server	2026-07-30 05:57:35.984+00	2026-07-30 05:57:35.985125+00
9c820f7d-d8a2-454e-9a5f-6047441ae7b3	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 05:57:38.426+00	2026-07-30 05:57:38.42777+00
a2a8d48d-eb10-4ae3-a7be-7c2c04dfb418	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 05:58:37.165+00	2026-07-30 05:58:37.166231+00
480abd58-7c7b-438b-b840-4720d26d7609	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-30 05:58:40.901+00	2026-07-30 05:58:40.901963+00
a30c5380-9eae-4a51-be75-128211fc1530	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 05:58:45.758+00	2026-07-30 05:58:45.758606+00
7fedcc35-9958-43be-8281-8281b1e8adb9	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 07:18:37.96+00	2026-07-30 07:18:37.96076+00
6c2b0953-d1eb-4152-b76f-2a27634ddff0	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-30 07:18:41.124+00	2026-07-30 07:18:41.126703+00
79b9574a-8e86-473b-83ec-78656fb4b845	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-30 07:19:08.982+00	2026-07-30 07:19:08.981624+00
66c22885-d581-4c06-8a54-70da7f2b972e	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 07:20:38.499+00	2026-07-30 07:20:38.499002+00
737e835d-2029-4549-b133-d767f31e2c7f	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	event_detail_viewed	1	/events/next-js-busan-meetup	\N	event	d76b4c33-aad2-4272-9bca-c1e8167a45f6	{}	server	2026-07-30 07:20:43.536+00	2026-07-30 07:20:43.535508+00
6d9ee35f-208f-4875-96ff-d1c00ba5a919	\N	\N	event_list_viewed	1	/events	\N	\N	\N	{}	server	2026-07-30 07:22:40.339+00	2026-07-30 07:22:40.340741+00
\.


--
-- Data for Name: application_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.application_logs (id, level, message, route, method, status, user_id, request_id, metadata, occurred_at) FROM stdin;
e65836d0-ef41-499b-810b-08ae9ce16ffd	info	event application created	/api/events/d76b4c33-aad2-4272-9bca-c1e8167a45f6/apply	POST	201	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	{"eventId": "d76b4c33-aad2-4272-9bca-c1e8167a45f6", "attendanceStatus": "registered"}	2026-07-29 06:44:23.051+00
891e2a3a-ded6-4272-b351-4863aa589994	info	offline event created	/api/admin/events	POST	201	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	{"eventId": "448a0965-7aa9-41ee-a240-2d722728a1ff"}	2026-07-29 06:51:03.67+00
d362c3d1-b0a2-4adb-a59a-e1a09ceb403d	info	offline event updated	/api/admin/events/[eventId]	PATCH	200	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	{"eventId": "448a0965-7aa9-41ee-a240-2d722728a1ff"}	2026-07-29 07:29:27.4+00
d5b35f24-a652-44d8-a507-4cc00a612eb6	info	offline event updated	/api/admin/events/[eventId]	PATCH	200	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	{"eventId": "448a0965-7aa9-41ee-a240-2d722728a1ff"}	2026-07-29 07:30:45.32+00
609f2488-a668-42ae-8f28-277306879b10	info	member profile updated	/api/members/profile	PATCH	200	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	{"profileId": "3f9e54e0-0063-41e5-89f1-e68ce70d3865", "isProfilePublic": true}	2026-07-29 07:54:04.409+00
2ab9bd23-91d5-41f9-8d40-ebbcda3736ea	info	member profile updated	/api/members/profile	PATCH	200	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	\N	{"profileId": "3f9e54e0-0063-41e5-89f1-e68ce70d3865", "isProfilePublic": true}	2026-07-29 07:55:16.855+00
d155fc1a-e4db-4e33-a940-6e30e9360dfa	info	local user signed up	/api/auth/signup	POST	201	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	{}	2026-07-30 03:11:25.215+00
3faaa91b-8a22-41d7-b13e-367185c90556	info	community feedback created	/api/community/feedback	POST	201	4026ac0c-b939-4bd0-99a5-8544861ebbb7	\N	{"type": "feature", "feedbackId": "257020c0-fc9e-41a8-9e96-2e70bb509c2c"}	2026-07-30 03:17:32.204+00
9a643956-e568-49ae-b6b1-fec24818f54e	info	local user logged in	/api/auth/login	POST	200	1559747a-93e5-4de8-b4ab-2d194d2b316e	\N	{}	2026-07-30 03:18:11.552+00
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, actor_user_id, actor_role, action, target_type, target_id, reason, request_id, metadata, occurred_at) FROM stdin;
c5182cfa-535c-42c9-a1b4-c79a165283ce	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_seed_created	local_user	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	local seed	\N	{"source": "scripts/seed-admin"}	2026-07-29 05:57:19.408+00
c55d45cf-1ddc-4d81-89f6-c21c05151b5b	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_seed_updated	local_user	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	local seed	\N	{"source": "scripts/seed-admin"}	2026-07-29 05:57:54.024+00
dccb76fa-32bf-4f4f-83d3-778f4065d265	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "대시보드"}	2026-07-29 06:04:03.023+00
61ec1f46-7ad2-40da-aede-7ecc13846678	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "회원 관리"}	2026-07-29 06:04:03.035+00
652751fc-f52b-42cf-8a8a-c49bb495fdd9	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "보안 이벤트"}	2026-07-29 06:04:04.167+00
ca4b341a-8bdc-41aa-8dc9-29e488c24397	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "감사 로그"}	2026-07-29 06:04:04.986+00
287efe89-e150-43bf-b8f0-5ae0d2ddbc9b	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_users_refresh_clicked	admin_dashboard	\N	\N	\N	{"source": "admin_dashboard"}	2026-07-29 06:04:09.134+00
ffb8754d-a32d-4d9b-bca4-62113ca79293	1559747a-93e5-4de8-b4ab-2d194d2b316e	admin	admin_seed_created	local_user	1559747a-93e5-4de8-b4ab-2d194d2b316e	local seed	\N	{"source": "scripts/seed-admin"}	2026-07-29 06:43:43.684+00
625c958a-8975-457d-849d-cee4b5cdf37f	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "모임"}	2026-07-29 06:47:53.423+00
70e679b8-83dc-417a-aa71-0943cdd6d5d5	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "모임"}	2026-07-29 06:47:55.908+00
d04ac576-f70d-4ec4-a6b4-169a7e392716	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_form_submitted	offline_event	\N	\N	\N	{"title": "개발"}	2026-07-29 06:48:49.235+00
7a9b9a25-3378-4abc-95a0-0094df4a93d4	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_form_submitted	offline_event	\N	\N	\N	{"title": "개발"}	2026-07-29 06:48:58.53+00
fe481c83-66f8-405b-9391-bfa54ada56e9	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_form_submitted	offline_event	\N	\N	\N	{"title": "개발"}	2026-07-29 06:49:06.552+00
c05a4d56-b64f-46a0-bc4d-e67b703f205c	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "로그"}	2026-07-29 06:49:53.54+00
279f99f9-5a1b-4d4e-b652-2f1c95fd8dca	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "모임"}	2026-07-29 06:49:55.639+00
74359974-53dd-4784-bcfd-fbac2c0a4cb4	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "로그"}	2026-07-29 06:49:56.509+00
8e8347f5-679a-4432-96b3-5eabec268c4d	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_form_submitted	offline_event	\N	\N	\N	{"title": "부산 모임"}	2026-07-29 06:51:01.803+00
a124d751-39d4-4402-8c5e-8162b0332f21	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_offline_event_created	offline_event	448a0965-7aa9-41ee-a240-2d722728a1ff	\N	\N	{"title": "부산 모임", "status": "published"}	2026-07-29 06:51:03.664+00
77070722-27c3-408d-b7e8-bd2dbb252866	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "events"}	2026-07-29 07:11:18.55+00
0017ebf6-0193-4e6e-8ed8-e0b4c8e5210d	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "applications"}	2026-07-29 07:11:38.641+00
41d1b9f6-fede-4756-90db-a0549becfb06	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "logs"}	2026-07-29 07:11:39.974+00
1a4b98e6-c9a8-4b21-b173-7001e336fb7d	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "applications"}	2026-07-29 07:11:42.128+00
ab8e01ce-2413-4894-8ac5-f999a8770c7b	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "members"}	2026-07-29 07:11:51.373+00
c569506c-d2e9-4e8e-b7cb-e521faf89b05	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_api_users_opened	admin_api	\N	\N	\N	{"source": "admin_dashboard"}	2026-07-29 07:12:16.592+00
2bb4b75b-07af-4290-9b1a-5dfed6663055	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"label": "events"}	2026-07-29 07:12:24.839+00
064794a6-9b0a-432e-a745-536253d80d0e	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/applications"}	2026-07-29 07:19:24.603+00
70ad1873-6052-48a1-86af-a8d33eca1143	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/members"}	2026-07-29 07:28:01.921+00
27c3d4ab-a2ac-408b-81dc-8b9517712b83	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events"}	2026-07-29 07:28:59.671+00
3e591cd1-7685-497c-9a4b-51b7c446b4ac	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_edit_clicked	offline_event	448a0965-7aa9-41ee-a240-2d722728a1ff	\N	\N	{"title": "부산 모임"}	2026-07-29 07:29:05.559+00
e70c0f32-193c-43a7-b441-44a4eae3baba	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_offline_event_updated	offline_event	\N	\N	\N	{"title": "부산 모임"}	2026-07-29 07:29:24.798+00
5d1b7ba1-c20d-4f47-a363-ba473885248a	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_offline_event_updated	offline_event	448a0965-7aa9-41ee-a240-2d722728a1ff	\N	\N	{"title": "부산 모임", "status": "published"}	2026-07-29 07:29:27.397+00
af3279f9-f7a2-42a1-bdeb-4948b44b413c	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events/new"}	2026-07-29 07:29:29.585+00
3cc2a242-ff15-40ee-bb24-25d1c2423760	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/applications"}	2026-07-29 07:29:34.408+00
3cb9a5f4-2eac-4c05-aac0-0a8827380b45	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/members"}	2026-07-29 07:30:02.242+00
08cdf71b-f64e-4dbb-8df3-c50756f0556c	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events"}	2026-07-29 07:30:08.087+00
b727988a-3356-473d-9e47-df94f90c05fb	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_edit_clicked	offline_event	448a0965-7aa9-41ee-a240-2d722728a1ff	\N	\N	{"title": "부산 모임"}	2026-07-29 07:30:11.91+00
fef16c70-e956-4f0a-96cb-f878a6f83bd2	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events/new"}	2026-07-29 07:30:18.451+00
a2f85088-1de8-41f7-bbbf-68a1953021ff	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events"}	2026-07-29 07:30:29.111+00
4b138b36-309c-439a-928e-02c3994b1a19	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_event_edit_clicked	offline_event	448a0965-7aa9-41ee-a240-2d722728a1ff	\N	\N	{"title": "부산 모임"}	2026-07-29 07:30:32.58+00
7dc4fafe-e083-4766-a96d-a907fc2d6339	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_offline_event_updated	offline_event	\N	\N	\N	{"title": "부산 모임"}	2026-07-29 07:30:45.22+00
db0c7df9-bc75-4f75-9bc0-552a19f1b4eb	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin	admin_offline_event_updated	offline_event	448a0965-7aa9-41ee-a240-2d722728a1ff	\N	\N	{"title": "부산 모임", "status": "published"}	2026-07-29 07:30:45.316+00
5a0fb016-654a-418d-95ac-23538652f63c	1559747a-93e5-4de8-b4ab-2d194d2b316e	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/members"}	2026-07-30 03:18:18.027+00
c6648dbc-291d-40f7-9f29-ecd9abb43477	1559747a-93e5-4de8-b4ab-2d194d2b316e	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events"}	2026-07-30 03:18:24.154+00
afa6fd0f-ce02-48af-96ba-6a0244c9f1d6	1559747a-93e5-4de8-b4ab-2d194d2b316e	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/events/new"}	2026-07-30 03:18:27.34+00
24ba7ddb-a8b8-4e87-a33b-873577854b6b	1559747a-93e5-4de8-b4ab-2d194d2b316e	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/applications"}	2026-07-30 03:18:29.202+00
00a6b37b-10ee-4adf-82df-64c928557b40	1559747a-93e5-4de8-b4ab-2d194d2b316e	admin	admin_nav_clicked	admin_navigation	\N	\N	\N	{"path": "/admin/logs"}	2026-07-30 03:18:34.782+00
\.


--
-- Data for Name: community_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_feedback (id, type, title, description, status, author_user_id, author_name, metadata, created_at, updated_at) FROM stdin;
257020c0-fc9e-41a8-9e96-2e70bb509c2c	feature	잘만들자	ㄷㄷ 그니까 오류가	open	4026ac0c-b939-4bd0-99a5-8544861ebbb7	박성욱	{}	2026-07-30 03:17:32.197595+00	2026-07-30 03:17:32.197595+00
\.


--
-- Data for Name: community_feedback_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_feedback_comments (id, feedback_id, author_user_id, author_name, body, previous_status, next_status, created_at) FROM stdin;
\.


--
-- Data for Name: deletion_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deletion_jobs (id, user_id, status, requested_at, completed_at, failure_code) FROM stdin;
\.


--
-- Data for Name: event_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_applications (id, event_id, member_id, participation_reason, attendance_status, created_at, updated_at) FROM stdin;
889fbd20-9d4d-4c7d-b739-5fd7eb11a7f7	d76b4c33-aad2-4272-9bca-c1e8167a45f6	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	그냥이요	registered	2026-07-29 06:44:23.044638+00	2026-07-29 06:44:23.044638+00
\.


--
-- Data for Name: local_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.local_users (id, email, password_hash, name, nickname, phone_number, role, status, terms_version, privacy_version, required_terms_accepted_at, email_verified_at, last_login_at, created_at, updated_at) FROM stdin;
36b83621-2ed5-4fa9-acd3-a6f5d00699a0	admin@example.com	scrypt:QyuU2L_VR5MXNmsHQK-Q_Q:vmy0WKxKymboRXKRp1q-BvuOwa9mPc1ytnhQDTel_slKHZ5fUkcpSSOBcLwkOK0P_sI6ZQ_hf-0Z4GBqieTSPg	관리자	관리자	01000000000	admin	active	2026-07-29	2026-07-29	2026-07-29 05:57:19.408+00	2026-07-29 05:57:19.408+00	2026-07-29 05:58:54.177+00	2026-07-29 05:57:19.432558+00	2026-07-29 07:55:16.835+00
4026ac0c-b939-4bd0-99a5-8544861ebbb7	tjddnr633@naver.com	scrypt:S5zGgdx08K9yYXCmtvUs5g:33AHZsfdwrbeXug5yrGhNv9mJFuSb7HwGxmOzjAisk18hV4Vz7oGaeypatAb02WmVwPlLIkqqDZ2jgw77pqrYQ	박성욱	박성욱	01083328284	member	active	2026-07-29	2026-07-29	2026-07-30 03:11:25.155+00	\N	\N	2026-07-30 03:11:25.192772+00	2026-07-30 03:11:25.192772+00
1559747a-93e5-4de8-b4ab-2d194d2b316e	admin@naver.com	scrypt:SYGs7inJ9w2JCaUANnn6Aw:J--8HmSDA1HXDa-iCWIQZhlhYV6na-CjpfMhcu0lNQK7DN4JWxUT5CfQ3ndtE9sx3bZilpZujcauLWIR_tD5Qg	관리자s	관리자s	01099990001	admin	active	2026-07-29	2026-07-29	2026-07-29 06:43:43.684+00	2026-07-29 06:43:43.684+00	2026-07-30 03:18:11.543+00	2026-07-29 06:43:43.713973+00	2026-07-30 03:18:11.543+00
\.


--
-- Data for Name: member_consents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_consents (id, user_id, consent_type, policy_version, is_granted, source, occurred_at) FROM stdin;
90608376-d51f-4507-aa23-1c2eaa6ec9f3	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	terms	2026-07-29	t	seed	2026-07-29 05:57:19.408+00
01590e50-3486-4c3b-b65c-88854df7ecf3	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	privacy-notice	2026-07-29	t	seed	2026-07-29 05:57:19.408+00
70badd1e-3bb7-4523-84fa-c350aff6e85e	1559747a-93e5-4de8-b4ab-2d194d2b316e	terms	2026-07-29	t	seed	2026-07-29 06:43:43.684+00
e494e23b-5697-4d12-b884-73199758e6fd	1559747a-93e5-4de8-b4ab-2d194d2b316e	privacy-notice	2026-07-29	t	seed	2026-07-29 06:43:43.684+00
fdb7ef75-e603-4243-9766-a61fd707057e	4026ac0c-b939-4bd0-99a5-8544861ebbb7	terms	2026-07-29	t	signup	2026-07-30 03:11:25.155+00
a1842c05-1ec5-481f-9adb-3f6ff2235480	4026ac0c-b939-4bd0-99a5-8544861ebbb7	privacy-notice	2026-07-29	t	signup	2026-07-30 03:11:25.155+00
\.


--
-- Data for Name: member_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_profiles (id, user_id, nickname, introduction, job_category, experience_range, github_url, portfolio_url, profile_image_url, metadata, is_profile_public, created_at, updated_at, public_email) FROM stdin;
a20145b4-4452-431b-be1f-ee51d5bec845	1559747a-93e5-4de8-b4ab-2d194d2b316e	관리자s	\N	\N	\N	\N	\N	\N	{"activityAreas": [], "networkingGoals": [], "interestedTopics": [], "isOpenToNetworking": false}	f	2026-07-29 06:43:43.713973+00	2026-07-29 06:43:43.713973+00	\N
3f9e54e0-0063-41e5-89f1-e68ce70d3865	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	관리자	부산 취업하고 싶음	백엔드	주니어	\N	\N	\N	{"activityAreas": ["서면"], "networkingGoals": ["채용"], "interestedTopics": ["백엔드"], "isOpenToNetworking": true}	t	2026-07-29 05:57:19.432558+00	2026-07-29 07:55:16.835+00	\N
621ab76f-35ca-4767-9aa9-c1fd75badd4d	4026ac0c-b939-4bd0-99a5-8544861ebbb7	박성욱	\N	\N	\N	\N	\N	\N	{"activityAreas": [], "networkingGoals": [], "interestedTopics": [], "isOpenToNetworking": false}	f	2026-07-30 03:11:25.192772+00	2026-07-30 03:11:25.192772+00	\N
\.


--
-- Data for Name: offline_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offline_events (id, title, slug, description, location_name, address, starts_at, ends_at, capacity, status, created_by_user_id, metadata, created_at, updated_at, region, target_roles, tech_topics, participation_fee) FROM stdin;
d76b4c33-aad2-4272-9bca-c1e8167a45f6	Next.js 부산 밋업	next-js-busan-meetup	부산에서 Next.js와 TypeScript를 쓰는 개발자가 만나 최근 프로젝트 경험과 운영 고민을 나누는 소규모 모임입니다.	전포 카페	부산 부산진구 전포동	2026-08-05 10:30:00+00	2026-08-05 12:30:00+00	20	published	1559747a-93e5-4de8-b4ab-2d194d2b316e	{"source": "scripts/seed-admin"}	2026-07-29 06:43:43.713973+00	2026-07-29 06:43:43.713973+00	서면	["프론트엔드", "백엔드"]	["Next.js", "TypeScript", "React"]	무료
448a0965-7aa9-41ee-a240-2d722728a1ff	부산 모임	부산-모임-ms5q7fxh	모임해보자 아니면 모여서 모각코	창업	부산 서면	2026-07-14 00:00:00+00	2026-07-15 01:50:00+00	10	published	36b83621-2ed5-4fa9-acd3-a6f5d00699a0	{}	2026-07-29 06:51:03.654934+00	2026-07-29 07:30:45.31+00	서면	["프론트엔드", "기획자"]	["Next.js", "TypeScript"]	무료
\.


--
-- Data for Name: security_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.security_events (id, user_id, event_type, severity, route, request_id, metadata, occurred_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 6, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: application_logs application_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.application_logs
    ADD CONSTRAINT application_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: community_feedback_comments community_feedback_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_feedback_comments
    ADD CONSTRAINT community_feedback_comments_pkey PRIMARY KEY (id);


--
-- Name: community_feedback community_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_feedback
    ADD CONSTRAINT community_feedback_pkey PRIMARY KEY (id);


--
-- Name: deletion_jobs deletion_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deletion_jobs
    ADD CONSTRAINT deletion_jobs_pkey PRIMARY KEY (id);


--
-- Name: event_applications event_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_applications
    ADD CONSTRAINT event_applications_pkey PRIMARY KEY (id);


--
-- Name: local_users local_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_email_unique UNIQUE (email);


--
-- Name: local_users local_users_phone_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_phone_number_unique UNIQUE (phone_number);


--
-- Name: local_users local_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.local_users
    ADD CONSTRAINT local_users_pkey PRIMARY KEY (id);


--
-- Name: member_consents member_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_consents
    ADD CONSTRAINT member_consents_pkey PRIMARY KEY (id);


--
-- Name: member_profiles member_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_pkey PRIMARY KEY (id);


--
-- Name: member_profiles member_profiles_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_profiles
    ADD CONSTRAINT member_profiles_user_id_unique UNIQUE (user_id);


--
-- Name: offline_events offline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offline_events
    ADD CONSTRAINT offline_events_pkey PRIMARY KEY (id);


--
-- Name: offline_events offline_events_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offline_events
    ADD CONSTRAINT offline_events_slug_unique UNIQUE (slug);


--
-- Name: security_events security_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_pkey PRIMARY KEY (id);


--
-- Name: analytics_events_name_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_events_name_time_idx ON public.analytics_events USING btree (event_name, occurred_at);


--
-- Name: analytics_events_user_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_events_user_time_idx ON public.analytics_events USING btree (user_id, occurred_at);


--
-- Name: application_logs_level_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_logs_level_time_idx ON public.application_logs USING btree (level, occurred_at);


--
-- Name: application_logs_route_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX application_logs_route_time_idx ON public.application_logs USING btree (route, occurred_at);


--
-- Name: audit_logs_action_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action_time_idx ON public.audit_logs USING btree (action, occurred_at);


--
-- Name: audit_logs_actor_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_actor_time_idx ON public.audit_logs USING btree (actor_user_id, occurred_at);


--
-- Name: community_feedback_author_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_feedback_author_time_idx ON public.community_feedback USING btree (author_user_id, created_at);


--
-- Name: community_feedback_comments_author_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_feedback_comments_author_time_idx ON public.community_feedback_comments USING btree (author_user_id, created_at);


--
-- Name: community_feedback_comments_feedback_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_feedback_comments_feedback_time_idx ON public.community_feedback_comments USING btree (feedback_id, created_at);


--
-- Name: community_feedback_status_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_feedback_status_time_idx ON public.community_feedback USING btree (status, created_at);


--
-- Name: community_feedback_type_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_feedback_type_time_idx ON public.community_feedback USING btree (type, created_at);


--
-- Name: deletion_jobs_status_requested_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX deletion_jobs_status_requested_idx ON public.deletion_jobs USING btree (status, requested_at);


--
-- Name: event_applications_event_member_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_applications_event_member_idx ON public.event_applications USING btree (event_id, member_id);


--
-- Name: event_applications_event_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_applications_event_status_idx ON public.event_applications USING btree (event_id, attendance_status);


--
-- Name: event_applications_member_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_applications_member_idx ON public.event_applications USING btree (member_id);


--
-- Name: local_users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX local_users_email_idx ON public.local_users USING btree (email);


--
-- Name: local_users_phone_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX local_users_phone_number_idx ON public.local_users USING btree (phone_number);


--
-- Name: local_users_role_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX local_users_role_status_idx ON public.local_users USING btree (role, status);


--
-- Name: member_consents_user_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX member_consents_user_type_idx ON public.member_consents USING btree (user_id, consent_type);


--
-- Name: member_profiles_job_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX member_profiles_job_category_idx ON public.member_profiles USING btree (job_category);


--
-- Name: member_profiles_nickname_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX member_profiles_nickname_idx ON public.member_profiles USING btree (nickname);


--
-- Name: offline_events_created_by_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX offline_events_created_by_idx ON public.offline_events USING btree (created_by_user_id);


--
-- Name: offline_events_status_start_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX offline_events_status_start_idx ON public.offline_events USING btree (status, starts_at);


--
-- Name: security_events_type_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_events_type_time_idx ON public.security_events USING btree (event_type, occurred_at);


--
-- Name: security_events_user_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_events_user_time_idx ON public.security_events USING btree (user_id, occurred_at);


--
-- PostgreSQL database dump complete
--

\unrestrict o7DykJBOuUja4YZHfaFP4RtLmjtHQOzbRbHSOlb46NL9UibN7pcDShhLTpzRdqk

