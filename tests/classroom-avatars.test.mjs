import test from 'node:test';import assert from 'node:assert/strict';import {defaultAvatar,validateAvatar,avatarOptions,avatarSVG,randomAvatar} from '../classroom/avatars.mjs';import {newChart,validateBackup} from '../classroom/model.mjs';
test('avatar options validate and render original SVG without external resources',()=>{for(const [key,choices] of Object.entries(avatarOptions))for(const [v] of choices){const a={...defaultAvatar(),[key]:v};assert.deepEqual(validateAvatar(a),a);const svg=avatarSVG(a);assert.match(svg,/<svg/);assert.ok(!/script|href=|<image|foreignObject/.test(svg));}assert.deepEqual(validateAvatar(randomAvatar(()=>.5)),randomAvatar(()=>.5));});
test('avatars, toggle and saved student lists survive backups',()=>{const c=newChart();c.students=[{id:'student',name:'Alex',avatar:defaultAvatar()}];c.appearance.showAvatars=true;const d={version:1,active:c.id,charts:[c],studentLists:[{id:'list',name:'Class',names:['Alex'],avatars:[defaultAvatar()]}]},copy=validateBackup(d);assert.deepEqual(copy.charts[0].students[0].avatar,defaultAvatar());assert.equal(copy.charts[0].appearance.showAvatars,true);assert.deepEqual(copy.studentLists[0].avatars,[defaultAvatar()]);assert.throws(()=>validateAvatar({...defaultAvatar(),hair:'<script>'}),/hair/);assert.throws(()=>validateBackup({...d,studentLists:[{...d.studentLists[0],avatars:[]}]}),/avatars/);});

test('custom avatar colors validate safely and older avatars keep working',()=>{const a={...defaultAvatar(),skin:'#123abc',hairColor:'#251e19',clothingColor:'#73152a',backdrop:'#fff4df'};assert.deepEqual(validateAvatar(a),a);delete a.mouthAccessory;assert.equal(validateAvatar(a).mouthAccessory,'none');assert.throws(()=>validateAvatar({...defaultAvatar(),skin:'red" onclick="bad'}),/skin/);for(const hair of ['fade','sponge','curlytop','cornrows','boxbraids','locs','shortlocs','twists','puffs','waves'])assert.match(avatarSVG({...defaultAvatar(),hair}),/<path/);});

test('eye styles and colored frames are safe and backward compatible',()=>{const old=defaultAvatar();delete old.eyes;delete old.glassesColor;old.accessory='round';assert.equal(validateAvatar(old).eyes,'classic');assert.equal(validateAvatar(old).glassesColor,'#835832');for(const accessory of ['round','glasses','sun'])assert.match(avatarSVG({...defaultAvatar(),accessory,glassesColor:'#abc123'}),/stroke="#abc123"/);assert.throws(()=>validateAvatar({...defaultAvatar(),glassesColor:'red'}),/glassesColor/);assert.throws(()=>validateAvatar({...defaultAvatar(),eyes:'invalid'}),/eyes/);assert.notEqual(avatarSVG({...defaultAvatar(),expression:'smirk'}),avatarSVG(defaultAvatar()));for(const style of ['junior','middle','senior'])for(const [hair] of avatarOptions.hair)assert.ok(!avatarSVG({...defaultAvatar(),style,hair}).includes('undefined'));});

test('baseball cap colors accept custom values and legacy avatars retain defaults',()=>{const a={...defaultAvatar(),extra:'baseball',capColor:'#123abc',capBrimColor:'#ef9876'};assert.deepEqual(validateAvatar(a),a);assert.match(avatarSVG(a),/fill="#123abc"/);assert.match(avatarSVG(a),/fill="#ef9876"/);delete a.capColor;delete a.capBrimColor;assert.equal(validateAvatar(a).capColor,'#800020');assert.throws(()=>validateAvatar({...a,capColor:'red'}),/capColor/);});

test('sponge styles sit together after rounded afro and preserve the saved sponge identifier',()=>{const hair=avatarOptions.hair.map(([id])=>id),index=hair.indexOf('afro');assert.deepEqual(hair.slice(index,index+3),['afro','sponge','spongeafro']);assert.equal(validateAvatar({...defaultAvatar(),hair:'sponge'}).hair,'sponge');assert.notEqual(avatarSVG({...defaultAvatar(),hair:'sponge'}),avatarSVG({...defaultAvatar(),hair:'spongeafro'}));});

test('head shapes replace school labels while preserving saved identifiers',()=>{assert.deepEqual(avatarOptions.style,[['junior','Round'],['middle','Oval'],['senior','Narrow oval']]);for(const style of ['junior','middle','senior'])assert.equal(validateAvatar({...defaultAvatar(),style}).style,style);});

test('new avatars start with the darkest preset hair without replacing saved colors',()=>{assert.equal(defaultAvatar().hairColor,'#302420');assert.equal(validateAvatar({...defaultAvatar(),hairColor:'#65402c'}).hairColor,'#65402c');});

test('headphones layer with glasses and legacy selections migrate safely',()=>{
 const a={...defaultAvatar(),accessory:'glasses',headphones:'on',headphoneBandColor:'#112233',headphoneCupColor:'#abcdef',headphonePadColor:'#765432'};
 const svg=avatarSVG(a);assert.match(svg,/data-avatar-accessory="headphones"/);for(const color of ['#112233','#abcdef','#765432'])assert.ok(svg.includes(color));assert.match(svg,/<rect x="35" y="42"/);
 const old={...defaultAvatar(),accessory:'headphones'};delete old.headphones;const migrated=validateAvatar(old);assert.equal(migrated.accessory,'none');assert.equal(migrated.headphones,'on');
 const c=newChart();c.students=[{id:'s',name:'Alex',avatar:a}];assert.deepEqual(validateBackup({version:1,active:c.id,charts:[c]}).charts[0].students[0].avatar,a);
 assert.throws(()=>validateAvatar({...a,catInnerColor:'url(bad)'}),/catInnerColor/);
 for(const hair of ['afro','puffs','bun','curlybun','coils'])for(const extra of ['baseball','frog'])assert.match(avatarSVG({...a,hair,extra}),/clip-path="url\(#avatar-hair-/);
});

test('ear sizes survive backups and older avatars default to medium',()=>{
 const old=defaultAvatar();delete old.earSize;assert.equal(validateAvatar(old).earSize,'medium');
 for(const earSize of ['small','medium','big']){
  const c=newChart();c.students=[{id:'ears',name:'Alex',avatar:{...defaultAvatar(),earSize}}];
  const restored=validateBackup({version:1,active:c.id,charts:[c],studentLists:[]});
  assert.equal(restored.charts[0].students[0].avatar.earSize,earSize);
 }
 assert.throws(()=>validateAvatar({...defaultAvatar(),earSize:'huge'}),/earSize/);
});
