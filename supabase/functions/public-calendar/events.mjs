import ICAL from 'npm:ical.js@2.2.1';
// All-day and floating values use the viewer's zone; explicit VTIMEZONE data
// stays attached to the calendar component and never enters a global registry.
function instant(time,zone){
 if(!time.isDate&&time.zone.tzid!=='floating')return time.toUnixTime()*1000;
 const base=Date.UTC(time.year,time.month-1,time.day,time.hour||0,time.minute||0,time.second||0);let value=base;
 const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 for(let i=0;i<3;i++){const parts=Object.fromEntries(formatter.formatToParts(new Date(value)).map(p=>[p.type,p.value]));const shown=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);value+=base-shown;}return value;
}
export function calendarEvents(text,now=new Date(),zone='UTC'){
 new Intl.DateTimeFormat('en',{timeZone:zone});
 if(!text.includes('BEGIN:VCALENDAR'))throw new Error('The public calendar did not return an iCal feed.');
 const root=new ICAL.Component(ICAL.parse(text)),components=root.getAllSubcomponents('vevent'),events=[],seen=new Set();let budget=100000;
 const horizon=now.getTime()+366*86400000;
 function add(event,start,end){
  if(String(event.component.getFirstPropertyValue('status')).toUpperCase()==='CANCELLED')return;
  const startMs=instant(start,zone),endMs=instant(end,zone);if(!Number.isFinite(startMs)||startMs>horizon||Math.max(startMs+1,endMs)<=now.getTime())return;
  const key=event.uid+'|'+startMs;if(seen.has(key))return;seen.add(key);
  const serialize=t=>t.isDate?t.toString():t.zone.tzid==='floating'?t.toString():new Date(instant(t,zone)).toISOString();
  events.push({id:key,title:String(event.summary||'Busy').slice(0,500),start:serialize(start),end:serialize(end),allDay:start.isDate,location:String(event.location||'').slice(0,500),description:String(event.description||'').slice(0,2000),sort:startMs});
 }
 for(const component of components){
  const event=new ICAL.Event(component);if(!component.hasProperty('dtstart'))continue;
  if(!event.isRecurring()||event.isRecurrenceException()){add(event,event.startDate,event.endDate);continue;}
  const iterator=event.iterator();let count=0,occurrence;
  while((occurrence=iterator.next())){
   if(++count>20000||--budget<=0)throw new Error('This calendar has too many recurring events to preview. Open the full calendar instead.');
   if(instant(occurrence,zone)>horizon)break;
   const details=event.getOccurrenceDetails(occurrence);add(details.item,details.startDate,details.endDate);
  }
 }
 return events.sort((a,b)=>a.sort-b.sort||a.title.localeCompare(b.title)).slice(0,12).map(({sort,...event})=>event);
}
