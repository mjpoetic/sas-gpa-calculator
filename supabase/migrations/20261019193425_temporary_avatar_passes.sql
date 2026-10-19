begin;
-- Bearer credentials are hashed; neither students nor teachers can read hashes.
create table public.classroom_avatar_passes (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 chart_id text not null, student_id text not null,
 token_hash text not null unique,
 expires_at timestamptz not null, revoked_at timestamptz,
 created_at timestamptz not null default clock_timestamp(), saved_at timestamptz,
 constraint avatar_pass_max_duration check (expires_at<=created_at+interval '24 hours')
);
create index classroom_avatar_pass_owner on public.classroom_avatar_passes(owner_id,chart_id,student_id);
alter table public.classroom_avatar_passes enable row level security;
revoke all on public.classroom_avatar_passes from public,anon,authenticated;
grant select(id,owner_id,chart_id,student_id,expires_at,revoked_at,created_at,saved_at),
 insert(owner_id,chart_id,student_id,token_hash,expires_at), update(revoked_at) on public.classroom_avatar_passes to authenticated;
create policy avatar_pass_owner on public.classroom_avatar_passes for all to authenticated
 using (owner_id=(select auth.uid()) and (select classroom_private.mfa_access_allowed()))
 with check (owner_id=(select auth.uid()) and (select classroom_private.mfa_access_allowed()));

create function public.create_classroom_avatar_pass(p_chart text,p_student text,p_minutes integer)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare person jsonb; token text; pass_id uuid; expiry timestamptz;
begin
 if auth.uid() is null or not classroom_private.mfa_access_allowed() then raise exception 'Sign in to your teacher account first.'; end if;
 if p_minutes is null or p_minutes not in (15,30,60,240,1440) then raise exception 'Choose a valid pass duration.'; end if;
 select s into person from public.classroom_documents d,
 lateral jsonb_array_elements(d.document->'charts') c,
 lateral jsonb_array_elements(c->'students') s
 where d.user_id=auth.uid() and c->>'id'=p_chart and s->>'id'=p_student;
 if person is null then raise exception 'Save this student to cloud before creating a pass.'; end if;
 -- Close older passes for the same student when issuing a replacement.
 update public.classroom_avatar_passes set revoked_at=clock_timestamp()
 where owner_id=auth.uid() and chart_id=p_chart and student_id=p_student and revoked_at is null;
 token=encode(extensions.gen_random_bytes(32),'hex');expiry=clock_timestamp()+make_interval(mins=>p_minutes);
 insert into public.classroom_avatar_passes(owner_id,chart_id,student_id,token_hash,expires_at)
 values(auth.uid(),p_chart,p_student,encode(extensions.digest(token,'sha256'),'hex'),expiry) returning id into pass_id;
 return jsonb_build_object('id',pass_id,'token',token,'expires_at',expiry);
end;$$;
revoke all on function public.create_classroom_avatar_pass(text,text,integer) from public,anon;
grant execute on function public.create_classroom_avatar_pass(text,text,integer) to authenticated;

