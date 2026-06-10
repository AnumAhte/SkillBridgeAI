-- ════════════════════════════════════════════════════════════════════
--  SkillBridge AI — Supabase schema
--  Run in Supabase Dashboard → SQL Editor. Idempotent-ish (drops enums
--  guarded). Includes RLS + seed data so the demo works with zero deps.
-- ════════════════════════════════════════════════════════════════════

-- ── Enums ─────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('student','jobseeker','educator','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type language as enum ('uz','ru','en');
exception when duplicate_object then null; end $$;

do $$ begin
  create type roadmap_status as enum ('locked','active','completed');
exception when duplicate_object then null; end $$;

-- ── Profiles (1:1 with auth.users) ────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        user_role   not null default 'student',
  language    language     not null default 'en',
  locale      text         not null default 'uz-UZ',
  -- GDPR-aligned consent flags
  consent_data_processing boolean not null default false,
  consent_ai_recommend    boolean not null default false,
  created_at  timestamptz  not null default now()
);

-- Auto-create a profile when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Skill taxonomy & roles (powers gap analysis + matching) ───────────
create table if not exists skills (
  id        bigint generated always as identity primary key,
  slug      text unique not null,
  name      text not null,
  category  text not null            -- e.g. 'data','programming','soft'
);

create table if not exists roles (
  id        bigint generated always as identity primary key,
  slug      text unique not null,
  title     text not null,
  summary   text
);

create table if not exists job_role_skills (
  role_id   bigint references roles(id) on delete cascade,
  skill_id  bigint references skills(id) on delete cascade,
  weight    int not null default 1,    -- importance for readiness scoring
  primary key (role_id, skill_id)
);

-- ── Resumes & extracted skills ────────────────────────────────────────
create table if not exists resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  raw_text    text,
  storage_path text,
  created_at  timestamptz not null default now()
);

create table if not exists extracted_skills (
  id          uuid primary key default gen_random_uuid(),
  resume_id   uuid not null references resumes(id) on delete cascade,
  skill_name  text not null,
  proficiency text                    -- 'beginner'|'intermediate'|'advanced'
);

-- ── Career assessment → gaps → roadmap ────────────────────────────────
create table if not exists career_assessments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  resume_id       uuid references resumes(id) on delete set null,
  target_role     text not null,
  readiness_score int  not null check (readiness_score between 0 and 100),
  rationale       text,               -- AI transparency
  created_at      timestamptz not null default now()
);

create table if not exists skill_gaps (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references career_assessments(id) on delete cascade,
  skill_name    text not null,
  priority      int  not null default 1
);

create table if not exists learning_roadmaps (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid references career_assessments(id) on delete set null,
  title         text not null,
  created_at    timestamptz not null default now()
);

create table if not exists roadmap_items (
  id            uuid primary key default gen_random_uuid(),
  roadmap_id    uuid not null references learning_roadmaps(id) on delete cascade,
  position      int  not null,
  title         text not null,
  skill_name    text,
  est_weeks     int  default 2,
  status        roadmap_status not null default 'locked'
);

-- ── Courses / content (educator-authored or AI-generated) ─────────────
create table if not exists courses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete set null,
  title       text not null,
  level       text default 'beginner',
  language    language not null default 'en',
  ai_generated boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists modules (
  id        uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  position  int not null,
  title     text not null
);

create table if not exists lessons (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules(id) on delete cascade,
  position    int not null,
  title       text not null,
  content     text,
  difficulty  int not null default 2   -- 1 easy .. 3 advanced (adaptive)
);

create table if not exists quizzes (
  id        uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  questions jsonb not null default '[]'
);

-- ── Adaptive learning state ───────────────────────────────────────────
create table if not exists enrollments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  course_id  uuid not null references courses(id) on delete cascade,
  difficulty int not null default 2,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists lesson_progress (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  lesson_id  uuid not null references lessons(id) on delete cascade,
  completed  boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists quiz_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  quiz_id    uuid not null references quizzes(id) on delete cascade,
  score      int not null check (score between 0 and 100),
  created_at timestamptz not null default now()
);

-- ── Tutor sessions ────────────────────────────────────────────────────
create table if not exists tutor_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  language   language not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists tutor_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references tutor_sessions(id) on delete cascade,
  role       text not null,            -- 'user' | 'assistant'
  content    text not null,
  created_at timestamptz not null default now()
);

-- ── Jobs (mock dataset for MVP) + applications ────────────────────────
create table if not exists job_postings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  company     text not null,
  location    text default 'Tashkent',
  role_slug   text references roles(slug),
  is_internship boolean not null default false,
  required_skills text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists job_applications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  job_id     uuid not null references job_postings(id) on delete cascade,
  match_score int,
  created_at timestamptz not null default now()
);

