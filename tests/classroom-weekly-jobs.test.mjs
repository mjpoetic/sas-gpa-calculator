import test from 'node:test';
import assert from 'node:assert/strict';
import {weekStart,pickCleaners} from '../classroom/weekly-jobs.mjs';
import {newChart,validateBackup} from '../classroom/model.mjs';
test('Monday weeks respect Sunday and year boundaries',()=>{assert.equal(weekStart('2026-10-25'),'2026-10-19');assert.equal(weekStart('2027-01-01'),'2026-12-28');});
test('weekly rotation serves everyone before repeating and swaps exclude current cleaners',()=>{
 const students=Array.from({length:6},(_,i)=>({id:String(i),name:'Student '+i}));
 const first=pickCleaners(students,[],'2026-10-19',3);
 const weeks=[{week:'2026-10-19',students:first}];
 const next=pickCleaners(students,weeks,'2026-10-26',3);
 assert.equal(new Set([...first,...next]).size,6);
 assert.ok(!first.includes(pickCleaners(students,weeks,'2026-10-19',1,first)[0]));
 assert.equal(pickCleaners(students,[],'2026-10-19',20).length,6);
 assert.deepEqual(pickCleaners([],[],'2026-10-19',3),[]);
});
test('weekly assignments survive backup validation, including removed students',()=>{
 const c=newChart();c.weeklyJobs={count:3,weeks:[{week:'2026-10-19',students:['removed-student']}]};
 const doc={version:1,active:c.id,charts:[c]};
 assert.deepEqual(validateBackup(doc).charts[0].weeklyJobs,c.weeklyJobs);
 c.weeklyJobs.weeks[0].students.push('removed-student');assert.throws(()=>validateBackup(doc));
});
