begin;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create table public.birthday_push_config (
 id boolean primary key default true check(id),
 vapid_public text,
 vapid_private text,
 scheduler_secret text not null default (gen_random_uuid()::text || gen_random_uuid()::text)
);
alter table public.birthday_push_config enable row level security;
revoke all on public.birthday_push_config from public,anon,authenticated;
grant all on public.birthday_push_config to service_role;
insert into public.birthday_push_config(id) values(true);
create table public.birthday_push_subscriptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 endpoint_hash text not null unique,
 subscription jsonb not null,
 reminder_time text not null default '07:00' check(reminder_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 timezone text not null check(length(timezone)<=100),
 include_names boolean not null default false,
 enabled boolean not null default true,
 last_test_at timestamptz,
 created_at timestamptz not null default now()
);
create index birthday_push_owner on public.birthday_push_subscriptions(user_id);
alter table public.birthday_push_subscriptions enable row level security;
revoke all on public.birthday_push_subscriptions from public,anon,authenticated;
grant all on public.birthday_push_subscriptions to service_role;
create table public.birthday_push_deliveries (
 subscription_id uuid not null references public.birthday_push_subscriptions(id) on delete cascade,
 local_day date not null,
 status text not null check(status in ('pending','sent','failed')),
 attempts integer not null default 1,
 lease_until timestamptz,
 primary key(subscription_id,local_day)
);
alter table public.birthday_push_deliveries enable row level security;
revoke all on public.birthday_push_deliveries from public,anon,authenticated;
grant all on public.birthday_push_deliveries to service_role;
create function public.claim_birthday_push_delivery(p_subscription uuid,p_day date) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
 insert into public.birthday_push_deliveries(subscription_id,local_day,status,lease_until)
 values(p_subscription,p_day,'pending',now()+interval '10 minutes')
 on conflict(subscription_id,local_day) do update set status='pending',attempts=public.birthday_push_deliveries.attempts+1,lease_until=now()+interval '10 minutes'
 where public.birthday_push_deliveries.status<>'sent' and public.birthday_push_deliveries.attempts<4
 and (public.birthday_push_deliveries.status='failed' or public.birthday_push_deliveries.lease_until<now());
 return found;
end;
$$;
revoke all on function public.claim_birthday_push_delivery(uuid,date) from public,anon,authenticated;
grant execute on function public.claim_birthday_push_delivery(uuid,date) to service_role;
select cron.schedule('classroom-birthday-reminders','*/5 * * * *',$job$
 select net.http_post(
  url:='https://jqbihjoeftmqmijfprrr.supabase.co/functions/v1/birthday-reminders',
  headers:=jsonb_build_object('Content-Type','application/json','x-scheduler-key',(select scheduler_secret from public.birthday_push_config where id=true)),
  body:='{}'::jsonb,timeout_milliseconds:=30000
 );
$job$);
select cron.schedule('classroom-birthday-delivery-cleanup','17 3 * * *',$job$delete from public.birthday_push_deliveries where local_day < current_date-35;$job$);
commit;
