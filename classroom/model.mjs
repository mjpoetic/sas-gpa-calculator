import {validateFont,validateWeight} from '../assets/font-options.mjs';
export const WIDTH = 960, HEIGHT = 680;
export const defaultAppearance = () => ({font:{source:'preset',family:'system'},fontSize:11,color:null});
export function validateAppearance(value) {
  if(!value || !Number.isFinite(value.fontSize) || value.fontSize<9 || value.fontSize>24 || (value.color!==null && !/^#[\da-f]{6}$/i.test(value.color))) throw new Error('Invalid chart appearance.');
  return {font:validateFont(value.font),fontSize:value.fontSize,color:value.color,...(value.weight!==undefined?{weight:validateWeight(value.weight)}:{})};
}
export const catalog = {
  desk: {label: 'Student desk', width: 100, height: 80, seats: 1},
  pair: {label: 'Double desk', width: 180, height: 80, seats: 2},
  group: {label: 'Group table', width: 160, height: 130, seats: 4},
  round: {label: 'Round table', width: 150, height: 150, seats: 4},
  teacher: {label: 'Teacher desk', width: 150, height: 70, seats: 0},
  board: {label: 'Whiteboard', width: 260, height: 30, seats: 0},
  shelf: {label: 'Bookshelf', width: 130, height: 45, seats: 0},
  door: {label: 'Door', width: 80, height: 60, seats: 0},
  printer: {label:'Printer',width:90,height:75,seats:0},
  cabinet: {label:'Filing cabinet',width:80,height:110,seats:0},
  window: {label:'Window',width:170,height:35,seats:0},
  smartboard: {label:'Smart board',width:220,height:55,seats:0},
  rug: {label: 'Reading rug', width: 180, height: 140, seats: 0},
  label: {label: 'Room label', width: 160, height: 40, seats: 0}
};
export const uid = () => crypto.randomUUID();
export function furniture(type, x = 400, y = 280) {
  const spec = catalog[type];
  return {id: uid(), type, label: spec.label, width: spec.width, height: spec.height, x, y, rotation: 0, seats: Array.from({length: spec.seats}, () => ({student: null, locked: false}))};
}
export function constrain(item) {
  const angle=item.rotation*Math.PI/180;
  const w=Math.abs(Math.cos(angle))*item.width+Math.abs(Math.sin(angle))*item.height;
  const h=Math.abs(Math.sin(angle))*item.width+Math.abs(Math.cos(angle))*item.height;
  const dx=(w-item.width)/2,dy=(h-item.height)/2;
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
export function newChart(name = 'My classroom') {return {id: uid(), name, students: [], items: layout('rows'),appearance:defaultAppearance()};}
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
      if(it.color!==undefined && !/^#[\da-f]{6}$/i.test(it.color)) throw new Error('Invalid furniture color.');
      if (!Object.hasOwn(catalog, it.type) || !Array.isArray(it.seats) || it.seats.length !== catalog[it.type].seats || (!Number.isFinite(it.rotation) || it.rotation<0 || it.rotation>=360)) throw new Error('Invalid furniture in backup.');
      return constrain({id: id(it.id), type: it.type, label: str(it.label, 60), ...(it.color!==undefined?{color:it.color}:{}), ...(it.flipX===true?{flipX:true}:{}), ...(it.flipY===true?{flipY:true}:{}), width: num(it.width,40,400), height: num(it.height,30,300), x:num(it.x,-200,1160), y:num(it.y,-200,880), rotation:it.rotation, seats:it.seats.map(s => {
        if (typeof s.locked !== 'boolean' || (s.student !== null && (!studentIds.has(s.student) || assigned.has(s.student)))) throw new Error('Invalid student assignment in backup.');
        if (s.student) assigned.add(s.student);
        return {student:s.student, locked:s.locked};
      })});
    });
    return {id:id(c.id), name:str(c.name,80), students, items,...(c.appearance!==undefined?{appearance:validateAppearance(c.appearance)}:{})};
  });
  return {version:1, charts, active:charts.some(c => c.id === data.active) ? data.active : charts[0].id};
}

export function footprint(it) {
 const a=it.rotation*Math.PI/180,w=Math.abs(Math.cos(a))*it.width+Math.abs(Math.sin(a))*it.height,h=Math.abs(Math.sin(a))*it.width+Math.abs(Math.cos(a))*it.height;
 return {x:it.x+(it.width-w)/2,y:it.y+(it.height-h)/2,width:w,height:h};
}
export function groupBounds(items) {const boxes=items.map(footprint),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));return {x,y,width:Math.max(...boxes.map(b=>b.x+b.width))-x,height:Math.max(...boxes.map(b=>b.y+b.height))-y};}
export function moveGroup(items,dx,dy) {const b=groupBounds(items);dx=Math.max(-b.x,Math.min(WIDTH-b.x-b.width,dx));dy=Math.max(-b.y,Math.min(HEIGHT-b.y-b.height,dy));items.forEach(it=>{it.x+=dx;it.y+=dy;});}
export function scaleGroup(items,requested) {
 const b=groupBounds(items),min=Math.max(...items.flatMap(it=>[40/it.width,30/it.height])),max=Math.min((WIDTH-b.x)/b.width,(HEIGHT-b.y)/b.height,...items.flatMap(it=>[400/it.width,300/it.height]));
 const scale=Math.max(min,Math.min(max,requested));
 items.forEach(it=>{it.x=b.x+(it.x-b.x)*scale;it.y=b.y+(it.y-b.y)*scale;it.width*=scale;it.height*=scale;});return scale;
}
export function snapAngle(angle,enabled=true) {angle=(angle%360+360)%360;const nearest=Math.round(angle/15)*15;return enabled&&Math.abs(nearest-angle)<=4?nearest%360:angle;}
export function snapGroup(items,others,grid=true) {
 const b=groupBounds(items);let dx=grid?Math.round(b.x/20)*20-b.x:0,dy=grid?Math.round(b.y/20)*20-b.y:0,bestX=9,bestY=9;
 for(const it of others){const t=footprint(it);
 if(b.y<t.y+t.height+8&&b.y+b.height>t.y-8)for(const d of [t.x-b.x-b.width,t.x+t.width-b.x,t.x-b.x])if(Math.abs(d)<bestX){bestX=Math.abs(d);dx=d;}
 if(b.x<t.x+t.width+8&&b.x+b.width>t.x-8)for(const d of [t.y-b.y-b.height,t.y+t.height-b.y,t.y-b.y])if(Math.abs(d)<bestY){bestY=Math.abs(d);dy=d;}
 }moveGroup(items,dx,dy);return bestX<9||bestY<9;
}
