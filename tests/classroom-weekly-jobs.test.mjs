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

test('odd roster sizes exhaust the round before repeating, with persistent dated history',async()=>{
 const {recordCleaners,cleanerHistory,cleanerPool}=await import('../classroom/weekly-jobs.mjs');
 const students=Array.from({length:7},(_,i)=>({id:String(i),name:'Student '+i})),jobs={count:3,weeks:[]},chosen=[];
 for(const week of ['2026-10-19','2026-10-26','2026-11-02']){
  const ids=pickCleaners(students,jobs.weeks,week,3,[],()=>.5,jobs);chosen.push(...ids);recordCleaners(jobs,students,week,ids);jobs.weeks.push({week,students:ids});
 }
 assert.equal(new Set(chosen).size,7);assert.equal(chosen.length,7);assert.deepEqual(jobs.weeks.map(w=>w.students.length),[3,3,1]);
 assert.equal(cleanerPool(students,jobs).length,7);
 jobs.weeks=[];assert.equal(cleanerHistory(jobs).length,3,'Clearing assignments keeps history');
 const c=newChart();c.students=students;c.weeklyJobs=jobs;const restored=validateBackup({version:1,active:c.id,charts:[c]}).charts[0].weeklyJobs;assert.deepEqual(restored,jobs);
 recordCleaners(jobs,students,'2026-11-09',['0']);assert.equal(cleanerPool(students,jobs).length,6);jobs.rotationStart=jobs.draws.length;assert.equal(cleanerPool(students,jobs).length,7);assert.equal(cleanerHistory(jobs).length,4);
});

test('manual cleaner edits preserve history and enforce eligibility and selection limits',async()=>{
 const {setManualCleaners,cleanerPool}=await import('../classroom/weekly-jobs.mjs');
 const c=newChart();c.students=Array.from({length:7},(_,i)=>({id:String(i),name:'Student '+i}));
 setManualCleaners(c,'2026-10-19',['0','1','2']);assert.deepEqual(c.weeklyJobs.weeks[0].students,['0','1','2']);
 setManualCleaners(c,'2026-10-19',['1','2','3']);assert.deepEqual(c.weeklyJobs.draws[1].students,['3']);assert.equal(cleanerPool(c.students,c.weeklyJobs).length,3);
 assert.throws(()=>setManualCleaners(c,'2026-10-26',['0']));assert.throws(()=>setManualCleaners(c,'2026-10-26',['4','4']));assert.throws(()=>setManualCleaners(c,'2026-10-26',[]));assert.throws(()=>setManualCleaners(c,'2026-10-26',['3','4','5','6']));
 c.studentExclusions={cleaners:['4'],picker:['5']};assert.throws(()=>setManualCleaners(c,'2026-10-26',['4']));setManualCleaners(c,'2026-10-26',['5','6']);
 const doc=validateBackup({version:1,active:c.id,charts:[c]});assert.deepEqual(doc.charts[0].studentExclusions,c.studentExclusions);assert.deepEqual(doc.charts[0].weeklyJobs,c.weeklyJobs);
});

test('deleting dated history keeps current/future assignments and no-repeat progress',async()=>{
 const {setManualCleaners,deleteCleanerHistory,cleanerPool}=await import('../classroom/weekly-jobs.mjs');
 const c=newChart();c.students=Array.from({length:7},(_,i)=>({id:String(i),name:'Student '+i}));
 setManualCleaners(c,'2026-10-12',['0','1','2']);setManualCleaners(c,'2026-10-19',['3']);setManualCleaners(c,'2026-10-26',['4']);
 deleteCleanerHistory(c,'2026-10-19');assert.deepEqual(c.weeklyJobs.draws,[]);assert.deepEqual(c.weeklyJobs.weeks.map(w=>w.week),['2026-10-19','2026-10-26']);assert.deepEqual(cleanerPool(c.students,c.weeklyJobs).map(s=>s.id),['5','6']);
 const restored=validateBackup({version:1,active:c.id,charts:[c]}).charts[0];assert.deepEqual(restored.weeklyJobs,c.weeklyJobs);assert.throws(()=>setManualCleaners(restored,'2026-11-02',['0']));setManualCleaners(restored,'2026-11-02',['5','6']);assert.equal(cleanerPool(restored.students,restored.weeklyJobs).length,7);
 restored.weeklyJobs.rotationSeen=['0','0'];assert.throws(()=>validateBackup({version:1,active:c.id,charts:[restored]}));
});
