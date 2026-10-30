export const TIMER_SOUNDS={chime:'Chime',bell:'Bell',beep:'Digital beep',gong:'Soft gong'};
export function timerSoundPattern(type){
 if(type==='chime')return [523.25,659.25,783.99].map((frequency,i)=>({frequency,at:i*.22,duration:.85,gain:.11,wave:'sine'}));
 if(type==='bell')return [880,1760,2640].map((frequency,i)=>({frequency,at:0,duration:1.8-i*.3,gain:.12/(i+1),wave:'sine'}));
 if(type==='gong')return [196,392,587].map((frequency,i)=>({frequency,at:i*.025,duration:2.6-i*.3,gain:.12/(i+1),wave:'sine'}));
 return [0,.35,.7].map(at=>({frequency:660,at,duration:.25,gain:.1,wave:'sine'}));
}
