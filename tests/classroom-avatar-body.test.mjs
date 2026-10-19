import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultAvatar,validateAvatar,avatarSVG,avatarOptions} from '../classroom/avatars.mjs';
import {newChart,validateBackup,saveTeacherProfile} from '../classroom/model.mjs';
test('legacy avatars retain medium body proportions and reject unsupported body choices',()=>{
 const legacy=defaultAvatar();delete legacy.bodyBuild;delete legacy.bodyHeight;assert.deepEqual(validateAvatar(legacy),defaultAvatar());
 for(const [key,value] of [['bodyBuild','unsupported'],['bodyHeight','unsupported']])assert.throws(()=>validateAvatar({...defaultAvatar(),[key]:value}),new RegExp(key));
});
test('independent builds and heights survive student lists, teacher profiles and assistants',()=>{
 for(const [bodyBuild] of avatarOptions.bodyBuild)for(const [bodyHeight] of avatarOptions.bodyHeight){
  const avatar={...defaultAvatar(),bodyBuild,bodyHeight},c=newChart();c.students=[{id:'s-body',name:'Alex',avatar}];c.assistants=[{id:'a-body',name:'Assistant',avatar,seatId:null}];const d={version:1,active:c.id,charts:[c],studentLists:[{id:'l-body',name:'Class',names:['Alex'],avatars:[avatar]}]};saveTeacherProfile(d,c.id,'Teacher',avatar);const saved=validateBackup(d);for(const result of [saved.charts[0].students[0].avatar,saved.charts[0].assistants[0].avatar,saved.teacherProfile.avatar,saved.studentLists[0].avatars[0]])assert.deepEqual(result,avatar);
  for(const [style] of avatarOptions.style){const svg=avatarSVG({...avatar,style,hair:'longcurly',headphones:'neck',backpack:'crossbody',neckwear:'badge',teachingTool:'bible',drink:'tumbler'});assert.ok(!/undefined|NaN/.test(svg));assert.match(svg,new RegExp(`data-body-build="${bodyBuild}" data-avatar-height="${bodyHeight}"`));assert.ok(svg.indexOf('data-avatar-layer="neck-headphones"')>svg.indexOf('data-avatar-layer="body-props"'));}
 }
});
