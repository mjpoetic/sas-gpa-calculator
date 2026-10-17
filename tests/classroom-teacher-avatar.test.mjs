import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultAvatar,validateAvatar,avatarSVG,teacherAvatarParts,randomAvatar} from '../classroom/avatars.mjs';
import {newChart,furniture,placeTeacher,shuffle,validateBackup,rotateRoom,reshapeRoom} from '../classroom/model.mjs';
import {mergeDocuments} from '../classroom/sync-merge.mjs';
const documentFor=c=>({version:1,active:c.id,charts:[c]});
test('teacher appearance survives backups while old avatars get neutral adult defaults',()=>{
 const c=newChart(),old=defaultAvatar();for(const key of teacherAvatarParts)delete old[key];
 assert.equal(validateAvatar(old).facialHair,'none');assert.equal(validateAvatar(old).drink,'none');
 c.teacher={name:'Ms. Rivera',avatar:{...defaultAvatar(),facialHair:'goatee',facialHairColor:'#abcdef',wrinkles:'defined',lipstick:'bold',lipstickColor:'#123abc',drink:'tumbler',drinkColor:'#456789'},seatId:null};
 placeTeacher(c,c.items.find(it=>it.type==='teacher').id);
 assert.deepEqual(validateBackup(documentFor(c)).charts[0].teacher,c.teacher);
 for(const key of ['facialHairColor','lipstickColor','drinkColor'])assert.throws(()=>validateAvatar({...c.teacher.avatar,[key]:'url(bad)'}),new RegExp(key));
 assert.throws(()=>validateBackup(documentFor({...c,teacher:{...c.teacher,name:''}})),/name/);
 assert.throws(()=>validateAvatar({...c.teacher.avatar,facialHair:'invalid'}),/facialHair/);
 assert.equal(randomAvatar(()=>.8).facialHair,'none');assert.equal(randomAvatar(()=>.8).drink,'none');
});
test('teacher placement never occupies or shuffles a student seat and tolerates removed furniture',()=>{
 const c=newChart(),chair=furniture('officechair');c.items.push(chair);c.students=[{id:'alex',name:'Alex'}];c.teacher={name:'Teacher',avatar:defaultAvatar(),seatId:null};
 placeTeacher(c,chair.id);shuffle(c);assert.equal(c.teacher.seatId,chair.id);assert.ok(c.items.flatMap(it=>it.seats).some(s=>s.student==='alex'));
 assert.throws(()=>placeTeacher(c,c.items.find(it=>it.type==='board').id),/desk or chair/);
 placeTeacher(c,null);assert.equal(c.teacher.seatId,null);placeTeacher(c,chair.id);c.items=c.items.filter(it=>it.id!==chair.id);
 assert.equal(validateBackup(documentFor(c)).charts[0].teacher.seatId,null);
});
test('teacher edits merge through the existing cloud document path',()=>{
 const c=newChart();c.teacher={name:'Teacher',avatar:defaultAvatar(),seatId:null};const base=documentFor(c),local=structuredClone(base),remote=structuredClone(base);
 local.charts[0].teacher.avatar.drink='coffee';remote.charts[0].teacher.name='Mr. Chen';
 const merged=mergeDocuments(base,local,remote);assert.deepEqual(merged.conflicts,[]);assert.equal(merged.document.charts[0].teacher.avatar.drink,'coffee');assert.equal(merged.document.charts[0].teacher.name,'Mr. Chen');
 assert.match(avatarSVG({...defaultAvatar(),drink:'coffee',facialHair:'beard',wrinkles:'subtle',lipstick:'soft'}),/data-avatar-accessory="coffee"/);
});

