import test from 'node:test';
import assert from 'node:assert/strict';
import {newChart, furniture, layout, seats, uid, assignUnseated, shuffle, validateBackup, constrain, WIDTH, HEIGHT} from '../classroom/model.mjs';

test('presets provide expected capacity and stay within the room', () => {
  for (const [kind,capacity] of [['rows',24],['groups',24],['horseshoe',18]]) {
    const items=layout(kind);assert.equal(seats({items}).length,capacity);
    for(const it of items) {assert.ok(it.x>=0 && it.y>=0 && it.x+it.width<=WIDTH && it.y+it.height<=HEIGHT);}
  }
});
test('shuffle preserves furniture and locked students, with no duplicate assignments', () => {
  const c=newChart();c.students=Array.from({length:28},(_,i) => ({id:uid(),name:`Student ${i}`}));assignUnseated(c);
  const all=seats(c);all[0].locked=true;const locked=all[0].student;
  const geometry=JSON.stringify(c.items.map(({seats,...item}) => item));const before=all.map(s => s.student);
  shuffle(c,() => 0.5);
  assert.equal(all[0].student,locked);assert.equal(JSON.stringify(c.items.map(({seats,...item}) => item)),geometry);
  assert.equal(new Set(all.map(s => s.student)).size,24);
  all.slice(1).forEach((s,i) => assert.notEqual(s.student,before[i+1]));
});
test('empty locked seats remain empty and excess students remain unassigned', () => {
  const c={items:[furniture('pair')],students:[{id:uid(),name:'A'},{id:uid(),name:'A'},{id:uid(),name:'C'}]};
  seats(c)[0].locked=true;shuffle(c);
  assert.equal(seats(c)[0].student,null);assert.equal(seats(c)[1].student,c.students[0].id);
});
test('rotation containment accounts for the rotated footprint', () => {
  const it=furniture('pair',0,0);it.rotation=90;constrain(it);
  assert.ok(it.x+(it.width-it.height)/2>=0);assert.ok(it.y+(it.height-it.width)/2>=0);
  it.x=WIDTH;it.y=HEIGHT;constrain(it);
  assert.ok(it.x+(it.width+it.height)/2<=WIDTH);assert.ok(it.y+(it.height+it.width)/2<=HEIGHT);
});
test('free rotation stays inside the room and survives backups', () => {
  const c=newChart(),it=c.items[0];
  for(const rotation of [1,37,135,281,359]) {
    it.rotation=rotation;
    for(const edge of [0,WIDTH]) {
      it.x=edge;it.y=edge;constrain(it);
      const a=rotation*Math.PI/180,w=Math.abs(Math.cos(a))*it.width+Math.abs(Math.sin(a))*it.height,h=Math.abs(Math.sin(a))*it.width+Math.abs(Math.cos(a))*it.height;
      assert.ok(it.x+it.width/2-w/2>=-1e-9 && it.x+it.width/2+w/2<=WIDTH+1e-9);
      assert.ok(it.y+it.height/2-h/2>=-1e-9 && it.y+it.height/2+h/2<=HEIGHT+1e-9);
    }
    assert.equal(validateBackup({version:1,active:c.id,charts:[c]}).charts[0].items[0].rotation,rotation);
  }
});
test('backups round-trip; duplicate, foreign, and malformed assignments are rejected', () => {
  const c=newChart();c.students=[{id:uid(),name:'<script>Student</script>'}];assignUnseated(c);
  const data={version:1,active:c.id,charts:[c]};assert.deepEqual(validateBackup(data),data);
  for(const mutate of [
    d => {seats(d.charts[0])[1].student=d.charts[0].students[0].id;},
    d => {seats(d.charts[0])[0].student='unknown';},
    d => {d.charts[0].items[0].width=Infinity;},
    d => {d.charts[0].items[0].type='__proto__';},
    d => {d.charts[0].items[0].seats.push({student:null,locked:false});}
  ]) {const copy=structuredClone(data);mutate(copy);assert.throws(() => validateBackup(copy));}
});

test('chart font settings and furniture colors survive backups with validation', () => {
  const c=newChart();c.appearance={font:{source:'google',family:'Atkinson Hyperlegible'},fontSize:14,color:'#526d82'};c.items[3].color='#e8cfa8';
  const data={version:1,active:c.id,charts:[c]};assert.deepEqual(validateBackup(data),data);
  for(const modify of [d=>d.charts[0].appearance.fontSize=99,d=>d.charts[0].appearance.font.family='url(https://example.com)',d=>d.charts[0].items[3].color='red;display:none']){const copy=structuredClone(data);modify(copy);assert.throws(()=>validateBackup(copy));}
  const old=structuredClone(data);delete old.charts[0].appearance;delete old.charts[0].items[3].color;assert.deepEqual(validateBackup(old),old);
});

