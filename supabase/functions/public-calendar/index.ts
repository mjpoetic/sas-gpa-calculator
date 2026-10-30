import {calendarEvents} from './events.mjs';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'apikey, content-type','Access-Control-Allow-Methods':'GET, OPTIONS'};
const cache=new Map<string,{until:number,data:unknown}>();
export async function handleCalendar(request:Request){
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{...cors,'Cache-Control':status===200?'public, max-age=300':'no-store'}});
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(request.method!=='GET')return json({error:'Use GET.'},405);
 const params=new URL(request.url).searchParams,id=params.get('calendar')||'',zone=params.get('zone')||'UTC';
 if(!id||id.length>512||/[\x00-\x20/\\?]/.test(id))return json({error:'Invalid public calendar ID.'},400);
 try{new Intl.DateTimeFormat('en',{timeZone:zone});}catch{return json({error:'Invalid time zone.'},400);}
 const key=id+'|'+zone,hit=cache.get(key);if(hit&&hit.until>Date.now())return json(hit.data);
 try{
  // Fixed Google host and public-only path prevent this endpoint becoming an
  // arbitrary URL proxy. Never follow redirects to private or other hosts.
  const response=await fetch(`https://calendar.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`,{redirect:'error',signal:AbortSignal.timeout(12000)});
  if(!response.ok)return json({error:'Calendar unavailable. Check that it is public and the link is correct.'},422);
  if(Number(response.headers.get('content-length'))>3000000)throw new Error('Calendar too large.');
  const reader=response.body!.getReader(),chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>3000000){await reader.cancel();throw new Error('Calendar too large.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const data={events:calendarEvents(new TextDecoder().decode(bytes),new Date(),zone),fetchedAt:new Date().toISOString()};
  if(cache.size>=50)cache.delete(cache.keys().next().value!);cache.set(key,{until:Date.now()+300000,data});return json(data);
 }catch{return json({error:'Could not refresh this calendar. Try again or open the full calendar.'},502);}
}
if(import.meta.main)Deno.serve(handleCalendar);
