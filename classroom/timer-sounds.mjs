export const TIMER_SOUNDS={chime:'Chime',bell:'Bell',beep:'Digital beep',gong:'Soft gong',alarm:'Classic alarm clock',duck:'Duck quacks',cowbell:'Cowbell',loudgong:'Loud gong',dog:'Dog barks'};
export function timerSoundPattern(type){
 if(type==='chime')return [523.25,659.25,783.99].map((frequency,i)=>({frequency,at:i*.22,duration:.85,gain:.11,wave:'sine'}));
 if(type==='bell')return [880,1760,2640].map((frequency,i)=>({frequency,at:0,duration:1.8-i*.3,gain:.12/(i+1),wave:'sine'}));
 if(type==='gong'||type==='loudgong')return [196,293.66,587.33,827].map((frequency,i)=>({frequency,at:i*.025,duration:3.1-i*.35,gain:(type==='loudgong'?.24:.1)/(i+1),wave:'sine'}));
 if(type==='alarm')return Array.from({length:12},(_,i)=>({frequency:i%2?1318:880,at:i*.13,duration:.11,gain:.18,wave:'square'}));
 if(type==='cowbell')return [0,.4,.8].flatMap(at=>[560,845].map((frequency,i)=>({frequency,at,duration:.29,gain:.17/(i+1),wave:'square'})));
 if(type==='duck')return [0,.52,1.04].flatMap(at=>[{frequency:520,frequencyEnd:240,at,duration:.35,gain:.2,wave:'sawtooth',filter:1100,q:4,mod:22,depth:50},{frequency:780,frequencyEnd:430,at:at+.02,duration:.28,gain:.075,wave:'sawtooth',filter:1500,q:3}]);
 if(type==='dog')return [0,.4,1.1].flatMap(at=>[{frequency:180,frequencyEnd:90,at,duration:.24,gain:.22,wave:'sawtooth',filter:650,q:1.5},{noise:true,frequency:750,at,duration:.2,gain:.18,filter:900,q:.8}]);
 return [0,.35,.7].map(at=>({frequency:660,at,duration:.25,gain:.1,wave:'sine'}));
}
export function timerSoundDuration(type){return Math.max(...timerSoundPattern(type).map(t=>t.at+t.duration))+.2;}
