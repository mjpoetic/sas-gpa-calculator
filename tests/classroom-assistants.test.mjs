import test from 'node:test';
import assert from 'node:assert/strict';
import {newChart,validateBackup,rotateRoom,reshapeRoom,saveTeacherProfile} from '../classroom/model.mjs';
import {defaultAvatar} from '../classroom/avatars.mjs';
import {mergeDocuments} from '../classroom/sync-merge.mjs';
const documentFor=c=>({version:1,active:c.id,charts:[c]});
test('assistants survive backups, room changes, and personal teacher edits',()=>{
 const c=newChart();c.assistants=[{id:'assistant-1',name:'Ms. Chen',avatar:defaultAvatar(),seatId:null,size:96,position:{x:200,y:240}}];const d=documentFor(c);
 assert.deepEqual(validateBackup(d).charts[0].assistants,c.assistants);
 saveTeacherProfile(d,c.id,'Mr. Hurst',defaultAvatar());assert.equal(c.assistants[0].name,'Ms. Chen');
 rotateRoom(c);assert.deepEqual(c.assistants[0].position,{x:440,y:200});reshapeRoom(c,680,480);assert.deepEqual(c.assistants[0].position,{x:440,y:100});
 c.assistants[0].seatId='removed';delete c.assistants[0].position;assert.equal(validateBackup(d).charts[0].assistants[0].seatId,null);
 c.assistants.push({...c.assistants[0]});assert.throws(()=>validateBackup(d),/duplicate.*ID/i);
 c.assistants=[{...c.assistants[0],name:''}];assert.throws(()=>validateBackup(d),/name|text|string/i);
});
test('independent assistant edits merge and old charts remain compatible',()=>{
 const c=newChart(),base=documentFor(c),local=structuredClone(base),remote=structuredClone(base);
 local.charts[0].assistants=[{id:'a',name:'Assistant A',avatar:defaultAvatar(),seatId:null}];remote.charts[0].assistants=[{id:'b',name:'Assistant B',avatar:defaultAvatar(),seatId:null}];
 const result=mergeDocuments(base,local,remote);assert.deepEqual(result.conflicts,[]);assert.equal(result.document.charts[0].assistants.length,2);assert.equal(validateBackup(base).charts[0].assistants,undefined);
});
