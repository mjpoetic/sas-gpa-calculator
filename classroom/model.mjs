export const WIDTH = 960, HEIGHT = 680;
export const catalog = {
  desk: {label: 'Student desk', width: 100, height: 80, seats: 1},
  pair: {label: 'Double desk', width: 180, height: 80, seats: 2},
  group: {label: 'Group table', width: 160, height: 130, seats: 4},
  round: {label: 'Round table', width: 150, height: 150, seats: 4},
  teacher: {label: 'Teacher desk', width: 150, height: 70, seats: 0},
  board: {label: 'Whiteboard', width: 260, height: 30, seats: 0},
  shelf: {label: 'Bookshelf', width: 130, height: 45, seats: 0},
  door: {label: 'Door', width: 80, height: 60, seats: 0},
  rug: {label: 'Reading rug', width: 180, height: 140, seats: 0},
  label: {label: 'Room label', width: 160, height: 40, seats: 0}
};
export const uid = () => crypto.randomUUID();
export function furniture(type, x = 400, y = 280) {
  const spec = catalog[type];
  return {id: uid(), type, label: spec.label, width: spec.width, height: spec.height, x, y, rotation: 0, seats: Array.from({length: spec.seats}, () => ({student: null, locked: false}))};
}
export function constrain(item) {
  const rotated = item.rotation % 180 !== 0;
  const dx = (rotated ? item.height - item.width : 0) / 2;
  const dy = (rotated ? item.width - item.height : 0) / 2;
  item.x = Math.max(dx, Math.min(WIDTH - item.width - dx, item.x));
  item.y = Math.max(dy, Math.min(HEIGHT - item.height - dy, item.y));
  return item;
}
export function layout(kind) {
  const items = [furniture('board', 350, 20), furniture('teacher', 740, 75), furniture('door', 20, 30)];
  if (kind === 'groups') {
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) items.push(furniture('group', 150 + c * 245, 180 + r * 230));
  } else if (kind === 'horseshoe') {
    for (let r = 0; r < 6; r++) {items.push(furniture('desk', 100, 100 + r * 90)); items.push(furniture('desk', 760, 100 + r * 90));}
    for (let c = 0; c < 6; c++) items.push(furniture('desk', 210 + c * 90, 590));
  } else {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) items.push(furniture('pair', 130 + c * 250, 160 + r * 120));
  }
  return items;
}
export function newChart(name = 'My classroom') {return {id: uid(), name, students: [], items: layout('rows')};}
export function seats(chart) {return chart.items.flatMap(item => item.seats);}
export function assignUnseated(chart) {
  const assigned = new Set(seats(chart).map(s => s.student).filter(Boolean));
  const available = seats(chart).filter(s => !s.student && !s.locked);
  chart.students.filter(s => !assigned.has(s.id)).forEach((student, i) => {if (available[i]) available[i].student = student.id;});
}
// Shuffle only assignments. Locked seats and every furniture property stay intact.
// A random cyclic shift guarantees a different seat for each movable seated student.
export function shuffle(chart, random = Math.random) {
  const movable = seats(chart).filter(s => !s.locked);
  const assigned = movable.filter(s => s.student);
  if (assigned.length >= 2) {
    const ids = assigned.map(s => s.student);
    const offset = 1 + Math.floor(random() * (ids.length - 1));
    assigned.forEach((s, i) => {s.student = ids[(i + offset) % ids.length];});
  }
  assignUnseated(chart);
}
export function validateBackup(data) {
  if (data?.version !== 1 || !Array.isArray(data.charts) || !data.charts.length || data.charts.length > 100) throw new Error('Choose a Classroom Studio backup (version 1).');
  const ids = new Set();
  const id = value => {if (typeof value !== 'string' || !value || value.length > 100 || ids.has(value)) throw new Error('Invalid or duplicate ID in backup.'); ids.add(value); return value;};
  const str = (value, max) => {if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error('Invalid name in backup.'); return value;};
  const num = (value, min, max) => {if (!Number.isFinite(value) || value < min || value > max) throw new Error('Invalid furniture dimensions in backup.'); return value;};
  const charts = data.charts.map(c => {
    if (!Array.isArray(c.students) || c.students.length > 500 || !Array.isArray(c.items) || c.items.length > 500) throw new Error('Backup exceeds classroom limits.');
    const students = c.students.map(s => ({id: id(s.id), name: str(s.name, 80)}));
    const studentIds = new Set(students.map(s => s.id)), assigned = new Set();
    const items = c.items.map(it => {
      if (!Object.hasOwn(catalog, it.type) || !Array.isArray(it.seats) || it.seats.length !== catalog[it.type].seats || ![0,90,180,270].includes(it.rotation)) throw new Error('Invalid furniture in backup.');
      return constrain({id: id(it.id), type: it.type, label: str(it.label, 60), width: num(it.width,40,400), height: num(it.height,30,300), x:num(it.x,-200,1160), y:num(it.y,-200,880), rotation:it.rotation, seats:it.seats.map(s => {
        if (typeof s.locked !== 'boolean' || (s.student !== null && (!studentIds.has(s.student) || assigned.has(s.student)))) throw new Error('Invalid student assignment in backup.');
        if (s.student) assigned.add(s.student);
        return {student:s.student, locked:s.locked};
      })});
    });
    return {id:id(c.id), name:str(c.name,80), students, items};
  });
  return {version:1, charts, active:charts.some(c => c.id === data.active) ? data.active : charts[0].id};
}
