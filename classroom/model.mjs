import {normalizeStudentName} from './student-names.mjs?v=20261014-release9';
import {validateFont,validateWeight} from '../assets/font-options.mjs?v=20261014-release9';
export let WIDTH=960,HEIGHT=680;
export function setRoomSize(room={width:960,height:680}){WIDTH=room.width;HEIGHT=room.height;}
export function validateRoom(room){if(!room||![room.width,room.height].every(n=>Number.isFinite(n)&&n>=480&&n<=1600))throw new Error('Room sides must be between 480 and 1600.');return {width:room.width,height:room.height};}
export const defaultAppearance = () => ({font:{source:'preset',family:'system'},fontSize:11,color:null});
export function validateAppearance(value) {
  if(!value || !Number.isFinite(value.fontSize) || value.fontSize<9 || value.fontSize>24 || (value.color!==null && !/^#[\da-f]{6}$/i.test(value.color))) throw new Error('Invalid chart appearance.');
  return {font:validateFont(value.font),fontSize:value.fontSize,color:value.color,...(value.weight!==undefined?{weight:validateWeight(value.weight)}:{}),...(value.seatFontSize!==undefined?{seatFontSize:validateSeatFontSize(value.seatFontSize)}:{})};
}
export const catalog = {
  desk: {label: 'Student desk', width: 100, height: 80, seats: 1},
  pair: {label: 'Double desk', width: 180, height: 80, seats: 2},
  group: {label: 'Group table', width: 160, height: 130, seats: 4},
  round: {label: 'Round table', width: 150, height: 150, seats: 4},
  teacher: {label: 'Teacher desk', width: 150, height: 70, seats: 0},
  board: {label: 'Whiteboard', width: 260, height: 12, seats: 0},
  shelf: {label: 'Bookshelf', width: 130, height: 45, seats: 0},
  door: {label: 'Door', width: 140, height: 140/12, seats: 0},
  printer: {label:'Printer',width:90,height:75,seats:0},
  cabinet: {label:'Filing cabinet',width:80,height:110,seats:0},
  window: {label:'Window',width:170,height:12,seats:0},
  smartboard: {label:'Smart board',width:220,height:11,seats:0},
  plant: {label:'Plant',width:70,height:70,seats:0},
  laptop: {label:'Laptop',width:85,height:65,seats:0},
  keyboard: {label:'Keyboard',width:95,height:40,seats:0},
  mouse: {label:'Mouse',width:40,height:50,seats:0},
  couch: {label:'Couch',width:180,height:90,seats:0},
  chair: {label:'Chair',width:70,height:80,seats:0},
  officechair:{label:'Office chair',width:75,height:85,seats:0},
  bulletin:{label:'Bulletin board',width:180,height:9,seats:0},
  trash:{label:'Trash can',width:55,height:55,seats:0},
  sidetable:{label:'Side table',width:85,height:85,seats:0},
  clock:{label:'Wall clock',width:50,height:50,seats:0},
  globe:{label:'Globe',width:50,height:50,seats:0},
  mug:{label:'Tea / coffee mug',width:45,height:40,seats:0},
  bottle:{label:'Water bottle',width:40,height:40,seats:0},
  sharpener:{label:'Electric pencil sharpener',width:55,height:45,seats:0},
  calendar:{label:'Calendar',width:70,height:55,seats:0},
  stool: {label:'Stool',width:55,height:55,seats:0},
  rug: {label: 'Reading rug', width: 180, height: 140, seats: 0},
  label: {label: 'Room label', width: 160, height: 40, seats: 0}
};
export const uid = () => crypto.randomUUID();
export function furniture(type, x = 400, y = 280) {
  const spec = catalog[type];
  return {id: uid(), type, label: spec.label, width: spec.width, height: spec.height, x, y, rotation: 0, seats: Array.from({length: spec.seats}, () => ({student: null, locked: false}))};
}
export function constrain(item,room={width:WIDTH,height:HEIGHT}) {
  if(['door','board','smartboard','bulletin'].includes(item.type))item.height=Math.max(8,Math.min(item.height,item.width/(item.type==='door'?12:20)));
  if(item.type==='window')item.height=Math.max(8,Math.min(item.height,item.width/(170/12)));
  const angle=item.rotation*Math.PI/180;
  const w=Math.abs(Math.cos(angle))*item.width+Math.abs(Math.sin(angle))*item.height;
  const h=Math.abs(Math.sin(angle))*item.width+Math.abs(Math.cos(angle))*item.height;
  const dx=(w-item.width)/2,dy=(h-item.height)/2;
  item.x = Math.max(dx, Math.min(room.width - item.width - dx, item.x));
  item.y = Math.max(dy, Math.min(room.height - item.height - dy, item.y));
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
  improveSeparation(chart);
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
  const num = (value, min, max) => {if (!Number.isFinite(value) || value < min-1e-6 || value > max+1e-6) throw new Error('Invalid furniture dimensions in backup.'); return Math.max(min,Math.min(max,value));};
  const dimension=(value,min,max)=>{if(!Number.isFinite(value)||value<.5||value>1600)throw new Error('Invalid furniture dimensions: choose a size between '+min+' and '+max+'.');return Math.max(min,Math.min(max,value));};
  const charts = data.charts.map(c => {
    if (!Array.isArray(c.students) || c.students.length > 500 || !Array.isArray(c.items) || c.items.length > 500) throw new Error('Backup exceeds classroom limits.');
    const room=c.room===undefined?{width:960,height:680}:validateRoom(c.room);
    const students = c.students.map(s => ({id: id(s.id), name: normalizeStudentName(str(s.name,80)),...(s.avoid!==undefined?{avoid:s.avoid}: {})}));
    const studentIds = new Set(students.map(s => s.id)), assigned = new Set();
    for(const student of students)if(student.avoid!==undefined&&(!Array.isArray(student.avoid)||student.avoid.length>500||student.avoid.some(ref=>typeof ref!=='string'||ref===student.id||!studentIds.has(ref))))throw new Error('Invalid student separation preferences.');
    const items = c.items.map(it => {
      if(it.color!==undefined && !/^#[\da-f]{6}$/i.test(it.color)) throw new Error('Invalid furniture color.');
      if (!Object.hasOwn(catalog, it.type) || !Array.isArray(it.seats) || it.seats.length !== catalog[it.type].seats || (!Number.isFinite(it.rotation) || it.rotation<0 || it.rotation>=360)) throw new Error('Invalid furniture in backup.');
      return constrain({id: id(it.id), type: it.type, label: str(it.label, 60), ...(it.color!==undefined?{color:it.color}:{}), ...(it.labelFont!==undefined?{labelFont:validateFont(it.labelFont)}:{}),...(it.labelFontSize!==undefined?{labelFontSize:validateLabelFontSize(it.labelFontSize)}:{}), ...(it.labelStyle!==undefined?{labelStyle:validateLabelStyle(it.labelStyle)}:{}), ...(it.flipX===true?{flipX:true}:{}), ...(it.flipY===true?{flipY:true}:{}), width: dimension(it.width,['mug','mouse'].includes(it.type)?16:40,400), height: dimension(it.height,8,300), x:num(it.x,-300,1900), y:num(it.y,-300,1900), rotation:it.rotation, seats:it.seats.map(s => {
        if (typeof s.locked !== 'boolean' || (s.student !== null && (!studentIds.has(s.student) || assigned.has(s.student)))) throw new Error('Invalid student assignment in backup.');
        if (s.student) assigned.add(s.student);
        if(s.color!==undefined&&!/^#[\da-f]{6}$/i.test(s.color))throw new Error('Invalid seat color.');
        return {student:s.student, locked:s.locked,...(s.fontSize!==undefined?{fontSize:validateSeatFontSize(s.fontSize)}:{}),...(s.color!==undefined?{color:s.color}:{})};
      })},room);
    });
    return {id:id(c.id), name:str(c.name,80), students, items,...(c.room!==undefined?{room}:{}),...(c.appearance!==undefined?{appearance:validateAppearance(c.appearance)}:{})};
  });
  const studentLists=(data.studentLists||[]);
  if(!Array.isArray(studentLists)||studentLists.length>100)throw new Error('Invalid saved student lists.');
  const lists=studentLists.map(list=>{if(!Array.isArray(list.names)||list.names.length>500)throw new Error('Invalid saved student list.');return {id:id(list.id),name:str(list.name,80),names:list.names.map(n=>normalizeStudentName(str(n,80))),...(list.avoid!==undefined?{avoid:validateListAvoid(list.avoid,list.names.length)}:{})};});
  return {version:1, ...(lists.length?{studentLists:lists}:{}), charts, active:charts.some(c => c.id === data.active) ? data.active : charts[0].id};
}

export function footprint(it) {
 const a=it.rotation*Math.PI/180,w=Math.abs(Math.cos(a))*it.width+Math.abs(Math.sin(a))*it.height,h=Math.abs(Math.sin(a))*it.width+Math.abs(Math.cos(a))*it.height;
 return {x:it.x+(it.width-w)/2,y:it.y+(it.height-h)/2,width:w,height:h};
}
export function groupBounds(items) {const boxes=items.map(footprint),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y));return {x,y,width:Math.max(...boxes.map(b=>b.x+b.width))-x,height:Math.max(...boxes.map(b=>b.y+b.height))-y};}
export function moveGroup(items,dx,dy) {const b=groupBounds(items);dx=Math.max(-b.x,Math.min(WIDTH-b.x-b.width,dx));dy=Math.max(-b.y,Math.min(HEIGHT-b.y-b.height,dy));items.forEach(it=>{it.x+=dx;it.y+=dy;});}
export function scaleGroup(items,requested) {
 const b=groupBounds(items),min=Math.max(...items.flatMap(it=>[(['mug','mouse'].includes(it.type)?16:40)/it.width,8/it.height])),max=Math.min((WIDTH-b.x)/b.width,(HEIGHT-b.y)/b.height,...items.flatMap(it=>[400/it.width,300/it.height]));
 const scale=Math.min(max,Math.max(items.some(it=>it.type==='cabinet')?Math.max(1,min):min,requested));
 items.forEach(it=>{it.x=b.x+(it.x-b.x)*scale;it.y=b.y+(it.y-b.y)*scale;it.width=it.type==='cabinet'?80:it.width*scale;it.height*=scale;});return scale;
}
export function snapAngle(angle,enabled=true) {angle=(angle%360+360)%360;const nearest=Math.round(angle/15)*15;return enabled&&Math.abs(nearest-angle)<=4?nearest%360:angle;}
export function snapGroup(items,others,grid=true) {
 const b=groupBounds(items);let dx=grid?Math.round(b.x/20)*20-b.x:0,dy=grid?Math.round(b.y/20)*20-b.y:0,bestX=9,bestY=9;
 for(const it of others){const t=footprint(it);
 if(b.y<t.y+t.height+8&&b.y+b.height>t.y-8)for(const d of [t.x-b.x-b.width,t.x+t.width-b.x,t.x-b.x])if(Math.abs(d)<bestX){bestX=Math.abs(d);dx=d;}
 if(b.x<t.x+t.width+8&&b.x+b.width>t.x-8)for(const d of [t.y-b.y-b.height,t.y+t.height-b.y,t.y-b.y])if(Math.abs(d)<bestY){bestY=Math.abs(d);dy=d;}
 }if(b.x<9)dx=-b.x;else if(WIDTH-b.x-b.width<9)dx=WIDTH-b.x-b.width;if(b.y<9)dy=-b.y;else if(HEIGHT-b.y-b.height<9)dy=HEIGHT-b.y-b.height;moveGroup(items,dx,dy);return bestX<9||bestY<9;
}

export const proportionalTypes=new Set(['round','plant','laptop','keyboard','mouse','chair','stool','printer','couch','window','officechair','trash','sidetable','clock','globe','mug','bottle','sharpener','calendar']);
export function resizeFurniture(it,width,height,axis='width') {
 if(it.type==='cabinet'){it.width=80;it.height=Math.max(60,Math.min(300,Math.round(height/30)*30));}
 else if(['door','board','smartboard','bulletin'].includes(it.type)){it.width=Math.max(8*(it.type==='door'?12:20),Math.min(400,axis==='height'?height*(it.type==='door'?12:20):width));it.height=it.width/(it.type==='door'?12:20);}
 else if(proportionalTypes.has(it.type)){
  const spec=catalog[it.type],ratio=spec.width/spec.height;
  let w=axis==='height'?height*ratio:width;
  w=Math.max(['mug','mouse'].includes(it.type)?16:40,(['mug','mouse'].includes(it.type)?12:it.type==='window'?8:30)*ratio,Math.min(400,300*ratio,w));it.width=w;it.height=w/ratio;
 }else{it.width=Math.max(40,Math.min(400,width));it.height=Math.max(30,Math.min(300,height));}
 constrain(it);
}

export function vacantPosition(item,others,preferred={x:320,y:220}) {
 const free=()=>{const b=footprint(item);return !others.filter(it=>!['rug','label'].includes(it.type)).some(it=>{const t=footprint(it);return b.x<t.x+t.width+8&&b.x+b.width+8>t.x&&b.y<t.y+t.height+8&&b.y+b.height+8>t.y;});};
 item.x=preferred.x;item.y=preferred.y;constrain(item);if(free())return true;
 for(let y=0;y<=HEIGHT-item.height;y+=20)for(let x=0;x<=WIDTH-item.width;x+=20){item.x=x;item.y=y;constrain(item);if(free())return true;}
 item.x=preferred.x;item.y=preferred.y;constrain(item);return false;
}

export function reshapeRoom(chart,width,height){
 const old=chart.room||{width:960,height:680},room=validateRoom({width,height}),scale=Math.min(1,width/old.width,height/old.height);
 chart.items.forEach(it=>{it.x*=width/old.width;it.y*=height/old.height;it.width=Math.max(['mug','mouse'].includes(it.type)?16:40,it.width*scale);it.height=Math.max(8,it.height*scale);constrain(it,room);});chart.room=room;setRoomSize(room);
}
export function rotateRoom(chart){const old=chart.room||{width:960,height:680},room={width:old.height,height:old.width};chart.items.forEach(it=>{const cx=it.x+it.width/2,cy=it.y+it.height/2;it.x=old.height-cy-it.width/2;it.y=cx-it.height/2;it.rotation=(it.rotation+90)%360;constrain(it,room);});chart.room=room;setRoomSize(room);}

function validateListAvoid(value,count){if(!Array.isArray(value)||value.length!==count||value.some((refs,i)=>!Array.isArray(refs)||refs.length>count||refs.some(n=>!Number.isInteger(n)||n<0||n>=count||n===i)))throw new Error('Invalid saved student separation preferences.');return value;}
function seatLocations(chart){return chart.items.flatMap(item=>item.seats.map((seat,index)=>{const columns=item.seats.length===1?1:2,rows=Math.ceil(item.seats.length/columns),a=item.rotation*Math.PI/180,dx=((index%columns+.5)/columns-.5)*item.width,dy=((Math.floor(index/columns)+.5)/rows-.5)*item.height;return {seat,item,x:item.x+item.width/2+dx*Math.cos(a)-dy*Math.sin(a),y:item.y+item.height/2+dx*Math.sin(a)+dy*Math.cos(a)};}));}
function separationEdges(chart){const places=seatLocations(chart),students=new Map(chart.students.map(s=>[s.id,s]));return places.flatMap((a,i)=>places.slice(i+1).filter(b=>a.item===b.item||Math.hypot(a.x-b.x,a.y-b.y)<120).map(b=>[a.seat,b.seat])).map(pair=>({pair,students}));}
function edgeConflict({pair:[a,b],students}){return !!(a.student&&b.student&&(students.get(a.student)?.avoid?.includes(b.student)||students.get(b.student)?.avoid?.includes(a.student)));}
export function separationConflicts(chart){return separationEdges(chart).filter(edgeConflict).length;}
export function improveSeparation(chart){
 const edges=separationEdges(chart);if(!chart.students.some(s=>s.avoid?.length))return 0;
 const movable=seats(chart).filter(s=>!s.locked),links=new Map(movable.map(s=>[s,edges.filter(e=>e.pair.includes(s))]));
 for(let pass=0;pass<20;pass++){let improved=false;for(const a of movable){if(!links.get(a).some(edgeConflict))continue;for(const b of movable){if(a===b||a.student===b.student)continue;const affected=[...new Set([...links.get(a),...links.get(b)])],before=affected.filter(edgeConflict).length;[a.student,b.student]=[b.student,a.student];if(affected.filter(edgeConflict).length<before){improved=true;break;}[a.student,b.student]=[b.student,a.student];}}if(!improved)break;}
 return edges.filter(edgeConflict).length;
}

export function rotateGroup(items,degrees){
 const original=structuredClone(items),b=groupBounds(items),cx=b.x+b.width/2,cy=b.y+b.height/2,a=degrees*Math.PI/180;
 items.forEach(it=>{const dx=it.x+it.width/2-cx,dy=it.y+it.height/2-cy;it.x=cx+dx*Math.cos(a)-dy*Math.sin(a)-it.width/2;it.y=cy+dx*Math.sin(a)+dy*Math.cos(a)-it.height/2;it.rotation=(it.rotation+degrees%360+360)%360;});
 const after=groupBounds(items);if(after.width>WIDTH+1e-6||after.height>HEIGHT+1e-6){items.forEach((it,i)=>Object.assign(it,original[i]));return false;}moveGroup(items,0,0);return true;
}

export const wallFixtures=new Set(['door','board','smartboard','window','bulletin','clock','calendar']);
export function snapToWall(item,threshold=24){
 if(!wallFixtures.has(item.type))return null;
 const b=footprint(item),cx=b.x+b.width/2,cy=b.y+b.height/2;
 const edges=[{edge:'top',distance:b.y,center:cy,angle:0},{edge:'right',distance:WIDTH-b.x-b.width,center:WIDTH-cx,angle:90},{edge:'bottom',distance:HEIGHT-b.y-b.height,center:HEIGHT-cy,angle:180},{edge:'left',distance:b.x,center:cx,angle:270}].filter(e=>e.distance<=threshold).sort((a,b)=>a.distance+a.center*.001-b.distance-b.center*.001);
 if(!edges.length)return null;const edge=edges[0];item.rotation=edge.angle;constrain(item);const rotated=footprint(item);if(edge.edge==='top')item.y-=rotated.y;if(edge.edge==='bottom')item.y+=HEIGHT-rotated.y-rotated.height;if(edge.edge==='left')item.x-=rotated.x;if(edge.edge==='right')item.x+=WIDTH-rotated.x-rotated.width;return edge.edge;
}

export function validateLabelStyle(value){if(!value||typeof value.background!=='boolean'||typeof value.outline!=='boolean'||['fill','border','text'].some(key=>!/^#[\da-f]{6}$/i.test(value[key])))throw new Error('Invalid room label style.');return {background:value.background,outline:value.outline,fill:value.fill,border:value.border,text:value.text};}

export function validateSeatFontSize(value){if(!Number.isFinite(value)||value<8||value>36)throw new Error('Seat name size must be between 8 and 36.');return value;}

export function validateLabelFontSize(value){if(!Number.isFinite(value)||value<8||value>200)throw new Error('Room label font size must be between 8 and 200.');return value;}
