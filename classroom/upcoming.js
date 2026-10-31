import {CALENDAR_COLORS,applyCalendarColor} from './calendar-colors.mjs?v=20261031-release5';
import {upcomingBirthdays,publicGoogleCalendar} from './upcoming.mjs?v=20261031-release5';
import {cloudConfig} from './cloud-config.js?v=20261031-release5';
const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function birthdayCountdown(students,early=true,colorScheme='rose'){
 const rows=upcomingBirthdays(students,new Date(),early),box=make('div');box.className='birthday-countdown';applyCalendarColor(box,colorScheme);
 if(!rows.length){box.append(make('strong','Next birthday'),make('span','Add birthdays to start the countdown.'));return box;}
 const {days,actual,celebration}=rows[0];box.append(make('strong',days===0?'🎂 Birthday today!':`🎂 Next birthday · ${days===1?'Tomorrow':`in ${days} days`}`),make('span',rows.map(r=>r.student.name).join(' & ')+` · ${actual.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`));
 if(early&&celebration.getTime()!==actual.getTime())box.append(make('small',`Celebrate ${celebration.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})}`));return box;
}
const dateOf=event=>event.allDay?new Date(event.start+'T00:00:00'):new Date(event.start);
function eventWhen(event){const date=dateOf(event);return date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+(event.allDay?' · All day':' · '+date.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}));}
function eventCountdown(event){const now=new Date(),start=dateOf(event),days=Math.round((Date.UTC(start.getFullYear(),start.getMonth(),start.getDate())-Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);return days<0?'In progress':days===0?'Today':days===1?'Tomorrow':`In ${days} days`;}
export function setupUpcoming(getChart,getState,commit){
 const key='sas-public-school-calendar-v1';let saved=null,events=[],loadedAt=0,error='',loading=false,generation=0,controller;
 // Move the former browser-only connection into the synced classroom document.
 if(getState().publicCalendar===undefined){try{const legacy=JSON.parse(localStorage.getItem(key));if(legacy){const calendar={name:String(legacy.name||'School events').slice(0,80),url:publicGoogleCalendar(legacy.url)};commit(()=>{getState().publicCalendar=calendar;});}localStorage.removeItem(key);}catch{}}
 saved=getState().publicCalendar||null;let calendarSignature=JSON.stringify(saved);
 function resetCalendar(){generation++;controller?.abort();loading=false;events=[];loadedAt=0;error='';}
 function syncCalendar(){const next=getState().publicCalendar||null,signature=JSON.stringify(next);if(signature!==calendarSignature){dialog?.close();resetCalendar();saved=next;calendarSignature=signature;renderCalendar();load();}}

 const panel=make('details');panel.className='upcoming-panel';panel.open=true;
 const summary=make('summary','Next up'),body=make('div'),birthdayWrap=make('section'),birthdaySettings=make('button','⋮'),birthday=make('button'),calendar=make('section'),settings=make('button','Connect calendar'),card=make('button');
 body.className='upcoming-body';birthday.dataset.glyphDone='true';card.dataset.glyphDone='true';birthday.type='button';birthday.className='upcoming-birthday-card';birthday.title='View class birthdays';birthday.onclick=()=>document.getElementById('birthdays-open').click();calendar.className='upcoming-calendar';settings.type='button';settings.id='public-calendar-settings';settings.dataset.glyphDone='true';settings.setAttribute('aria-label','Calendar settings');settings.title='Calendar settings';settings.textContent='⋮';card.type='button';card.className='upcoming-event-card';card.setAttribute('aria-label','View upcoming school events');calendar.append(card,settings);birthdayWrap.className='upcoming-birthday';birthdaySettings.id='birthday-widget-settings';birthdaySettings.type='button';birthdaySettings.dataset.glyphDone='true';birthdaySettings.setAttribute('aria-label','Birthday widget settings');birthdaySettings.title='Birthday widget settings';birthdayWrap.append(birthday,birthdaySettings);body.append(birthdayWrap,calendar);panel.append(summary,body);document.querySelector('.workspace').before(panel);
 let signature='';function refreshBirthday(){const students=getChart().students,early=getState().birthdayPreferences?.weekendEarly!==false,next=JSON.stringify([students.map(s=>[s.name,s.birthday]),early,getState().birthdayPreferences?.colorScheme,new Date().toDateString()]);if(next!==signature){signature=next;birthday.replaceChildren(birthdayCountdown(students,early,getState().birthdayPreferences?.colorScheme));}}
 birthdaySettings.onclick=()=>{
  const d=make('dialog');d.className='workspace-dialog public-calendar-dialog birthday-color-dialog';d.setAttribute('aria-label','Birthday widget settings');
  const scheme=make('select');scheme.setAttribute('aria-label','Birthday color scheme');for(const [value,colors] of Object.entries(CALENDAR_COLORS)){const option=make('option',colors.name);option.value=value;scheme.append(option);}scheme.value=getState().birthdayPreferences?.colorScheme||'rose';
  const label=make('label','Color scheme');label.append(scheme);const preview=make('div');const paint=()=>preview.replaceChildren(birthdayCountdown(getChart().students,getState().birthdayPreferences?.weekendEarly!==false,scheme.value));scheme.onchange=paint;paint();
  const save=make('button','Save birthday colors'),cancel=make('button','Cancel'),actions=make('div');save.className='primary';actions.className='birthday-directory-actions';save.onclick=()=>{commit(()=>{getState().birthdayPreferences={weekendEarly:true,...getState().birthdayPreferences,colorScheme:scheme.value};},'Birthday colors saved.');refreshBirthday();d.close();};cancel.onclick=()=>d.close();actions.append(save,cancel);d.append(make('h2','Birthday widget'),label,preview,make('p','Colors are saved with your classrooms and sync through your cloud account.'),actions);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
 };
 const activeEvents=()=>events.filter(event=>{const end=event.allDay?new Date(event.end+'T00:00:00'):new Date(event.end);return Math.max(end.getTime(),dateOf(event).getTime()+1)>Date.now();});
 function renderCalendar(){
  applyCalendarColor(calendar,saved?.colorScheme);card.replaceChildren();
  const upcoming=activeEvents(),event=upcoming[0];card.classList.toggle('has-event',!!event);card.disabled=false;
  if(!saved){card.append(make('strong','School events'),make('span','Connect a public calendar'));return;}
  const label=make('small',saved.name||'School events');card.append(label);
  if(event){const badge=make('span',dateOf(event).toLocaleDateString(undefined,{month:'short',day:'numeric'}));badge.className='upcoming-date-badge';card.append(badge,make('strong',event.title),make('span',`${eventCountdown(event)} · ${eventWhen(event)}`));}
  else card.append(make('strong',loading?'Loading next event…':error?'Calendar preview unavailable':'No upcoming events'),make('span',loading?'Checking the public calendar':error?'Click to retry or open the full calendar':'No events in the next year · View calendar'));
  if(error&&event)card.append(make('small','Saved preview · refresh unavailable'));
  renderDialog();
 }
 let dialog=null;
 function fullLink(){const link=make('a','Open full calendar ↗'),url=new URL(saved.url);url.searchParams.set('mode','MONTH');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';return link;}
 function renderDialog(){if(!dialog?.isConnected)return;const list=dialog.querySelector('.upcoming-event-list'),status=dialog.querySelector('[role=status]');list.replaceChildren();status.textContent=error||(loading?'Refreshing…':loadedAt?'Updated '+new Date(loadedAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'}):'');
  for(const event of activeEvents()){const row=make('article'),heading=make('h3',event.title);row.append(make('small',eventCountdown(event)),heading,make('p',eventWhen(event)));if(event.location)row.append(make('p',event.location));if(event.description){const more=make('details'),text=make('p',event.description);text.className='upcoming-description';more.append(make('summary','Event details'),text);row.append(more);}list.append(row);}
  if(!list.children.length)list.append(make('p',loading?'Loading events…':error?'Use Refresh to try again, or open the full calendar.':'No upcoming events in the next year.'));
 }
 card.onclick=()=>{if(!saved){settings.click();return;}dialog=make('dialog');dialog.className='workspace-dialog upcoming-events-dialog';dialog.setAttribute('aria-label','Upcoming school events');applyCalendarColor(dialog,saved.colorScheme);const head=make('h2',saved.name||'School events'),list=make('div'),status=make('p'),actions=make('div'),refresh=make('button','Refresh'),close=make('button','Close');list.className='upcoming-event-list';status.setAttribute('role','status');actions.className='birthday-directory-actions';refresh.onclick=()=>load(true);close.onclick=()=>dialog.close();actions.append(refresh,fullLink(),close);dialog.append(head,status,list,actions);dialog.onclose=()=>{dialog.remove();dialog=null;};document.body.append(dialog);renderDialog();dialog.showModal();load();};
 async function load(force=false){
  if(!saved||loading||(!force&&Date.now()-loadedAt<300000))return;
  const version=generation,calendarURL=saved.url;loading=true;error='';renderCalendar();controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{const endpoint=new URL(cloudConfig.url+'/functions/v1/public-calendar');endpoint.searchParams.set('calendar',new URL(calendarURL).searchParams.get('src'));endpoint.searchParams.set('zone',Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC');const response=await fetch(endpoint,{headers:{apikey:cloudConfig.publishableKey},signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not refresh the calendar.');if(!Array.isArray(data.events))throw new Error('Calendar preview unavailable.');if(version!==generation)return;
   events=data.events;loadedAt=Date.now();
  }catch(e){if(version===generation)error=e.message==='Failed to fetch'?'Could not refresh the calendar. Check your connection.':e.name==='AbortError'?'Calendar refresh timed out. Try again.':e.message;}
  finally{clearTimeout(timeout);if(version===generation){loading=false;renderCalendar();}}
 }
 settings.onclick=()=>{const d=make('dialog');d.className='workspace-dialog public-calendar-dialog';d.setAttribute('aria-label','Public school calendar');const name=make('input'),url=make('input'),error=make('p');name.value=saved?.name||'';name.maxLength=80;url.type='url';url.required=true;url.value=saved?.url||'';url.placeholder='https://calendar.google.com/calendar/embed?src=…';error.setAttribute('role','status');const label=(text,input)=>{const l=make('label',text);l.append(input);return l;};
  const scheme=make('select');scheme.setAttribute('aria-label','Calendar color scheme');for(const [value,colors] of Object.entries(CALENDAR_COLORS)){const option=make('option',colors.name);option.value=value;scheme.append(option);}scheme.value=saved?.colorScheme||'blue';
  const preview=make('div');preview.className='calendar-color-preview';preview.append(make('strong','Next school event'),make('span','A preview of your calendar and event cards'));const paintPreview=()=>applyCalendarColor(preview,scheme.value);scheme.onchange=paintPreview;paintPreview();
  function reset(){resetCalendar();}
  const save=make('button','Save calendar'),remove=make('button','Disconnect'),cancel=make('button','Cancel');save.className='primary';remove.hidden=!saved;
  save.onclick=()=>{try{const next={name:name.value.trim()||'School events',url:publicGoogleCalendar(url.value),colorScheme:scheme.value};reset();saved=next;calendarSignature=JSON.stringify(next);commit(()=>{getState().publicCalendar=next;},'Calendar saved with your classrooms.');renderCalendar();panel.open=true;d.close();load();}catch(e){error.textContent=e.message;}};
  remove.onclick=()=>{try{reset();saved=null;calendarSignature=JSON.stringify(null);commit(()=>{getState().publicCalendar=null;},'Calendar disconnected.');renderCalendar();d.close();}catch{error.textContent='Could not update browser storage.';}};cancel.onclick=()=>d.close();const actions=make('div');actions.className='birthday-directory-actions';actions.append(save,remove,cancel);d.append(make('h2','Public school calendar'),make('p','In Google Calendar, open Settings → your calendar → Integrate calendar. Paste the Public URL, embed URL, or public iCal address. The calendar must be available to the public.'),label('Calendar name',name),label('Public calendar link',url),label('Color scheme',scheme),preview,make('p','Saved with your classrooms and synced through your signed-in cloud account. Only the public calendar ID and your time zone are sent to load events; no student information is sent.'),error,actions);d.onclose=()=>d.remove();document.body.append(d);d.showModal();};
 refreshBirthday();renderCalendar();load();setInterval(()=>{refreshBirthday();if(!document.hidden){renderCalendar();load();}},60000);panel.addEventListener('toggle',refreshBirthday);document.addEventListener('visibilitychange',()=>{refreshBirthday();if(!document.hidden)load();});
 // Classroom edits and switching classes update the birthday widget promptly.
 setInterval(()=>{refreshBirthday();syncCalendar();},1500);
 document.addEventListener('sas-chart-edited',()=>{refreshBirthday();syncCalendar();});
}
