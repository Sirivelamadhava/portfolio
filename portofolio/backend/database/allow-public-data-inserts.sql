-- Run in the Supabase SQL Editor for the portfolio project.
-- Allows anonymous visitor submissions without granting access to read private rows.

create table if not exists public.visitor_responses (
  id bigserial primary key,
  visitor_id varchar(255) not null,
  visitor_name varchar(100),
  user_response boolean not null,
  actual_first_visit boolean not null,
  session_id varchar(255),
  ip_address varchar(45),
  user_agent text,
  response_time timestamptz default now(),
  created_at timestamptz default now()
);

grant usage on schema public to anon;
grant insert on public.messages to anon;
grant insert on public.profile_views to anon;
grant insert on public.visitors to anon;
grant insert on public.visitor_responses to anon;
grant insert, select, update on public.analytics to anon;

grant usage, select on sequence public.messages_id_seq to anon;
grant usage, select on sequence public.profile_views_id_seq to anon;
grant usage, select on sequence public.visitors_id_seq to anon;
grant usage, select on sequence public.visitor_responses_id_seq to anon;
grant usage, select on sequence public.analytics_id_seq to anon;

alter table public.messages enable row level security;
alter table public.profile_views enable row level security;
alter table public.visitors enable row level security;
alter table public.visitor_responses enable row level security;
alter table public.analytics enable row level security;

drop policy if exists "Public can submit messages" on public.messages;
create policy "Public can submit messages"
  on public.messages for insert to anon
  with check (true);

drop policy if exists "Public can insert profile views" on public.profile_views;
create policy "Public can insert profile views"
  on public.profile_views for insert to anon
  with check (true);

drop policy if exists "Public can insert visitors" on public.visitors;
create policy "Public can insert visitors"
  on public.visitors for insert to anon
  with check (true);

drop policy if exists "Public can submit visitor responses" on public.visitor_responses;
create policy "Public can submit visitor responses"
  on public.visitor_responses for insert to anon
  with check (true);

drop policy if exists "Public can read analytics" on public.analytics;
create policy "Public can read analytics"
  on public.analytics for select to anon
  using (true);

drop policy if exists "Public can insert analytics" on public.analytics;
create policy "Public can insert analytics"
  on public.analytics for insert to anon
  with check (true);

drop policy if exists "Public can update analytics" on public.analytics;
create policy "Public can update analytics"
  on public.analytics for update to anon
  using (true)
  with check (true);

notify pgrst, 'reload schema';
