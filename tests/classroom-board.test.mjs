import test from 'node:test';
import assert from 'node:assert/strict';
import {newChart,validateBackup} from '../classroom/model.mjs';
import {newNote,BOARD_COLORS,validateBoard} from '../classroom/board-model.mjs';
import {mergeDocuments} from '../classroom/sync-merge.mjs';
const doc=()=>{const c=newChart();c.board={color:BOARD_COLORS[0],notes:[{...newNote('note-one'),text:'**Hello**\n- [ ] Read'}]};return {version:1,active:c.id,charts:[c]};};
test('boards survive backup validation and preserve old classrooms',()=>{const d=doc();assert.deepEqual(validateBackup(d).charts[0].board,d.charts[0].board);delete d.charts[0].board;assert.equal(validateBackup(d).charts[0].board,undefined);});
test('rejects unsafe and out-of-bounds board data',()=>{for(const patch of [{x:1600},{height:901},{text:'x'.repeat(12001)},{color:'url(evil)'},{locked:'false'},{fontSize:NaN}]){const d=doc();Object.assign(d.charts[0].board.notes[0],patch);assert.throws(()=>validateBackup(d));}const d=doc();d.charts[0].board.notes.push({...d.charts[0].board.notes[0]});assert.throws(()=>validateBackup(d));});
test('board changes merge with room edits and concurrent note additions',()=>{const base=doc(),local=structuredClone(base),remote=structuredClone(base);local.charts[0].board.notes.push(newNote('local-note'));remote.charts[0].board.notes.push(newNote('remote-note'));remote.charts[0].name='New room';const result=mergeDocuments(base,local,remote);assert.deepEqual(result.conflicts,[]);assert.equal(result.document.charts[0].board.notes.length,3);assert.equal(result.document.charts[0].name,'New room');});
