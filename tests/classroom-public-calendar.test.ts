import {calendarEvents} from '../supabase/functions/public-calendar/events.mjs';
import {handleCalendar} from '../supabase/functions/public-calendar/index.ts';
const equal=(a:unknown,b:unknown)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(JSON.stringify({actual:a,expected:b}));};
const feed=(events:string)=>`BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events}\r\nEND:VCALENDAR`;
const event=(lines:string)=>`BEGIN:VEVENT\r\n${lines.replaceAll('\n','\r\n')}\r\nEND:VEVENT`;
Deno.test('sorts upcoming events, keeps ongoing and all-day events, removes ended/cancelled',()=>{
 const rows=calendarEvents(feed([
 event('UID:ended\nDTSTART:20261029T120000Z\nDTEND:20261029T130000Z'),
 event('UID:today\nDTSTART;VALUE=DATE:20261030\nDTEND;VALUE=DATE:20261031\nSUMMARY:School day'),
 event('UID:ongoing\nDTSTART:20261030T120000Z\nDTEND:20261030T150000Z\nSUMMARY:Assembly'),
 event('UID:cancelled\nDTSTART:20261031T120000Z\nSTATUS:CANCELLED'),
 event('UID:future\nDTSTART:20261101T120000Z\nDTEND:20261101T130000Z\nSUMMARY:Next event')].join('\r\n')),new Date('2026-10-30T14:00:00Z'),'America/New_York');
 equal(rows.map(r=>r.title),['School day','Assembly','Next event']);equal(rows[0].start,'2026-10-30');equal(rows[0].allDay,true);
});
Deno.test('recurrence respects exclusions, moved and cancelled exceptions',()=>{
 const rows=calendarEvents(feed([
 event('UID:weekly\nDTSTART:20261023T120000Z\nDTEND:20261023T130000Z\nRRULE:FREQ=WEEKLY;COUNT=5\nEXDATE:20261106T120000Z\nSUMMARY:Weekly'),
 event('UID:weekly\nRECURRENCE-ID:20261030T120000Z\nDTSTART:20261031T140000Z\nDTEND:20261031T150000Z\nSUMMARY:Moved'),
 event('UID:weekly\nRECURRENCE-ID:20261113T120000Z\nDTSTART:20261113T120000Z\nDTEND:20261113T130000Z\nSTATUS:CANCELLED')].join('\r\n')),new Date('2026-10-30T00:00:00Z'));
 equal(rows.map(r=>[r.title,r.start]),[['Moved','2026-10-31T14:00:00.000Z'],['Weekly','2026-11-20T12:00:00.000Z']]);
});
Deno.test('VTIMEZONE and DST retain wall clock time across recurring events',()=>{
 const tz='BEGIN:VTIMEZONE\r\nTZID:America/New_York\r\nBEGIN:STANDARD\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nTZOFFSETFROM:-0400\r\nTZOFFSETTO:-0500\r\nEND:STANDARD\r\nBEGIN:DAYLIGHT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nTZOFFSETFROM:-0500\r\nTZOFFSETTO:-0400\r\nEND:DAYLIGHT\r\nEND:VTIMEZONE';
 const rows=calendarEvents(feed(tz+'\r\n'+event('UID:dst\nDTSTART;TZID=America/New_York:20261030T090000\nDTEND;TZID=America/New_York:20261030T100000\nRRULE:FREQ=WEEKLY;COUNT=2\nSUMMARY:Morning')),new Date('2026-10-30T00:00:00Z'));
 equal(rows.map(r=>r.start),['2026-10-30T13:00:00.000Z','2026-11-06T14:00:00.000Z']);
});
Deno.test('public endpoint rejects methods, invalid IDs, zones and handles preflight without fetching',async()=>{
 equal((await handleCalendar(new Request('https://example.test',{method:'OPTIONS'}))).status,204);
 equal((await handleCalendar(new Request('https://example.test',{method:'POST'}))).status,405);
 equal((await handleCalendar(new Request('https://example.test?calendar=https://evil.test'))).status,400);
 equal((await handleCalendar(new Request('https://example.test?calendar=test&zone=invalid'))).status,400);
});
