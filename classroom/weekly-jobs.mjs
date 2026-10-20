// Local calendar dates avoid UTC shifting a classroom's week at midnight.
export function weekStart(value = new Date()) {
  const d = typeof value === 'string' ? new Date(value + 'T12:00:00') : new Date(value);
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function validateWeeklyJobs(value) {
  if (!value || !Number.isInteger(value.count) || value.count < 1 || value.count > 20 || !Array.isArray(value.weeks) || value.weeks.length > 520) throw new Error('Invalid weekly jobs.');
  const dates = new Set();
  return {count:value.count,weeks:value.weeks.map(w=>{
    if (!w || typeof w.week !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(w.week) || !Number.isFinite(Date.parse(w.week+'T12:00:00')) || weekStart(w.week)!==w.week || dates.has(w.week) || !Array.isArray(w.students) || w.students.length>20 || new Set(w.students).size!==w.students.length || w.students.some(id=>typeof id!=='string'||!id||id.length>100)) throw new Error('Invalid weekly job assignment.');
    dates.add(w.week);return {week:w.week,students:[...w.students]};
  })};
}
export function pickCleaners(students, weeks, week, count, excluded = [], random = Math.random) {
  const last = new Map();
  for (const entry of weeks) if (entry.week < week) for (const id of entry.students) if (!last.has(id) || last.get(id)<entry.week) last.set(id,entry.week);
  const pool = students.filter(s=>!excluded.includes(s.id)).map(s=>({id:s.id,last:last.get(s.id)||'',tie:random()}));
  pool.sort((a,b)=>a.last.localeCompare(b.last)||a.tie-b.tie);
  return pool.slice(0,count).map(s=>s.id);
}
