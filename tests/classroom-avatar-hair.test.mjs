import test from 'node:test';
import assert from 'node:assert/strict';
import {hairGroups,avatarSVG,avatarOptions,defaultAvatar,validateAvatar,supportsHairTips} from '../classroom/avatars.mjs';
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
test('long curly hair supports highlights and tips and survives saved lists, teachers and assistants',()=>{
 const a={...defaultAvatar(),...details,hair:'longcurly'},c=newChart();c.students=[{id:'curly-student',name:'Alex',avatar:a}];c.assistants=[{id:'curly-assistant',name:'Assistant',avatar:a,seatId:null}];const document={version:1,active:c.id,charts:[c],studentLists:[{id:'curly-list',name:'Class',names:['Alex'],avatars:[a]}]};saveTeacherProfile(document,c.id,'Teacher',a);const saved=validateBackup(document);assert.deepEqual(saved.charts[0].students[0].avatar,a);assert.deepEqual(saved.charts[0].assistants[0].avatar,a);assert.deepEqual(saved.teacherProfile.avatar,a);assert.deepEqual(saved.studentLists[0].avatars[0],a);assert.equal(supportsHairTips('longcurly'),true);
 for(const [style] of avatarOptions.style){const svg=avatarSVG({...a,style});assert.match(svg,/data-hairstyle="longcurly"/);assert.match(svg,/data-hairstyle="longcurly-rear"/);assert.match(svg,/data-hair-color="highlights"/);assert.match(svg,/data-hair-color="tips"/);}
});
test('fauxhawk, mohawk and spiky afro survive saved avatars with highlights',()=>{
 for(const hair of ['fauxhawk','mohawk','spikyafro']){
  const avatar={...defaultAvatar(),hair,hairHighlights:'on',mouthAccessory:'braces',bracesColor:'#cf43aa'};
  const chart=newChart();chart.students=[{id:'new-hair',name:'Alex',avatar}];
  assert.deepEqual(validateBackup({version:1,active:chart.id,charts:[chart]}).charts[0].students[0].avatar,avatar);
  const svg=avatarSVG(avatar);assert.match(svg,new RegExp(`data-hairstyle="${hair}"`));assert.match(svg,/data-hair-color="highlights"/);
  if(hair==='fauxhawk')assert.match(svg,/data-hair-detail="side-fade"/);
 }
});
test('braces preserve expressions and only overlay visible teeth with safe custom band colors',()=>{
 const old=defaultAvatar();delete old.bracesColor;assert.equal(validateAvatar(old).bracesColor,'#438aaf');
 assert.throws(()=>validateAvatar({...defaultAvatar(),bracesColor:'url(bad)'}),/bracesColor/);
 for(const [expression] of avatarOptions.expression){
  const base={...defaultAvatar(),expression},plain=avatarSVG(base),braces=avatarSVG({...base,mouthAccessory:'braces',bracesColor:'#cf43aa'});
  const visible=['grin','excited','laughing','nervous'].includes(expression);
  assert.equal(braces.includes('data-avatar-detail="braces"'),visible);
  if(visible){assert.match(braces,/fill="#cf43aa"/);assert.equal(braces.replace(/<g data-avatar-detail="braces">.*?<\/g>/,''),plain);}
  else assert.equal(braces,plain);
 }
});
test('spiky high top and raised or radial dyed tips validate and render',()=>{
 for(const hair of ['fauxhawk','spikyhightop','spikyafro']){
  assert.ok(supportsHairTips(hair));const a={...defaultAvatar(),hair,hairTips:'on',hairTipColor:'#c2513d'};assert.deepEqual(validateAvatar(a),a);
  const svg=avatarSVG(a);assert.match(svg,/data-hair-color="tips"/);assert.match(svg,/stop-color="#c2513d"/);assert.match(svg,hair==='spikyafro'?/cy="37" r="49"/:/y1="26" x2="0" y2="8"/);
 }
});
test('mohawk sides stay bare and smooth temple fades are clipped to the scalp',()=>{
 for(const hair of ['mohawk','fauxhawk','spikyhightop']){
  const svg=avatarSVG({...defaultAvatar(),hair,hairHighlights:'on',hairTips:'on'});
  if(hair==='mohawk'){assert.ok(!svg.includes('side-fade'));assert.ok(!svg.includes('avatar-temple-fade'));}
  else {assert.match(svg,/data-hair-detail="side-fade" clip-path="url\(#avatar-temple-fade-\d+-scalp\)"/);assert.match(svg,/offset="1" stop-color="#[\da-f]+" stop-opacity="0"/);assert.equal((svg.match(/data-hair-detail="side-fade"/g)||[]).length,1);}
 }
});

