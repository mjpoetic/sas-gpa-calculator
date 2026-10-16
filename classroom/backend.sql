-- Run only in the dedicated SAS project. No service key is used by the website.
begin;
create table public.classroom_access (
  email text primary key check (email = lower(email))
);
alter table public.classroom_access enable row level security;
revoke all on public.classroom_access from anon, authenticated;
grant select on public.classroom_access to authenticated;
create policy own_approved_email on public.classroom_access for select to authenticated
  using (email = lower((select auth.jwt()->>'email')) and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
insert into public.classroom_access (email) values ('dane.hurst@flcoe.org');

create table public.classroom_documents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check (jsonb_typeof(document)='object' and document->>'version'='1' and jsonb_typeof(document->'charts')='array' and octet_length(document::text)<=5000000),
  revision bigint not null check (revision>0)
);
alter table public.classroom_documents enable row level security;
revoke all on public.classroom_documents from anon, authenticated;
grant select,insert,update on public.classroom_documents to authenticated;
create policy owner_read on public.classroom_documents for select to authenticated
  using ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
create policy owner_insert on public.classroom_documents for insert to authenticated
  with check ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
create policy owner_update on public.classroom_documents for update to authenticated
  using ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false))
  with check ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
commit;

-- Supabase's automatic RLS event trigger does not need client RPC access.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Optional MFA enforcement (apply after the base schema above).
begin;
-- Keep auth-factor lookup outside the exposed API schema. No factor IDs or
-- secrets are returned, and the caller cannot choose another user's ID.
create schema if not exists classroom_private;
revoke all on schema classroom_private from public, anon, authenticated;
grant usage on schema classroom_private to authenticated;
create function classroom_private.mfa_access_allowed()
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and (
    coalesce((select auth.jwt()->>'aal'),'aal1') = 'aal2'
    or not exists (
      select 1 from auth.mfa_factors
      where user_id = (select auth.uid()) and status = 'verified'
    )
  );
$$;
revoke all on function classroom_private.mfa_access_allowed() from public, anon, authenticated;
grant execute on function classroom_private.mfa_access_allowed() to authenticated;
create policy optional_teacher_mfa on public.classroom_documents
  as restrictive for all to authenticated
  using ((select classroom_private.mfa_access_allowed()))
  with check ((select classroom_private.mfa_access_allowed()));
commit;
