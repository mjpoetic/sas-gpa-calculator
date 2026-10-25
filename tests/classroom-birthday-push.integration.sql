-- Run against a disposable database after the birthday push schema. All rows roll back.
begin;
do $$
begin
 if has_table_privilege('anon','public.birthday_push_config','select') or has_table_privilege('authenticated','public.birthday_push_config','select') then raise exception 'Secret configuration is exposed'; end if;
 if has_table_privilege('authenticated','public.birthday_push_subscriptions','select') or has_table_privilege('authenticated','public.birthday_push_subscriptions','insert') then raise exception 'Subscriptions bypass the authenticated Edge Function'; end if;
 if has_function_privilege('anon','public.claim_birthday_push_delivery(uuid,date)','execute') or has_function_privilege('authenticated','public.claim_birthday_push_delivery(uuid,date)','execute') then raise exception 'Delivery claims exposed'; end if;
end $$;
insert into auth.users(id) values('10000000-0000-4000-8000-000000000001');
insert into public.birthday_push_subscriptions(id,user_id,endpoint_hash,subscription,timezone) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','synthetic-test','{}','America/New_York');
set local role service_role;
do $$
declare subscription uuid:='20000000-0000-4000-8000-000000000001';
begin
 if not public.claim_birthday_push_delivery(subscription,'2026-10-23') then raise exception 'First claim failed'; end if;
 if public.claim_birthday_push_delivery(subscription,'2026-10-23') then raise exception 'Concurrent claim duplicated'; end if;
 update public.birthday_push_deliveries set status='failed',lease_until=null where subscription_id=subscription;
 if not public.claim_birthday_push_delivery(subscription,'2026-10-23') then raise exception 'Retry not permitted'; end if;
 update public.birthday_push_deliveries set status='sent',lease_until=null where subscription_id=subscription;
 if public.claim_birthday_push_delivery(subscription,'2026-10-23') then raise exception 'Already sent notification claimed again'; end if;
 update public.birthday_push_deliveries set status='failed',attempts=4 where subscription_id=subscription;
 if public.claim_birthday_push_delivery(subscription,'2026-10-23') then raise exception 'Retry limit bypassed'; end if;
end $$;
rollback;
