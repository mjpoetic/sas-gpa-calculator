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
 if(value.rotationStart!==undefined&&(!Number.isInteger(value.rotationStart)||value.rotationStart<0||value.rotationStart>(draws?.length||0)))throw new Error('Invalid cleaner rotation.');
 return {count:value.count,weeks,...(draws?{draws}:{}),...(value.rotationStart!==undefined?{rotationStart:value.rotationStart}:{})};
}
export function cleanerHistory(jobs){return jobs.draws||[...jobs.weeks].sort((a,b)=>a.week.localeCompare(b.week));}
export function cleanerPool(students,jobs){
 const ids=new Set(students.map(s=>s.id)),seen=new Set();
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
 jobs.draws.push({week,students:[...ids],names:ids.map(id=>{const s=students.find(s=>s.id===id);return s?.nickname||s?.name||'Removed student';})});
}
