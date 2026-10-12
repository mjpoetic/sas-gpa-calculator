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
  using ((select auth.uid())=user_id and exists(select 1 from public.classroom_access));
create policy owner_insert on public.classroom_documents for insert to authenticated
  with check ((select auth.uid())=user_id and exists(select 1 from public.classroom_access));
create policy owner_update on public.classroom_documents for update to authenticated
  using ((select auth.uid())=user_id and exists(select 1 from public.classroom_access))
  with check ((select auth.uid())=user_id and exists(select 1 from public.classroom_access));
commit;

-- Supabase's automatic RLS event trigger does not need client RPC access.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
