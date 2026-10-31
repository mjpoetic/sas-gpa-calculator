import {nextBirthday} from './celebration-date.mjs?v=20261031-release2';
export function upcomingBirthdays(students,today=new Date(),early=true){
 const day=d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
 const rows=students.flatMap(student=>{const next=nextBirthday(student.birthday,today,early);return next?[{student,...next,days:Math.round((day(next.actual)-day(today))/86400000)}]:[];}).sort((a,b)=>a.days-b.days||a.student.name.localeCompare(b.student.name));
 return rows.filter(row=>row.days===rows[0]?.days);
}
export function publicGoogleCalendar(value){
 let url;try{url=new URL(value.trim());}catch{throw new Error('Paste a public Google Calendar link.');}
 if(url.protocol!=='https:'||!['calendar.google.com','www.google.com'].includes(url.hostname)||!url.pathname.startsWith('/calendar/'))throw new Error('Use a public Google Calendar, embed, or public Google iCal link.');
 let id=url.searchParams.get('src');
 if(!id&&url.searchParams.has('cid')){try{id=atob(url.searchParams.get('cid').replace(/-/g,'+').replace(/_/g,'/'));}catch{}}
 const ical=url.pathname.match(/^\/calendar\/ical\/([^/]+)\/public\/basic\.ics$/);if(ical)id=decodeURIComponent(ical[1]);
 if(!id||id.length>512||/[\x00-\x1f]/.test(id))throw new Error('This link does not identify a public calendar. Copy its Public URL from Google Calendar → Settings → Integrate calendar.');
 const embed=new URL('https://calendar.google.com/calendar/embed');embed.searchParams.set('src',id);for(const [key,val] of Object.entries({mode:'AGENDA',showTitle:'0',showPrint:'0',showTabs:'0',showCalendars:'0',showTz:'0',ctz:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/New_York'}))embed.searchParams.set(key,val);
 return embed.href;
}
