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
 const ids=new Set();for(const [hair] of avatarOptions.hair)for(const [style] of avatarOptions.style)for(const extra of ['none','baseball','frog']){
 const svg=avatarSVG({...defaultAvatar(),...details,hair,style,extra});assert.ok(!/undefined|NaN|<image|<script|href=/.test(svg));const own=[...svg.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);for(const id of own){assert.ok(!ids.has(id));ids.add(id);}for(const [,ref] of svg.matchAll(/url\(#([^\)]+)\)/g))assert.ok(own.includes(ref));
 if(hair==='bald')assert.ok(!svg.includes('data-hair-color='));else assert.ok(svg.includes('data-hair-color="highlights"'));
 assert.equal(svg.includes('data-hair-color="tips"'),supportsHairTips(hair));
 }
});

test('caps tuck hair under their curved crowns without cropping side hair',()=>{
 for(const [hair] of avatarOptions.hair)for(const extra of ['baseball','frog']){
  const svg=avatarSVG({...defaultAvatar(),hair,extra});
  const clip=svg.match(/<clipPath id="avatar-hair-\d+"[^>]*>(.*?)<\/clipPath>/)[1];
  assert.match(clip,/clip-rule="evenodd"/);
  assert.match(clip,/M-60-60H180V180H-60Z /);
  assert.ok(clip.includes(extra==='baseball'?'M30 34L33 19C35 11':'M25 35Q25 14 60 13'));
  assert.ok(!svg.includes('M31 34H89V52'));
  assert.ok(!svg.includes('scale(.78 1)'));
  assert.ok(!svg.includes('scale(.9 1)'));
 }
});
test('short curly afro saves for students, assistants and personal teacher profiles',()=>{
 assert.ok(avatarOptions.hair.some(([id,label])=>id==='shortafro'&&label==='Short curly afro'));
 const a={...defaultAvatar(),hair:'shortafro',hairHighlights:'on'},c=newChart();c.students=[{id:'shortfro-student',name:'Alex',avatar:a}];c.assistants=[{id:'shortfro-assistant',name:'Ms. Chen',avatar:a,seatId:null}];const doc={version:1,active:c.id,charts:[c]};saveTeacherProfile(doc,c.id,'Teacher',a);const saved=validateBackup(doc);assert.equal(saved.charts[0].students[0].avatar.hair,'shortafro');assert.equal(saved.charts[0].assistants[0].avatar.hair,'shortafro');assert.equal(saved.teacherProfile.avatar.hair,'shortafro');assert.match(avatarSVG(a),/data-hairstyle="shortafro"/);
});
test('highlight gradients blend selected color with hair and stay inside the existing masks',()=>{
 for(const hair of ['long','shortafro','afro','boxbraids','evencut']){
  const a={...defaultAvatar(),hair,hairHighlights:'on',hairHighlightColor:'#d3ab72'},svg=avatarSVG(a);
  assert.match(svg,/data-highlight-style="blended-gradient"/);assert.match(svg,/<radialGradient[^>]+gradientTransform="matrix\(/);assert.match(svg,/stop-color="#d3ab72" stop-opacity="0"/);assert.match(svg,/<g mask="url\(#avatar-hair-color-/);assert.ok(!svg.includes('stroke-width="3.5" stroke-linecap="round" opacity=".78"'));
  assert.ok(!avatarSVG({...a,hairHighlights:'none'}).includes('data-highlight-style='));
 }
});
