import test from 'node:test';
import assert from 'node:assert/strict';
import {upcomingBirthdays,publicGoogleCalendar} from '../classroom/upcoming.mjs';
test('birthday countdown includes ties, year rollover, leap day, and actual weekend date',()=>{
 const rows=upcomingBirthdays([{name:'Zoe',birthday:'01-01'},{name:'Alex',birthday:'01-01'},{name:'Leap',birthday:'02-29'},{name:'Missing'}],new Date(2026,11,31));assert.deepEqual(rows.map(r=>r.student.name),['Alex','Zoe']);assert.equal(rows[0].days,1);
 const weekend=upcomingBirthdays([{name:'Alex',birthday:'10-31'}],new Date(2026,9,30))[0];assert.equal(weekend.days,1);assert.equal(weekend.celebration.getDate(),30);
 assert.equal(upcomingBirthdays([{name:'Leap',birthday:'02-29'}],new Date(2027,1,28))[0].actual.getFullYear(),2028);assert.deepEqual(upcomingBirthdays([]),[]);
 assert.equal(upcomingBirthdays([{name:'Today',birthday:'03-08'}],new Date(2026,2,8,23))[0].days,0);
});
test('normalizes public Google calendar URLs without preserving arbitrary options',()=>{
 const id='school@group.calendar.google.com';for(const input of [`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(id)}&mode=MONTH`,`https://www.google.com/calendar/ical/${encodeURIComponent(id)}/public/basic.ics`,`https://calendar.google.com/calendar/u/0?cid=${btoa(id)}`]){const url=new URL(publicGoogleCalendar(input));assert.equal(url.searchParams.get('src'),id);assert.equal(url.searchParams.get('mode'),'AGENDA');assert.equal(url.origin,'https://calendar.google.com');}
 for(const input of ['javascript:alert(1)','https://evil.example/calendar/embed?src=school','https://calendar.google.com.evil.example/calendar/embed?src=school','https://calendar.google.com/calendar/ical/school/private-secret/basic.ics','https://calendar.google.com/calendar/'])assert.throws(()=>publicGoogleCalendar(input));
});

import {newChart,validateBackup} from '../classroom/model.mjs';
import {mergeDocuments} from '../classroom/sync-merge.mjs';
test('calendar connection survives cloud validation, device merging, backups and disconnection',()=>{
 const chart=newChart(),base={version:1,active:chart.id,charts:[chart]},local=structuredClone(base),remote=structuredClone(base);
 remote.publicCalendar={name:'School events',url:'https://calendar.google.com/calendar/embed?src=school%40group.calendar.google.com'};
 local.charts[0].name='Edited on another device';
 const merged=mergeDocuments(base,local,remote);assert.deepEqual(merged.conflicts,[]);assert.equal(merged.document.publicCalendar.name,'School events');assert.equal(merged.document.charts[0].name,'Edited on another device');
 const restored=validateBackup(JSON.parse(JSON.stringify(merged.document)));assert.deepEqual(restored.publicCalendar,merged.document.publicCalendar);
 const disconnected=structuredClone(restored);disconnected.publicCalendar=null;
 assert.equal(mergeDocuments(restored,restored,disconnected).document.publicCalendar,null);
 assert.throws(()=>validateBackup({...base,publicCalendar:{name:'Bad',url:'https://evil.example/calendar'}}));
});
