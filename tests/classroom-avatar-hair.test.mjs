import test from 'node:test';
import assert from 'node:assert/strict';
import {avatarSVG,avatarOptions,defaultAvatar,validateAvatar,supportsHairTips} from '../classroom/avatars.mjs';
import {newChart,validateBackup,saveTeacherProfile} from '../classroom/model.mjs';
const details={hairHighlights:'on',hairHighlightColor:'#d8d7d0',hairTips:'on',hairTipColor:'#9a69bc',hairAccessory:'bows',hairAccessoryColor:'#da7b99',hairAccessoryAccentColor:'#438aaf'};
test('hair colors and ornaments survive student lists, shared teacher profiles and old backups',()=>{
 const a={...defaultAvatar(),hair:'locs',...details};assert.deepEqual(validateAvatar(a),a);const old=defaultAvatar();for(const key of Object.keys(details))delete old[key];const restored=validateAvatar(old);assert.equal(restored.hairHighlights,'none');assert.equal(restored.hairTips,'none');assert.equal(restored.hairAccessory,'none');
 const c=newChart();c.students=[{id:'s',name:'Alex',avatar:a}];const doc={version:1,active:c.id,charts:[c],studentLists:[{id:'list',name:'Class',names:['Alex'],avatars:[a]}]};saveTeacherProfile(doc,c.id,'Teacher',a);const copy=validateBackup(doc);assert.deepEqual(copy.charts[0].students[0].avatar,a);assert.deepEqual(copy.studentLists[0].avatars[0],a);assert.deepEqual(copy.teacherProfile.avatar,a);
 for(const key of ['hairHighlightColor','hairTipColor','hairAccessoryColor','hairAccessoryAccentColor'])assert.throws(()=>validateAvatar({...a,[key]:'url(bad)'}),new RegExp(key));assert.throws(()=>validateAvatar({...a,hairAccessory:'bad'}),/hairAccessory/);
});
test('hair color masks have unique IDs and remain compatible with hairstyles, head shapes and hats',()=>{
 const ids=new Set();for(const [hair] of avatarOptions.hair)for(const [style] of avatarOptions.style)for(const extra of ['none','baseball']){
 const svg=avatarSVG({...defaultAvatar(),...details,hair,style,extra});assert.ok(!/undefined|NaN|<image|<script|href=/.test(svg));const own=[...svg.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);for(const id of own){assert.ok(!ids.has(id));ids.add(id);}for(const [,ref] of svg.matchAll(/url\(#([^\)]+)\)/g))assert.ok(own.includes(ref));
 if(hair==='bald')assert.ok(!svg.includes('data-hair-color='));else assert.ok(svg.includes('data-hair-color="highlights"'));
 assert.equal(svg.includes('data-hair-color="tips"'),supportsHairTips(hair));
 }
});
