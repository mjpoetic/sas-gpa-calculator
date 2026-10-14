import test from 'node:test';
import assert from 'node:assert/strict';
import {newChart,validateBackup} from '../classroom/model.mjs';
test('saved student lists survive backup validation and reject malformed names',()=>{const c=newChart(),data={version:1,active:c.id,charts:[c],studentLists:[{id:'roster-1',name:'Grade 8',names:[' Alex   Smith ','Jordan Lee']}]};assert.deepEqual(validateBackup(data).studentLists[0].names,['Alex Smith','Jordan Lee']);assert.throws(()=>validateBackup({...data,studentLists:[{id:'bad',name:'Grade 8',names:[null]}]}));assert.throws(()=>validateBackup({...data,studentLists:[{id:c.id,name:'Grade 8',names:['Alex']}]}));assert.equal(validateBackup({version:1,active:c.id,charts:[c]}).studentLists,undefined);});
