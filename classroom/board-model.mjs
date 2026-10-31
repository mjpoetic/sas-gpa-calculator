import {normalizeTimerBox} from './timer-geometry.mjs?v=20261031-release3';
import {TIMER_SOUNDS} from './timer-sounds.mjs?v=20261031-release3';
import {validateRich} from './note-rich.mjs?v=20261031-release3';
import {validateFont} from '../assets/font-options.mjs?v=20261031-release3';
export const BOARD_COLORS=['#f3f6fa','#e4edf1','#20384b','#f6eddf','#e5eee4'];
export const NOTE_COLORS=['#fff1bb','#ffffff','#dceefb','#e1f0de','#f8e1e9','#eee4fa'];
export function newNote(id,index=0){return {id,title:'',text:'',x:40+(index%5)*28,y:40+(index%5)*28,width:440,height:300,color:NOTE_COLORS[0],ink:'#20354e',fontSize:28,align:'left',locked:false,hidden:false};}
export function validateBoard(board,id){
 const fail=()=>{throw new Error('Invalid classroom board in backup.');};
 if(!board||!BOARD_COLORS.includes(board.color)||!Array.isArray(board.notes)||board.notes.length>100)fail();
 const number=(v,min,max)=>{if(!Number.isFinite(v)||v<min||v>max)fail();return v;};
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)fail();return v;};
 return {color:board.color,...(board.timers!==undefined?{timers:validateTimers(board.timers,id)}:{}),notes:board.notes.map(n=>{
  if(!n||!NOTE_COLORS.includes(n.color)||!/^#[0-9a-f]{6}$/i.test(n.ink)||!['left','center','right'].includes(n.align)||typeof n.locked!=='boolean'||typeof n.hidden!=='boolean')fail();
  const width=number(n.width,220,1200),height=number(n.height,140,800);
  return {...(n.titleRich!==undefined?{titleRich:validateRich(n.titleRich,120)}:{}),...(n.rich!==undefined?{rich:validateRich(n.rich)}:{}),...(n.font?{font:validateFont(n.font)}:{}),id:id(n.id),title:text(n.title,120),text:text(n.text,12000),x:number(n.x,0,1600-width),y:number(n.y,0,900-height),width,height,color:n.color,ink:n.ink,fontSize:number(n.fontSize,16,64),align:n.align,locked:n.locked,hidden:n.hidden};
 })};
}

export function validateTimers(timers,id){
 if(!Array.isArray(timers)||timers.length>20)throw new Error('Invalid board timers.');
 const num=(v,min,max)=>{if(!Number.isFinite(v)||v<min||v>max)throw new Error('Invalid timer setting.');return v;};
 return timers.map(t=>{if(!t||typeof t.label!=='string'||t.label.length>120)throw new Error('Invalid timer.');const appearance={};if(t.style!==undefined){if(!['digital','ring','bar','split'].includes(t.style))throw new Error('Invalid timer style.');appearance.style=t.style;}if(t.font!==undefined)appearance.font=validateFont(t.font);for(const key of ['background','accent'])if(t[key]!==undefined){if(!/^#[0-9a-f]{6}$/i.test(t[key]))throw new Error('Invalid timer color.');appearance[key]=t[key];}if(t.soundType!==undefined){if(!Object.hasOwn(TIMER_SOUNDS,t.soundType))throw new Error('Invalid timer sound.');appearance.soundType=t.soundType;}for(const key of ['repeatAlarm'])if(t[key]!==undefined){if(typeof t[key]!=='boolean')throw new Error('Invalid timer alarm setting.');appearance[key]=t[key];}if(t.soundVolume!==undefined)appearance.soundVolume=num(t.soundVolume,0,1);if(t.alarmDismissedAt!==undefined)appearance.alarmDismissedAt=t.alarmDismissedAt===null?null:num(t.alarmDismissedAt,0,4102444800000);num(t.x,0,1600);num(t.y,0,900);const width=num(t.width,220,1200),height=num(t.height,140,800),box=normalizeTimerBox({...t,width,height});return {...appearance,id:id(t.id),label:t.label,duration:num(t.duration,1,86400),remaining:num(t.remaining,0,86400),endsAt:t.endsAt===null?null:num(t.endsAt,0,4102444800000),...box,sound:t.sound===true};});
}
export function timerSeconds(timer,now=Date.now()){return timer.endsAt===null?timer.remaining:Math.max(0,Math.ceil((timer.endsAt-now)/1000));}