-- ── Labor-market trends (mock dataset) ────────────────────────────────
create table if not exists market_trends (
  id          bigint generated always as identity primary key,
  skill_name  text not null,
  demand_index int not null,           -- 0..100
  growth_pct  int not null,            -- yoy
  category    text not null,           -- 'trending'|'emerging'
  captured_at date not null default current_date
);

-- ── AI audit log (transparency + GDPR auditability, no raw PII) ───────
create table if not exists ai_audit_log (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  feature     text not null,           -- 'skill_extraction' etc.
  model       text not null,
  prompt_hash text,                    -- hash only, not raw prompt
  latency_ms  int,
  used_fallback boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════
alter table profiles            enable row level security;
alter table resumes             enable row level security;
alter table extracted_skills    enable row level security;
alter table career_assessments  enable row level security;
alter table skill_gaps          enable row level security;
alter table learning_roadmaps   enable row level security;
alter table roadmap_items       enable row level security;
alter table enrollments         enable row level security;
alter table lesson_progress     enable row level security;
alter table quiz_attempts       enable row level security;
alter table tutor_sessions      enable row level security;
alter table tutor_messages      enable row level security;
alter table job_applications    enable row level security;
alter table courses             enable row level security;

-- Owner-only policies (drop-and-recreate for idempotency)
do $$
declare t text;
begin
  foreach t in array array[
    'resumes','career_assessments','learning_roadmaps','enrollments',
    'lesson_progress','quiz_attempts','tutor_sessions','job_applications'
  ] loop
    execute format('drop policy if exists own_%1$s on %1$s;', t);
    execute format(
      'create policy own_%1$s on %1$s for all to authenticated
         using (user_id = auth.uid()) with check (user_id = auth.uid());', t);
  end loop;
end $$;

drop policy if exists own_profile on profiles;
create policy own_profile on profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Courses: owner can write; everyone authenticated can read published content
drop policy if exists courses_read on courses;
create policy courses_read on courses for select to authenticated using (true);
drop policy if exists courses_write on courses;
create policy courses_write on courses for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Public reference/seed tables: readable by all authenticated users
alter table skills        enable row level security;
alter table roles         enable row level security;
alter table job_role_skills enable row level security;
alter table job_postings  enable row level security;
alter table market_trends enable row level security;
do $$
declare t text;
begin
  foreach t in array array['skills','roles','job_role_skills','job_postings','market_trends'] loop
    execute format('drop policy if exists read_%1$s on %1$s;', t);
    execute format('create policy read_%1$s on %1$s for select to authenticated using (true);', t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════
--  Seed data (makes the demo self-contained)
-- ════════════════════════════════════════════════════════════════════
insert into skills (slug,name,category) values
  ('sql','SQL','data'),('powerbi','Power BI','data'),
  ('statistics','Statistics','data'),('python','Python','programming'),
  ('excel','Excel','data'),('communication','Communication','soft'),
  ('javascript','JavaScript','programming'),('react','React','programming'),
  ('ml','Machine Learning','data')
on conflict (slug) do nothing;

insert into roles (slug,title,summary) values
  ('data-analyst','Data Analyst','Turns data into business insight.'),
  ('frontend-dev','Frontend Developer','Builds user-facing web apps.'),
  ('ml-engineer','ML Engineer','Builds and ships ML systems.')
on conflict (slug) do nothing;

insert into job_role_skills (role_id, skill_id, weight)
select r.id, s.id, w.weight from (values
  ('data-analyst','sql',3),('data-analyst','powerbi',3),
  ('data-analyst','statistics',2),('data-analyst','excel',1),
  ('frontend-dev','javascript',3),('frontend-dev','react',3),
  ('ml-engineer','python',3),('ml-engineer','ml',3),('ml-engineer','statistics',2)
) as w(role_slug, skill_slug, weight)
join roles r on r.slug = w.role_slug
join skills s on s.slug = w.skill_slug
on conflict do nothing;

insert into job_postings (title,company,location,role_slug,is_internship,required_skills) values
  ('Junior Data Analyst','IT Park Uzbekistan','Tashkent','data-analyst',false,'{SQL,Power BI,Excel}'),
  ('Data Analyst Intern','Uzum','Tashkent','data-analyst',true,'{SQL,Excel}'),
  ('Frontend Developer','EPAM Uzbekistan','Tashkent','frontend-dev',false,'{JavaScript,React}'),
  ('ML Intern','MyTaxi','Tashkent','ml-engineer',true,'{Python,Statistics}')
on conflict do nothing;

insert into market_trends (skill_name,demand_index,growth_pct,category) values
  ('SQL',88,12,'trending'),('Power BI',81,24,'trending'),
  ('Python',92,18,'trending'),('Machine Learning',76,41,'emerging'),
  ('Prompt Engineering',64,120,'emerging'),('React',79,15,'trending')
on conflict do nothing;
