-- Allow registered email teachers to access only their own chart collection.
-- Email confirmation must remain enabled in Supabase Auth.
begin;
alter policy owner_read on public.classroom_documents to authenticated
  using ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
alter policy owner_insert on public.classroom_documents to authenticated
  with check ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
alter policy owner_update on public.classroom_documents to authenticated
  using ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false))
  with check ((select auth.uid())=user_id and nullif((select auth.jwt()->>'email'),'') is not null and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean),false));
commit;
