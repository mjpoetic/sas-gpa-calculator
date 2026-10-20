import test from 'node:test';
import assert from 'node:assert/strict';
import {pickerRound} from '../classroom/picker-round.mjs';
const students=['a','b','c'].map(id=>({id}));
test('every student gets one turn before a new round begins',()=>{
 let seen=[];const chosen=[];
 for(let i=0;i<6;i++){const round=pickerRound(students,seen),winner=round.remaining[0];chosen.push(winner.id);seen=[...round.picked,winner.id];}
 assert.deepEqual(chosen,['a','b','c','a','b','c']);
});
test('rounds handle roster changes, empty rosters, and malformed saved progress',()=>{
 assert.deepEqual(pickerRound(students,['a','removed','a']).remaining.map(s=>s.id),['b','c']);
 assert.deepEqual(pickerRound(students,['a','b']).picked,['a','b']);
 assert.deepEqual(pickerRound(students,{}).remaining,students);
 assert.deepEqual(pickerRound([],['a']),{picked:[],remaining:[]});
 assert.deepEqual(pickerRound([{id:'a'}],['a']).remaining,[{id:'a'}]);
});
