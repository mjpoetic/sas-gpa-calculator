-- ONLY for a disposable local PostgreSQL database. Minimal Supabase auth/RLS fixture.
create role anon;create role authenticated;
create schema auth;create schema extensions;create schema classroom_private;
create extension pgcrypto with schema extensions;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb)$$;
create function auth.uid() returns uuid language sql stable as $$select (auth.jwt()->>'sub')::uuid$$;
grant usage on schema auth,extensions,classroom_private to anon,authenticated;
grant execute on all functions in schema auth,extensions to anon,authenticated;
create table auth.users(id uuid primary key,email text);
create table auth.mfa_factors(user_id uuid,status text);
create function classroom_private.mfa_access_allowed() returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and (coalesce(auth.jwt()->>'aal','aal1')='aal2' or not exists(select 1 from auth.mfa_factors where user_id=auth.uid() and status='verified'))$$;
revoke all on function classroom_private.mfa_access_allowed() from public,anon;grant execute on function classroom_private.mfa_access_allowed() to authenticated;
create table public.classroom_documents(user_id uuid primary key references auth.users(id),document jsonb,revision bigint);
alter table public.classroom_documents enable row level security;
grant select on public.classroom_documents to anon;
grant all on public.classroom_documents to authenticated;
create policy owner on public.classroom_documents to authenticated using(user_id=auth.uid() and nullif(auth.jwt()->>'email','') is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false)) with check(user_id=auth.uid() and nullif(auth.jwt()->>'email','') is not null and not coalesce((auth.jwt()->>'is_anonymous')::boolean,false));
create policy mfa on public.classroom_documents as restrictive to authenticated using(classroom_private.mfa_access_allowed()) with check(classroom_private.mfa_access_allowed());
