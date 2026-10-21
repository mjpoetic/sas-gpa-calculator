import {seatName} from './student-names.mjs?v=20261021-release5';
import {eligibleStudents} from './student-eligibility.mjs?v=20261020-exclusions1';
// Local calendar dates avoid UTC shifting a classroom's week at midnight.
export function weekStart(value = new Date()) {
  const d = typeof value === 'string' ? new Date(value + 'T12:00:00') : new Date(value);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function validEntry(w){
 if(!w||typeof w.week!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(w.week)||!Number.isFinite(Date.parse(w.week+'T12:00:00'))||weekStart(w.week)!==w.week||!Array.isArray(w.students)||w.students.length>20||new Set(w.students).size!==w.students.length||w.students.some(id=>typeof id!=='string'||!id||id.length>100))throw new Error('Invalid weekly job assignment.');
 if(w.names!==undefined&&(!Array.isArray(w.names)||w.names.length!==w.students.length||w.names.some(n=>typeof n!=='string'||n.length>100)))throw new Error('Invalid cleaner history names.');
 return {week:w.week,students:[...w.students],...(w.names?{names:[...w.names]}:{})};
}
export function validateWeeklyJobs(value) {
 if(!value||!Number.isInteger(value.count)||value.count<1||value.count>20||!Array.isArray(value.weeks)||value.weeks.length>520)throw new Error('Invalid weekly jobs.');
 const dates=new Set(),weeks=value.weeks.map(w=>{const entry=validEntry(w);if(dates.has(w.week))throw new Error('Duplicate cleaner week.');dates.add(w.week);return entry;});
 if(value.draws!==undefined&&(!Array.isArray(value.draws)||value.draws.length>10000))throw new Error('Invalid cleaner history.');
 const draws=value.draws?.map(validEntry);
 if(value.rotationSeen!==undefined&&(!Array.isArray(value.rotationSeen)||value.rotationSeen.length>500||new Set(value.rotationSeen).size!==value.rotationSeen.length||value.rotationSeen.some(id=>typeof id!=='string'||!id||id.length>100)))throw new Error('Invalid cleaner rotation progress.');
 if(value.rotationStart!==undefined&&(!Number.isInteger(value.rotationStart)||value.rotationStart<0||value.rotationStart>(draws?.length||0)))throw new Error('Invalid cleaner rotation.');
 return {count:value.count,weeks,...(value.rotationSeen!==undefined?{rotationSeen:[...value.rotationSeen]}:{}),...(draws?{draws}:{}),...(value.rotationStart!==undefined?{rotationStart:value.rotationStart}:{})};
}
export function cleanerHistory(jobs){return jobs.draws||[...jobs.weeks].sort((a,b)=>a.week.localeCompare(b.week));}
export function cleanerPool(students,jobs,excluded=[]){
 students=students.filter(s=>!excluded.includes(s.id));
 const ids=new Set(students.map(s=>s.id)),seen=new Set((jobs.rotationSeen||[]).filter(id=>ids.has(id)));
 for(const entry of cleanerHistory(jobs).slice(jobs.rotationStart||0))for(const id of entry.students){if(!ids.has(id))continue;if(seen.size===ids.size)seen.clear();seen.add(id);}
 if(seen.size===ids.size)seen.clear();
 return students.filter(s=>!seen.has(s.id));
}
export function pickCleaners(students,weeks,week,count,excluded=[],random=Math.random,jobs=null){
 const pool=cleanerPool(students,jobs||{weeks:weeks.filter(w=>w.week<week)}).filter(s=>!excluded.includes(s.id)).map(s=>({id:s.id,tie:random()}));
 pool.sort((a,b)=>a.tie-b.tie);return pool.slice(0,count).map(s=>s.id);
}
export function recordCleaners(jobs,students,week,ids){
 jobs.draws??=cleanerHistory(jobs).map(w=>({...w,students:[...w.students]}));
 if(jobs.draws.length>=10000)throw new Error('Cleaner history is full. Export a backup before starting a new classroom.');
 jobs.draws.push({week,students:[...ids],names:ids.map(id=>{const s=students.find(s=>s.id===id);return s?seatName(s,students):'Removed student';})});
}

export function setManualCleaners(chart,week,ids){
 const jobs=chart.weeklyJobs||{count:3,weeks:[]},entry=jobs.weeks.find(w=>w.week===week);
 if(!Array.isArray(ids)||!ids.length||ids.length>jobs.count||new Set(ids).size!==ids.length)throw new Error('Choose between 1 and '+jobs.count+' cleaners.');
 const eligible=new Set([...cleanerPool(eligibleStudents(chart,'cleaners'),jobs).map(s=>s.id),...(entry?.students||[])]),roster=new Set(chart.students.map(s=>s.id));
 if(ids.some(id=>!roster.has(id)||!eligible.has(id)))throw new Error('Choose students who are eligible this round. Reopen the chooser if the roster has changed.');
 const added=ids.filter(id=>!entry?.students.includes(id));
 if(added.length)recordCleaners(jobs,chart.students,week,added);
 if(entry)entry.students=[...ids];else jobs.weeks.push({week,students:[...ids]});
 jobs.weeks.sort((a,b)=>a.week.localeCompare(b.week));jobs.weeks=jobs.weeks.slice(-520);chart.weeklyJobs=jobs;
}

export function deleteCleanerHistory(chart,currentWeek=weekStart()){
 const jobs=chart.weeklyJobs;if(!jobs)return;
 const remaining=new Set(cleanerPool(chart.students,jobs).map(s=>s.id));
 jobs.rotationSeen=chart.students.filter(s=>!remaining.has(s.id)).map(s=>s.id);
 jobs.draws=[];jobs.rotationStart=0;jobs.weeks=jobs.weeks.filter(w=>w.week>=currentWeek);
}