-- The privileged implementation stays outside exposed schemas. The only
-- anonymous authority is possession of an unguessable, unexpired bearer token.
create function classroom_private.use_avatar_pass(p_token text,p_avatar jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare pass public.classroom_avatar_passes%rowtype; doc jsonb; person jsonb;
 ci integer; si integer; rule record; rules jsonb := '{"bodyBuild":["slim","medium","broad"],"bodyHeight":["short","medium","tall"],"earSize":["small","medium","big"],"beardGraying":["none","light","medium","heavy"],"mustache":["auto","none","classic","handlebar","english","horseshoe","chevron","walrus","pencil","imperial","toothbrush","dali","fumanchu"],"mustacheColor":"color","sunglassTint":["dark","medium","light"],"mask":["none","hero","clown","butterfly","robot","medical"],"maskColor":"color","maskAccentColor":"color","facialHair":["none","stubble","mustache","classicgoatee","goatee","circle","muttonchops","chinstrap","chevron","balbo","anchor","shortbeard","beard","longbeard"],"facialHairColor":"color","wrinkles":["none","subtle","defined"],"lipstick":["none","soft","bold"],"lipstickColor":"color","drink":["none","coffee","tumbler"],"drinkColor":"color","undershirtColor":"color","neckwear":["none","whistle","badge"],"lanyardColor":"color","badgeColor":"color","teachingTool":["none","microscope","walkie","clipboard","art","basketball","football","soccer","tennis","calculator","geometry","bible","flask","music","history","ela"],"toolColor":"color","backpack":["none","on","purse","crossbody"],"glassesPosition":["eyes","head","neck"],"glassesStrap":["none","on"],"glassesStrapColor":"color","eyeColor":"color","backpackColor":"color","backpackPocketColor":"color","backpackStrapColor":"color","style":["junior","middle","senior"],"skin":"color","hair":["crop","swoop","curls","afro","sponge","spongeafro","coils","bob","long","longcurly","braids","ponytail","curlyponytail","bun","curlybun","evencut","shortafro","lowtaper","fade","curlytop","waves","cornrows","boxbraids","locs","shortlocs","twists","puffs","bald"],"hairHighlights":["none","on"],"hairHighlightColor":"color","hairTips":["none","on"],"hairTipColor":"color","hairAccessory":["none","bow","bows","clip","starclip"],"hairAccessoryColor":"color","hairAccessoryAccentColor":"color","hairColor":"color","eyes":["classic","bright","round","happy","sleepy","squinted"],"glassesColor":"color","expression":["smile","grin","wink","calm","smirk","surprised","angry","annoyed","nervous","tired","hungry","satisfied","laughing","silly","confused","excited","thinking","embarrassed"],"clothing":["tee","hoodie","cardigan","sweater","polo","denim","labcoat","dress","blouse","suit","blazer","dressshirt","vest","turtleneck"],"clothingColor":"color","accessory":["none","glasses","round","sun"],"headphones":["none","on","neck"],"sunglassLensColor":"color","frogEyeWhiteColor":"color","headphoneBandColor":"color","headphoneCupColor":"color","headphonePadColor":"color","starColor":"color","starEdgeColor":"color","flowerColor":"color","flowerCenterColor":"color","flowerLeafColor":"color","flowerBandColor":"color","catBandColor":"color","catEarColor":"color","catInnerColor":"color","antennaStemColor":"color","antennaLeftColor":"color","antennaRightColor":"color","crownColor":"color","crownEdgeColor":"color","crownGemColor":"color","frogColor":"color","frogBrimColor":"color","frogBumpColor":"color","frogEyeColor":"color","extra":["none","star","singleflower","flower","crown","frog","cat","antenna","baseball"],"capColor":"color","capBrimColor":"color","mouthAccessory":["none","braces"],"backdrop":"color"}'::jsonb;
begin
 if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'This avatar pass is invalid or has ended.'; end if;
 select * into pass from public.classroom_avatar_passes where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
 if not found then raise exception 'This avatar pass is invalid or has ended.'; end if;
 select document into doc from public.classroom_documents where user_id=pass.owner_id for update;
 -- Check server time after acquiring locks, including a concurrent revocation.
 if pass.revoked_at is not null or pass.expires_at<=clock_timestamp() or doc is null then raise exception 'This avatar pass is invalid or has ended.'; end if;
 select (c.n-1)::integer,(s.n-1)::integer,s.value into ci,si,person
 from jsonb_array_elements(doc->'charts') with ordinality c(value,n),
 lateral jsonb_array_elements(c.value->'students') with ordinality s(value,n)
 where c.value->>'id'=pass.chart_id and s.value->>'id'=pass.student_id;
 if person is null then raise exception 'This avatar pass is invalid or has ended.'; end if;
 if p_avatar is not null then
  if jsonb_typeof(p_avatar)<>'object' or octet_length(p_avatar::text)>12000
   or jsonb_typeof(p_avatar->'enabled') is distinct from 'boolean' then raise exception 'Invalid avatar.'; end if;
  if exists(select 1 from jsonb_object_keys(p_avatar) k where k<>'enabled' and not rules ? k) then raise exception 'Invalid avatar field.'; end if;
  for rule in select key,value from jsonb_each(rules) loop
   if jsonb_typeof(p_avatar->rule.key) is distinct from 'string' then raise exception 'Invalid avatar field: %',rule.key; end if;
   if rule.value='"color"'::jsonb then
    if p_avatar->>rule.key !~ '^#[0-9a-fA-F]{6}$' then raise exception 'Invalid avatar color.'; end if;
   elsif not rule.value ? (p_avatar->>rule.key) then raise exception 'Invalid avatar option.';
   end if;
  end loop;
  if pass.saved_at>clock_timestamp()-interval '1 second' then raise exception 'Please wait a moment before saving again.'; end if;
  doc=jsonb_set(doc,array['charts',ci::text,'students',si::text,'avatar'],p_avatar);
  -- Visibility is a teacher preference and is deliberately not changed here.
  doc=jsonb_set(doc,'{cloudSavedAt}',to_jsonb(clock_timestamp()));
  update public.classroom_documents set document=doc,revision=revision+1 where user_id=pass.owner_id;
  update public.classroom_avatar_passes set saved_at=clock_timestamp() where id=pass.id;
  person=jsonb_set(person,'{avatar}',p_avatar);
 end if;
 return jsonb_build_object('name',left(coalesce(nullif(person->>'nickname',''),split_part(person->>'name',' ',1)),80),'avatar',person->'avatar','expires_at',pass.expires_at);
end;$$;
revoke all on function classroom_private.use_avatar_pass(text,jsonb) from public,anon,authenticated;
grant usage on schema classroom_private to anon;
grant execute on function classroom_private.use_avatar_pass(text,jsonb) to anon,authenticated;
create function public.use_classroom_avatar_pass(p_token text,p_avatar jsonb default null)
returns jsonb language sql security invoker set search_path='' as $$
 select classroom_private.use_avatar_pass(p_token,p_avatar);
$$;
revoke all on function public.use_classroom_avatar_pass(text,jsonb) from public;
grant execute on function public.use_classroom_avatar_pass(text,jsonb) to anon,authenticated;
commit;