test('full braid crowns, optional edges and decorations survive backups with safe defaults',()=>{
 const old=defaultAvatar();for(const key of ['hairEdges','braidDecoration','braidDecorationColor'])delete old[key];
 assert.equal(validateAvatar(old).hairEdges,'none');assert.equal(validateAvatar(old).braidDecoration,'none');
 for(const hair of ['braids','boxbraids'])for(const hairEdges of ['none','swoops','curls'])for(const braidDecoration of ['none','beads','cuffs']){
  const avatar={...defaultAvatar(),hair,hairEdges,braidDecoration,braidDecorationColor:'#ce80af',hairAccessory:'bow'};
  const chart=newChart();chart.students=[{id:'braids',name:'Alex',avatar}];
  assert.deepEqual(validateBackup({version:1,active:chart.id,charts:[chart]}).charts[0].students[0].avatar,avatar);
  for(const [style] of avatarOptions.style){const svg=avatarSVG({...avatar,style});assert.match(svg,/data-hair-detail="full-braid-crown"/);assert.equal(svg.includes('data-hair-detail="edges-'),hairEdges!=='none');assert.equal(svg.includes('data-avatar-accessory="braid-'),braidDecoration!=='none');assert.match(svg,/data-avatar-accessory="hair-bow"/);}
 }
 for(const hair of ['bald','crop','long']){const svg=avatarSVG({...defaultAvatar(),hair,hairEdges:'curls',braidDecoration:'beads'});assert.ok(!svg.includes('data-avatar-accessory="braid-'));assert.equal(svg.includes('data-hair-detail="edges-'),hair!=='bald');}
 for(const [key,value] of [['hairEdges','bad'],['braidDecoration','bad'],['braidDecorationColor','url(bad)']])assert.throws(()=>validateAvatar({...defaultAvatar(),[key]:value}));
});

test('braid coverage adds distinct decorated strands and saves safely',()=>{
 const legacy=defaultAvatar();delete legacy.braidDecorationCoverage;assert.equal(validateAvatar(legacy).braidDecorationCoverage,'few');
 assert.throws(()=>validateAvatar({...legacy,braidDecorationCoverage:'invalid'}),/braidDecorationCoverage/);
 for(const hair of ['braids','boxbraids'])for(const braidDecoration of ['beads','cuffs']){
  let previous=0;for(const braidDecorationCoverage of ['few','more','all']){
   const avatar={...defaultAvatar(),hair,braidDecoration,braidDecorationCoverage},svg=avatarSVG(avatar);
   const strands=new Set([...svg.matchAll(/data-decorated-strand="(\d+)"/g)].map(m=>m[1]));assert.ok(strands.size>previous);previous=strands.size;
   const chart=newChart();chart.students=[{id:'decorated',name:'Alex',avatar}];assert.deepEqual(validateBackup({version:1,active:chart.id,charts:[chart]}).charts[0].students[0].avatar,avatar);
  }
 }
});

test('parted cuts save for students, assistants, lists and teachers',()=>{
 for(const hair of ['texturedcurtains','fringeundercut','softmiddlepart']){
  const avatar={...defaultAvatar(),hair,hairHighlights:'on'},chart=newChart();
  chart.students=[{id:'parted-student',name:'Alex',avatar}];chart.assistants=[{id:'parted-assistant',name:'Assistant',avatar,seatId:null}];
  const doc={version:1,active:chart.id,charts:[chart],studentLists:[{id:'parted-list',name:'Class',names:['Alex'],avatars:[avatar]}]};saveTeacherProfile(doc,chart.id,'Teacher',avatar);
  const saved=validateBackup(doc);assert.deepEqual(saved.charts[0].students[0].avatar,avatar);assert.deepEqual(saved.charts[0].assistants[0].avatar,avatar);assert.deepEqual(saved.teacherProfile.avatar,avatar);assert.deepEqual(saved.studentLists[0].avatars[0],avatar);
  for(const [style] of avatarOptions.style){const svg=avatarSVG({...avatar,style});assert.match(svg,new RegExp(`data-hairstyle="${hair}"`));assert.match(svg,/data-hair-color="highlights"/);assert.equal(svg.includes('data-hair-detail="undercut-sides"'),hair==='fringeundercut');}
 }
});

test('sponge taper renders curls and low temples across head shapes',()=>{
 for(const [style] of avatarOptions.style){
  const a={...defaultAvatar(),hair:'spongetaper',style,hairHighlights:'on'};
  assert.deepEqual(validateAvatar(a),a);
  const svg=avatarSVG(a);assert.match(svg,/data-hairstyle="spongetaper"/);assert.match(svg,/data-hair-detail="low-temple-taper"/);assert.match(svg,/data-hair-detail="defined-line-up"/);assert.match(svg,/<g clip-path="url\(#avatar-sponge-taper-\d+-shape\)"/);assert.ok((svg.match(/data-hair-detail="sponge-coil"/g)||[]).length>35);
 }
});

test('hairstyle groups cover every saved choice exactly once',()=>{
 const grouped=hairGroups.flatMap(([,ids])=>ids);assert.equal(new Set(grouped).size,grouped.length);assert.deepEqual([...grouped].sort(),avatarOptions.hair.map(([id])=>id).sort());
});
