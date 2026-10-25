import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBirthday,birthdayToday} from '../classroom/celebration-date.mjs';
import {liveFurnitureArt} from '../classroom/live-furniture.mjs';
import {newChart,validateBackup,furniture} from '../classroom/model.mjs';
test('birthdays validate real month/day values including leap day',()=>{assert.equal(validateBirthday('02-29'),'02-29');for(const bad of ['02-30','04-31','00-01','13-01','1-01',null])assert.throws(()=>validateBirthday(bad));assert.ok(birthdayToday('10-24',new Date(2026,9,24)));assert.ok(!birthdayToday('10-24',new Date(2026,9,25)));});
test('birthday and live furniture survive backups',()=>{const c=newChart();c.students=[{id:'student1',name:'Alex',birthday:'02-29'}];c.items.push(furniture('digitalclock'));const backup={version:1,charts:[c],active:c.id,studentLists:[{id:'list1',name:'Class',names:['Alex'],birthdays:['02-29']}]};const result=validateBackup(backup);assert.equal(result.charts[0].students[0].birthday,'02-29');assert.equal(result.studentLists[0].birthdays[0],'02-29');c.students[0].birthday='02-30';assert.throws(()=>validateBackup(backup));});
test('live furniture reflects supplied local date and time',()=>{const date=new Date(2026,9,24,15,42,30);assert.match(liveFurnitureArt('calendar',date),/OCT 2026/);assert.match(liveFurnitureArt('calendar',date),/>24</);assert.match(liveFurnitureArt('digitalclock',date),/15:42/);assert.match(liveFurnitureArt('clock',date),/rotate\(180 50 50\)/);assert.notEqual(liveFurnitureArt('clock',date),liveFurnitureArt('clock',new Date(2026,9,24,15,43,0)));});

import {birthdayAvatar} from '../classroom/birthday-portrait.js';
import {avatarOptions,defaultAvatar} from '../classroom/avatars.mjs';
test('birthday outfit temporarily replaces every headgear option',()=>{for(const [extra] of avatarOptions.extra){for(const headphones of ['on','neck','none']){const original={...defaultAvatar(),extra,headphones,accessory:'glasses',hairAccessory:'bow'},before=structuredClone(original),display=birthdayAvatar(original);assert.deepEqual(original,before);assert.equal(display.extra,extra==='star'?'star':'none');assert.equal(display.headphones,headphones==='on'?'none':headphones);assert.equal(display.hairAccessory,'none');assert.equal(display.accessory,'glasses');assert.equal(display.expression,'grin');}}});
