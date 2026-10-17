import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultAvatar,validateAvatar,avatarSVG} from '../classroom/avatars.mjs';
import {catalog,furniture,newChart,validateBackup,rugPatterns} from '../classroom/model.mjs';
import {furnitureArt} from '../classroom/furniture-art.mjs';
test('masks layer below glasses and survive legacy avatar validation',()=>{
 const old=defaultAvatar();delete old.mask;delete old.maskColor;delete old.maskAccentColor;assert.equal(validateAvatar(old).mask,'none');
 for(const mask of ['hero','clown','butterfly','robot','medical']){const a={...defaultAvatar(),mask,maskColor:'#123456',maskAccentColor:'#abcdef',accessory:'glasses',headphones:'on'};const svg=avatarSVG(a);assert.match(svg,new RegExp(`data-avatar-mask="${mask}"`));assert.match(svg,/fill="#123456"/);assert.ok(svg.indexOf(`data-avatar-mask="${mask}"`)>svg.indexOf('data-avatar-detail="facial-hair"'));assert.deepEqual(validateAvatar(a),a);}
 assert.throws(()=>validateAvatar({...defaultAvatar(),mask:'bad'}),/mask/);assert.throws(()=>validateAvatar({...defaultAvatar(),maskColor:'red'}),/maskColor/);
 const smirk=avatarSVG({...defaultAvatar(),expression:'smirk'});assert.match(smirk,/M41 40q6-4 12-1/);assert.match(smirk,/m67 38 10 2/);
});
test('new furniture and rug appearance roundtrip through backups safely',()=>{
 const c=newChart();c.items=['sanitizer','sink','counter','petcage','fishbowl',...rugPatterns.map(()=> 'rug')].map((t,i)=>{const it=furniture(t);if(t==='rug')it.rugStyle={pattern:rugPatterns[i-5],color:'#bc6791'};return it;});const backup={version:1,active:c.id,charts:[c]};const copy=validateBackup(backup).charts[0];assert.deepEqual(copy.items.map(i=>i.rugStyle),c.items.map(i=>i.rugStyle));
 for(const it of c.items){assert.equal(catalog[it.type].seats,0);const art=furnitureArt(it.type,it.height,it.rugStyle);assert.match(art,/<svg/);assert.match(art,/var\(--furniture-color/);assert.doesNotMatch(art,/<script|href=|foreignObject/);}
 const rug=c.items.find(i=>i.type==='rug');rug.rugStyle.pattern='bad';assert.throws(()=>validateBackup(backup),/rug style/);rug.rugStyle.pattern='dots';rug.rugStyle.color='red';assert.throws(()=>validateBackup(backup),/rug style/);
});
