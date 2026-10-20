import test from 'node:test';import assert from 'node:assert/strict';
import {eligibleStudents,validateStudentExclusions} from '../classroom/student-eligibility.mjs';
import {pickerRound} from '../classroom/picker-round.mjs';
import {cleanerPool} from '../classroom/weekly-jobs.mjs';
test('exclusion lists are independent and excluded students do not hold a round open',()=>{
 const c={students:['a','b','c'].map(id=>({id})),studentExclusions:{cleaners:['a'],picker:['b']}};
 assert.deepEqual(eligibleStudents(c,'cleaners').map(s=>s.id),['b','c']);assert.deepEqual(eligibleStudents(c,'picker').map(s=>s.id),['a','c']);
 assert.equal(pickerRound(eligibleStudents(c,'picker'),['a','c']).remaining.length,2);
 assert.equal(cleanerPool(eligibleStudents(c,'cleaners'),{weeks:[{week:'2026-10-19',students:['b','c']}]}).length,2);
 c.studentExclusions.picker=['a','b','c'];assert.equal(eligibleStudents(c,'picker').length,0);
});
test('exclusion validation rejects duplicates and malformed ids',()=>{assert.throws(()=>validateStudentExclusions({picker:['a','a']}));assert.throws(()=>validateStudentExclusions({cleaners:[7]}));assert.deepEqual(validateStudentExclusions({picker:['a']}),{cleaners:[],picker:['a']});});