test('legacy teacups migrate to bottles and teacher props stay out of student randomization',()=>{
 assert.equal(validateAvatar({...defaultAvatar(),drink:'tea'}).drink,'tumbler');
 const old=defaultAvatar();for(const key of ['backpack','backpackColor','backpackPocketColor','backpackStrapColor','neckwear','lanyardColor','badgeColor','teachingTool','toolColor','undershirtColor'])delete old[key];
 assert.equal(validateAvatar(old).backpack,'none');assert.equal(validateAvatar(old).teachingTool,'none');
 for(let i=0;i<=100;i++){const a=randomAvatar(()=>i/100);assert.ok(!['denim','labcoat'].includes(a.clothing));assert.equal(a.neckwear,'none');assert.equal(a.teachingTool,'none');}
 for(const key of ['backpackColor','backpackPocketColor','backpackStrapColor','toolColor','undershirtColor'])assert.throws(()=>validateAvatar({...defaultAvatar(),[key]:'red'}),new RegExp(key));
 const c=newChart();c.teacher={name:'Coach',seatId:null,avatar:{...defaultAvatar(),clothing:'denim',undershirtColor:'#123abc',backpack:'on',backpackColor:'#abcdef',neckwear:'whistle',teachingTool:'football',drink:'tumbler'}};
 c.students=[{id:'s',name:'Alex',avatar:{...defaultAvatar(),backpack:'on',backpackStrapColor:'#123456'}}];const copy=validateBackup(documentFor(c));assert.deepEqual(copy.charts[0].teacher,c.teacher);assert.deepEqual(copy.charts[0].students,c.students);
 const svg=avatarSVG(c.teacher.avatar);for(const marker of ['backpack','whistle','football','tumbler'])assert.ok(svg.includes('data-avatar-accessory="'+marker+'"'));assert.match(svg,/data-avatar-clothing="denim"/);
});

test('free teacher locations round-trip, clamp, rotate and resize with the room',()=>{
 const c=newChart();c.teacher={name:'Teacher',avatar:defaultAvatar(),seatId:null};placeTeacher(c,null,{x:430,y:330});assert.deepEqual(validateBackup(documentFor(c)).charts[0].teacher.position,{x:430,y:330});
 rotateRoom(c);assert.deepEqual(c.teacher.position,{x:350,y:430});rotateRoom(c,-1);assert.deepEqual(c.teacher.position,{x:430,y:330});reshapeRoom(c,480,680);assert.deepEqual(c.teacher.position,{x:215,y:330});
 placeTeacher(c,null,{x:-100,y:10000});assert.deepEqual(c.teacher.position,{x:32,y:640});assert.throws(()=>placeTeacher(c,null,{x:NaN,y:20}),/position/);
 const students=JSON.stringify(c.students);placeTeacher(c,c.items.find(it=>it.type==='pair').id);assert.equal(c.teacher.position,undefined);assert.equal(JSON.stringify(c.students),students);
 placeTeacher(c,null,{x:200,y:200});assert.throws(()=>validateBackup(documentFor({...c,teacher:{...c.teacher,position:{x:'bad',y:30}}})),/position/);
});
test('eye colors, glasses positions, straps and bags are safe and backward compatible',()=>{
 const a={...defaultAvatar(),accessory:'glasses',glassesPosition:'head',glassesStrap:'on',glassesStrapColor:'#123abc',eyeColor:'#5790bf',backpack:'crossbody',backpackColor:'#654321'};
 const old=defaultAvatar();for(const k of ['eyeColor','glassesPosition','glassesStrap','glassesStrapColor'])delete old[k];assert.equal(validateAvatar(old).glassesPosition,'eyes');assert.equal(validateAvatar(old).eyeColor,'#332d35');
 for(const key of ['eyeColor','glassesStrapColor'])assert.throws(()=>validateAvatar({...a,[key]:'red'}),new RegExp(key));
 const svg=avatarSVG(a);assert.match(svg,/data-avatar-glasses-position="head"/);assert.match(svg,/data-avatar-detail="glasses-strap"/);assert.match(svg,/data-avatar-accessory="crossbody"/);assert.match(svg,/fill="#5790bf"/);assert.deepEqual(validateAvatar(a),a);
 assert.ok(!avatarSVG({...a,eyes:'classic'}).includes('fill="#5790bf"'));assert.ok(!avatarSVG({...a,eyes:'happy'}).includes('fill="#5790bf"'));
});
