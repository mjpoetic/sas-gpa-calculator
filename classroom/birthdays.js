import {openBirthdayReminders} from './birthday-reminders.js?v=20261030-release2';
import {openSISBirthdays} from './birthday-sis.js?v=20261030-release2';
import {openBulkBirthdays} from './birthday-bulk.js?v=20261030-release2';
import {paintBirthdayPortrait} from './birthday-portrait.js?v=20261030-release2';
import {seatName} from './student-names.mjs?v=20261030-release2';
import {validateBirthday,birthdayOccasion,nextBirthday} from './celebration-date.mjs?v=20261030-release2';
const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function editBirthday(student,getChart,commit,preferences={}){
 const chartId=getChart().id,d=make('dialog');d.className='workspace-dialog';d.setAttribute('aria-label','Student birthday');
 d.append(make('h2',`Birthday · ${student.name}`),make('p','Enter month and day. A celebration opens on their birthday and stays until dismissed.'));
 const month=make('select'),day=make('select');month.setAttribute('aria-label','Birthday month');day.setAttribute('aria-label','Birthday day');
 for(let i=1;i<=12;i++){const o=make('option',new Date(2000,i-1,1).toLocaleDateString('en',{month:'long'}));o.value=String(i).padStart(2,'0');month.append(o);}
 const days=()=>{const previous=day.value;day.replaceChildren();for(let i=1;i<=new Date(2000,Number(month.value),0).getDate();i++){const o=make('option',String(i));o.value=String(i).padStart(2,'0');day.append(o);}if([...day.options].some(o=>o.value===previous))day.value=previous;};month.onchange=days;
 if(student.birthday)month.value=student.birthday.slice(0,2);days();if(student.birthday)day.value=student.birthday.slice(3);
 const save=make('button','Save birthday'),clear=make('button','Remove birthday'),preview=make('button','Celebrate now'),cancel=make('button','Cancel');save.className='primary';
 const current=()=>getChart().id===chartId?getChart().students.find(s=>s.id===student.id):null;
 save.onclick=()=>{const st=current();if(st)commit(()=>{st.birthday=validateBirthday(`${month.value}-${day.value}`);},'Birthday saved.');d.close();};clear.onclick=()=>{const st=current();if(st)commit(()=>delete st.birthday,'Birthday removed.');d.close();};preview.onclick=()=>{d.close();const occasion=birthdayOccasion(student.birthday,new Date(),preferences.weekendEarly!==false);celebrate(student,()=>{if(occasion)try{localStorage.setItem(`sas-birthday:${occasion.key}:${chartId}:${student.id}`,'dismissed');}catch{}},occasion);};cancel.onclick=()=>d.close();
 const ml=make('label','Month'),dl=make('label','Day');ml.append(month);dl.append(day);d.append(ml,dl,save,clear,preview,cancel);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
}
function celebrate(student,onDismiss=()=>{},occasion=null){
 const d=make('dialog');d.className='workspace-dialog random-picker birthday-celebration';d.setAttribute('aria-label',`Happy birthday, ${seatName(student,[student])}!`);
 const title=make('h2','Happy Birthday!'),stage=make('div'),portrait=make('div'),name=make('div',seatName(student,[student])),close=make('button','Dismiss celebration');stage.className='random-picker-stage';portrait.className='random-picker-avatar birthday-portrait';name.className='random-picker-name';

 const decor=make('div','🎈  ✦  🎉  ✦  🎈');decor.className='birthday-decor';decor.setAttribute('aria-hidden','true');stage.append(decor,portrait,name);const confetti=make('div');confetti.className='birthday-confetti';confetti.setAttribute('aria-hidden','true');for(let i=0;i<64;i++){const piece=make('i');piece.style.cssText=`--x:${(i*37)%100}%;--drift:${(i%2?1:-1)*(20+i%7*12)}px;--delay:${-(i%16)*.37}s;--duration:${4+i%7*.4}s;--spin:${i%2?720:-720}deg;--color:${['#ae62d5','#f4bf46','#42b8ba','#ef789d','#679bea'][i%5]}`;confetti.append(piece);}const caption=make('p',occasion?.early?`Celebrating early — birthday ${occasion.actual.toLocaleDateString('en',{weekday:'long',month:'short',day:'numeric'})}`:'');caption.className='birthday-occasion-caption';d.append(confetti,title,caption,stage,close);let dismissed=false;const finish=()=>{if(!dismissed){dismissed=true;onDismiss();}};close.onclick=()=>{finish();d.close();};d.addEventListener('cancel',finish);d.onclose=()=>{finish();d.remove();};document.body.append(d);d.showModal();paintBirthdayPortrait(portrait,student.avatar);
}
export function setupBirthdays(getChart,commit,getState=()=>({charts:[getChart()]})){
 let active=false;const dismissed=new Set();
 const check=()=>{if(active||document.hidden||document.querySelector('dialog[open]'))return;const c=getChart(),now=new Date(),early=getState().birthdayPreferences?.weekendEarly!==false;
 const occasion=st=>birthdayOccasion(st.birthday,now,early),key=st=>`sas-birthday:${occasion(st)?.key}:${c.id}:${st.id}`;
 const st=c.students.find(s=>occasion(s)&&!dismissed.has(key(s))&&(()=>{try{return !localStorage.getItem(key(s));}catch{return true;}})());if(!st)return;active=true;const stamp=key(st);celebrate(st,()=>{dismissed.add(stamp);try{localStorage.setItem(stamp,'dismissed');}catch{}active=false;setTimeout(check,300);},occasion(st));};
 const button=make('button');button.id='birthdays-open';button.type='button';button.className='birthdays-launch';button.setAttribute('aria-label','Birthdays');button.title='Student birthdays';button.innerHTML='<svg class="button-glyph" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h16v8H4ZM3 21h18M4 16q2 3 4 0q2 3 4 0q2 3 4 0q2 3 4 0M8 9v4m4-4v4m4-4v4"/><path d="M8 3q-3 4 0 4t0-4Zm4 0q-3 4 0 4t0-4Zm4 0q-3 4 0 4t0-4Z"/></g></svg><span>Birthdays</span>';button.onclick=()=>{
  const c=getChart(),d=make('dialog');d.className='workspace-dialog birthday-directory';d.setAttribute('aria-labelledby','birthday-directory-title');d.setAttribute('aria-label','Class birthdays');
  const header=make('header'),title=make('h2','Class birthdays');title.id='birthday-directory-title';header.append(title,make('p','Choose a student to enter a birthday or celebrate now.'));
  const actions=make('div');actions.className='birthday-directory-actions';
  const bulk=make('button','Bulk add birthdays');bulk.id='birthday-bulk-open';bulk.className='primary';bulk.onclick=()=>{d.close();openBulkBirthdays(getChart,commit);};
  const sis=make('button','Import SIS report across lists');sis.id='birthday-sis-open';sis.onclick=()=>{d.close();openSISBirthdays(getState,commit);};const settings=make('button','Birthday reminders');settings.id='birthday-reminders-open';settings.onclick=()=>{d.close();openBirthdayReminders(getState,commit);};actions.append(bulk,sis,settings);
  const grid=make('div');grid.className='birthday-directory-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label','Students in birthday order');
  for(const st of [...c.students].sort((a,b)=>(a.birthday||'99').localeCompare(b.birthday||'99')||a.name.localeCompare(b.name))){
   const card=make('button');card.type='button';card.className='birthday-directory-card';card.dataset.glyphDone='true';card.setAttribute('aria-label',`${st.name} · ${st.birthday||'Add birthday'}`);
   const name=make('span',st.name),date=make('span',st.birthday?new Date(2000,Number(st.birthday.slice(0,2))-1,Number(st.birthday.slice(3))).toLocaleDateString('en',{month:'short',day:'numeric'}):'Add birthday');name.className='birthday-directory-name';date.className='birthday-directory-date';card.append(name,date);const next=nextBirthday(st.birthday,new Date(),getState().birthdayPreferences?.weekendEarly!==false);if(next?.weekend){const badge=make('span',getState().birthdayPreferences?.weekendEarly!==false?`Weekend · celebrate ${next.celebration.toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}`:'Weekend birthday');badge.className='birthday-weekend-badge';card.append(badge);}card.onclick=()=>{d.close();editBirthday(st,getChart,commit,getState().birthdayPreferences);};grid.append(card);
  }
  if(!c.students.length)grid.append(make('p','Add students to this classroom to enter their birthdays.'));
  const footer=make('footer'),close=make('button','Close');close.type='button';close.onclick=()=>d.close();footer.append(close);d.append(header,actions,grid,footer);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
 };document.getElementById('random-picker-open').before(button);if(new URL(location.href).searchParams.get('birthdays')==='1')setTimeout(()=>button.click(),0);setInterval(check,1500);document.addEventListener('visibilitychange',check);
}