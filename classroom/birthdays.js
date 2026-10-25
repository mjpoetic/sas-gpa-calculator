import {avatarSVG,defaultAvatar} from './avatars.mjs?v=20261024-release1';
import {seatName} from './student-names.mjs?v=20261024-release1';
import {validateBirthday,birthdayToday} from './celebration-date.mjs?v=20261024-release1';
const make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function editBirthday(student,getChart,commit){
 const chartId=getChart().id,d=make('dialog');d.className='workspace-dialog';d.setAttribute('aria-label','Student birthday');
 d.append(make('h2',`Birthday · ${student.name}`),make('p','Enter month and day. A celebration opens on their birthday and stays until dismissed.'));
 const month=make('select'),day=make('select');month.setAttribute('aria-label','Birthday month');day.setAttribute('aria-label','Birthday day');
 for(let i=1;i<=12;i++){const o=make('option',new Date(2000,i-1,1).toLocaleDateString('en',{month:'long'}));o.value=String(i).padStart(2,'0');month.append(o);}
 const days=()=>{const previous=day.value;day.replaceChildren();for(let i=1;i<=new Date(2000,Number(month.value),0).getDate();i++){const o=make('option',String(i));o.value=String(i).padStart(2,'0');day.append(o);}if([...day.options].some(o=>o.value===previous))day.value=previous;};month.onchange=days;
 if(student.birthday)month.value=student.birthday.slice(0,2);days();if(student.birthday)day.value=student.birthday.slice(3);
 const save=make('button','Save birthday'),clear=make('button','Remove birthday'),preview=make('button','Celebrate now'),cancel=make('button','Cancel');save.className='primary';
 const current=()=>getChart().id===chartId?getChart().students.find(s=>s.id===student.id):null;
 save.onclick=()=>{const st=current();if(st)commit(()=>{st.birthday=validateBirthday(`${month.value}-${day.value}`);},'Birthday saved.');d.close();};clear.onclick=()=>{const st=current();if(st)commit(()=>delete st.birthday,'Birthday removed.');d.close();};preview.onclick=()=>{d.close();celebrate(student);};cancel.onclick=()=>d.close();
 const ml=make('label','Month'),dl=make('label','Day');ml.append(month);dl.append(day);d.append(ml,dl,save,clear,preview,cancel);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
}
function celebrate(student,onDismiss=()=>{}){
 const d=make('dialog');d.className='workspace-dialog random-picker birthday-celebration';d.setAttribute('aria-label',`Happy birthday, ${seatName(student,[student])}!`);
 const title=make('h2','Happy Birthday!'),stage=make('div'),portrait=make('div'),name=make('div',seatName(student,[student])),close=make('button','Dismiss celebration');stage.className='random-picker-stage';portrait.className='random-picker-avatar birthday-portrait';name.className='random-picker-name';
 portrait.innerHTML=avatarSVG({...defaultAvatar(),...student.avatar,enabled:true,expression:'grin',eyes:'happy',accessory:'none'})+'<svg class="birthday-hat" viewBox="0 0 120 60" aria-hidden="true"><path d="M36 55 60 4 84 55Z" fill="#ac63cf" stroke="#fff" stroke-width="2"/><path d="m44 38 24-18m-18 30 25-19" stroke="#ffdc72" stroke-width="5"/><circle cx="60" cy="5" r="5" fill="#ffdc72"/></svg>';
 const decor=make('div','🎈  ✦  🎉  ✦  🎈');decor.className='birthday-decor';decor.setAttribute('aria-hidden','true');stage.append(decor,portrait,name);d.append(title,stage,close);let dismissed=false;const finish=()=>{if(!dismissed){dismissed=true;onDismiss();}};close.onclick=()=>{finish();d.close();};d.addEventListener('cancel',finish);d.onclose=()=>{finish();d.remove();};document.body.append(d);d.showModal();
}
export function setupBirthdays(getChart,commit){
 let active=false;const dismissed=new Set();
 const check=()=>{if(active||document.hidden||document.querySelector('dialog[open]'))return;const c=getChart(),now=new Date(),date=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;const key=st=>`sas-birthday:${date}:${c.id}:${st.id}`;
 const st=c.students.find(s=>birthdayToday(s.birthday,now)&&!dismissed.has(key(s))&&(()=>{try{return !localStorage.getItem(key(s));}catch{return true;}})());if(!st)return;active=true;const stamp=key(st);celebrate(st,()=>{dismissed.add(stamp);try{localStorage.setItem(stamp,'dismissed');}catch{}active=false;setTimeout(check,300);});};
 const button=make('button','🎂 Birthdays');button.id='birthdays-open';button.type='button';button.onclick=()=>{const c=getChart(),d=make('dialog');d.className='workspace-dialog';d.setAttribute('aria-label','Class birthdays');d.append(make('h2','Class birthdays'),make('p','Choose a student to enter a birthday or celebrate now.'));for(const st of [...c.students].sort((a,b)=>(a.birthday||'99').localeCompare(b.birthday||'99'))){const b=make('button',`${st.name} · ${st.birthday||'Add birthday'}`);b.onclick=()=>{d.close();editBirthday(st,getChart,commit);};d.append(b);}const close=make('button','Close');close.onclick=()=>d.close();d.append(close);d.onclose=()=>d.remove();document.body.append(d);d.showModal();};document.getElementById('random-picker-open').before(button);setInterval(check,1500);document.addEventListener('visibilitychange',check);
}