test('group transforms preserve touching edges, proportions, and room limits',async()=>{
 const {moveGroup,scaleGroup,snapGroup,snapAngle,groupBounds}=await import('../classroom/model.mjs');
 const a=furniture('desk',100,100),b=furniture('desk',200,100),items=[a,b];
 scaleGroup(items,1.5);assert.equal(a.x+a.width,b.x);assert.equal(a.height,b.height);assert.equal(a.y,b.y);
 moveGroup(items,10000,10000);let box=groupBounds(items);assert.ok(box.x+box.width<=WIDTH+1e-8&&box.y+box.height<=HEIGHT+1e-8);
 const target=furniture('desk',100,100),moving=furniture('desk',205,100);snapGroup([moving],[target]);assert.equal(moving.x,target.x+target.width);assert.equal(moving.y,target.y);
 assert.equal(snapAngle(88),90);assert.equal(snapAngle(82),82);assert.equal(snapAngle(88,false),88);
 const c=newChart();c.items=[{...a,flipX:true,flipY:true},furniture('printer'),furniture('cabinet'),furniture('window'),furniture('smartboard')];c.appearance.weight=800;
 const validated=validateBackup({version:1,active:c.id,charts:[c]});assert.equal(validated.charts[0].items[0].flipX,true);assert.equal(validated.charts[0].appearance.weight,800);
});

test('proportional furniture keeps its catalog ratio for both sizing axes',async()=>{
 const {resizeFurniture,proportionalTypes,catalog}=await import('../classroom/model.mjs');
 for(const type of proportionalTypes){const it=furniture(type);for(const axis of ['width','height']){resizeFurniture(it,220,180,axis);assert.ok(Math.abs(it.width/it.height-catalog[type].width/catalog[type].height)<1e-9);assert.ok(it.width>=40&&it.width<=400&&it.height>=30&&it.height<=300);}}
 const desk=furniture('teacher');resizeFurniture(desk,220,100);assert.equal(desk.width,220);assert.equal(desk.height,100);
});

test('new furniture finds vacant space and snaps flush to room walls',async()=>{
 const {vacantPosition,snapGroup}=await import('../classroom/model.mjs');const a=furniture('desk',320,220),b=furniture('desk');assert.equal(vacantPosition(b,[a]),true);assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);
 const door=furniture('door',4,4);snapGroup([door],[]);assert.equal(door.x,0);assert.equal(door.y,0);door.x=WIDTH-door.width-3;door.y=HEIGHT-door.height-3;snapGroup([door],[]);assert.equal(door.x+door.width,WIDTH);assert.equal(door.y+door.height,HEIGHT);
});

test('custom rooms rotate reversibly, validate, and preserve furniture',async()=>{
 const {reshapeRoom,rotateRoom,setRoomSize,resizeFurniture}=await import('../classroom/model.mjs');const c=newChart();reshapeRoom(c,1200,800);const before=structuredClone(c);for(let i=0;i<4;i++)rotateRoom(c);for(let i=0;i<c.items.length;i++){assert.ok(Math.abs(c.items[i].x-before.items[i].x)<1e-8);assert.ok(Math.abs(c.items[i].y-before.items[i].y)<1e-8);}assert.deepEqual(c.room,before.room);assert.deepEqual(validateBackup({version:1,active:c.id,charts:[c]}).charts[0].room,c.room);const cabinet=furniture('cabinet');resizeFurniture(cabinet,200,240);assert.equal(cabinet.width,80);assert.equal(cabinet.height,240);const door=furniture('door');resizeFurniture(door,240,240);assert.equal(door.height,20);setRoomSize();
});

test('generated size overshoots recover without losing furniture or students',()=>{
 const c=newChart();c.students=[{id:uid(),name:'Student'}];assignUnseated(c);c.items[3].width=400.00000000003;c.items[3].height=7.99999999999;c.items[4].width=450;
 const copy=validateBackup({version:1,active:c.id,charts:[c]}).charts[0];assert.equal(copy.items[3].width,400);assert.equal(copy.items[3].height,8);assert.equal(copy.items[4].width,400);assert.equal(copy.items.length,c.items.length);assert.deepEqual(copy.students,c.students);assert.equal(copy.items[3].seats[0].student,c.students[0].id);
});
