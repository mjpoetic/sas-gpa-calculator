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
