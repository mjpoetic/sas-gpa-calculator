import {createClient} from 'npm:@supabase/supabase-js@2.117.3';
import webpush from 'npm:web-push@3.6.7';
import {validEndpoint,settings,deliverySlot,notificationBody} from './delivery-rules.mjs';
import {birthdaySummary} from './celebration-date.mjs';

const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info, x-scheduler-key','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
function assertOK(result:any){if(result.error)throw new Error('Birthday reminder storage is temporarily unavailable.');return result.data;}
async function hash(text:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
async function config(){let row=assertOK(await admin.from('birthday_push_config').select('*').eq('id',true).single());if(!row.vapid_public){const keys=webpush.generateVAPIDKeys();assertOK(await admin.from('birthday_push_config').update({vapid_public:keys.publicKey,vapid_private:keys.privateKey}).eq('id',true).is('vapid_public',null));row=assertOK(await admin.from('birthday_push_config').select('*').eq('id',true).single());}return row;}
async function send(sub:any,keys:any,payload:any){return webpush.sendNotification(sub.subscription,JSON.stringify(payload),{TTL:3600,timeout:10000,vapidDetails:{subject:'https://github.com/mjpoetic/sas-gpa-calculator',publicKey:keys.vapid_public,privateKey:keys.vapid_private}});}
async function dispatch(req:Request){
 const keys=assertOK(await admin.from('birthday_push_config').select('*').eq('id',true).single());const supplied=req.headers.get('x-scheduler-key');if(!supplied||await hash(supplied)!==await hash(keys.scheduler_secret))return reply({error:'Unauthorized'},401);const probe=await req.json().catch(()=>({}));if(probe.dryRun===true){const result=await admin.from('birthday_push_subscriptions').select('id',{count:'exact',head:true}).eq('enabled',true);assertOK(result);return reply({healthy:true,enabledSubscriptions:result.count||0,keysInitialized:!!keys.vapid_public,dryRun:true});}if(!keys.vapid_public)return reply({sent:0});
 const now=new Date();let sent=0,failed=0,offset=0;const docs=new Map();
 // Bound each run; following runs resume due subscriptions through delivery claims.
 for(let batch=0;batch<10;batch++){const subscriptions=assertOK(await admin.from('birthday_push_subscriptions').select('*').eq('enabled',true).order('id').range(offset,offset+99));if(!subscriptions.length)break;offset+=subscriptions.length;
 for(const sub of subscriptions){const local=deliverySlot(now,sub);if(!local)continue;
 if(!docs.has(sub.user_id)){const result=await admin.from('classroom_documents').select('document').eq('user_id',sub.user_id).maybeSingle();if(result.error)continue;docs.set(sub.user_id,result.data?.document);}
 const document=docs.get(sub.user_id);if(!document)continue;const summary=birthdaySummary(document,local.date,document.birthdayPreferences?.weekendEarly!==false);if(!summary.count)continue;
 const claim=assertOK(await admin.rpc('claim_birthday_push_delivery',{p_subscription:sub.id,p_day:local.day}));if(!claim)continue;

 try{await send(sub,keys,{body:notificationBody(summary,sub.include_names),tag:'birthday-'+local.day});assertOK(await admin.from('birthday_push_deliveries').update({status:'sent',lease_until:null}).eq('subscription_id',sub.id).eq('local_day',local.day));sent++;}
 catch(error:any){failed++;if(error.statusCode===404||error.statusCode===410)assertOK(await admin.from('birthday_push_subscriptions').update({enabled:false}).eq('id',sub.id));assertOK(await admin.from('birthday_push_deliveries').update({status:'failed',lease_until:null}).eq('subscription_id',sub.id).eq('local_day',local.day));}
 }if(subscriptions.length<100)break;}
 return reply({sent,failed});
}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});if(req.method!=='POST')return reply({error:'Use POST'},405);
 try{if(req.headers.has('x-scheduler-key'))return await dispatch(req);if(Number(req.headers.get('content-length')||0)>20000)return reply({error:'Request too large'},413);const text=await req.text();if(text.length>20000)return reply({error:'Request too large'},413);const body=JSON.parse(text),token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token)return reply({error:'Sign in to your teacher account.'},401);
 const {data,error}=await admin.auth.getUser(token);if(error||!data.user||data.user.is_anonymous||!data.user.email)return reply({error:'Sign in to your teacher account.'},401);const userId=data.user.id;
 // The caller-scoped read enforces the existing optional-MFA policy.
 const scoped=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false}});const access=await scoped.from('classroom_documents').select('user_id').eq('user_id',userId).maybeSingle();if(access.error||!access.data)return reply({error:'Open and save your cloud classrooms, and complete account verification first.'},403);
 if(body.action==='config'){const keys=await config();let prefs=null;if(body.endpoint){const endpoint=validEndpoint(body.endpoint);const row=assertOK(await admin.from('birthday_push_subscriptions').select('reminder_time,timezone,include_names').eq('user_id',userId).eq('endpoint_hash',await hash(endpoint)).eq('enabled',true).maybeSingle());if(row)prefs={time:row.reminder_time,timezone:row.timezone,includeNames:row.include_names};}return reply({publicKey:keys.vapid_public,settings:prefs});}
 const endpoint=validEndpoint(body.action==='subscribe'?body.subscription?.endpoint:body.endpoint),endpointHash=await hash(endpoint);let sub=assertOK(await admin.from('birthday_push_subscriptions').select('*').eq('endpoint_hash',endpointHash).maybeSingle());if(sub&&sub.user_id!==userId)return reply({error:'This browser subscription belongs to another account. Disable its browser notification permission and enable again.'},409);
 if(body.action==='subscribe'){const keys=body.subscription?.keys;if(!keys||!/^[-_a-zA-Z0-9]{80,100}$/.test(keys.p256dh)||!/^[-_a-zA-Z0-9]{20,40}$/.test(keys.auth))return reply({error:'Invalid push subscription'},400);const prefs=settings(body),count=await admin.from('birthday_push_subscriptions').select('id',{count:'exact',head:true}).eq('user_id',userId).eq('enabled',true);if(count.error)throw new Error('Could not check device limit.');if(!sub?.enabled&&(count.count||0)>=10)return reply({error:'Disable reminders on another device before adding more.'},400);await config();const values={user_id:userId,endpoint_hash:endpointHash,subscription:{endpoint,keys:{p256dh:keys.p256dh,auth:keys.auth}},...prefs,enabled:true};assertOK(await (sub?admin.from('birthday_push_subscriptions').update(values).eq('id',sub.id).eq('user_id',userId):admin.from('birthday_push_subscriptions').insert(values)));return reply({enabled:true});}
 if(!sub)return reply({error:'Enable reminders on this device first.'},404);
 if(body.action==='unsubscribe'){assertOK(await admin.from('birthday_push_subscriptions').delete().eq('id',sub.id).eq('user_id',userId));return reply({enabled:false});}
 if(body.action==='settings'){assertOK(await admin.from('birthday_push_subscriptions').update(settings(body)).eq('id',sub.id).eq('user_id',userId));return reply({saved:true});}
 if(body.action==='test'){if(!sub.enabled)return reply({error:'Enable reminders first.'},400);const last=sub.last_test_at?new Date(sub.last_test_at).getTime():0;if(Date.now()-last<60000)return reply({error:'Wait one minute before sending another test.'},429);assertOK(await admin.from('birthday_push_subscriptions').update({last_test_at:new Date().toISOString()}).eq('id',sub.id));await send(sub,await config(),{body:'Birthday reminders are working on this device.',tag:'birthday-test'});return reply({sent:true});}
 return reply({error:'Unknown reminder action.'},400);
 }catch(error:any){return reply({error:error instanceof SyntaxError?'Invalid request.':error.message||'Birthday reminders are temporarily unavailable.'},400);}
});
