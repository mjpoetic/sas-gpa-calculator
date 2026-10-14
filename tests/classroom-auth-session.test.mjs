import test from 'node:test';
import assert from 'node:assert/strict';
import {migrateTabSession} from '../classroom/auth-session.mjs';
const storage=entries=>{const values=new Map(entries);return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};};
test('legacy session migrates once and cannot revive after sign-out',()=>{const p=storage([]),t=storage([['sas-classroom-auth','legacy']]);assert.equal(migrateTabSession(p,t),true);assert.equal(p.getItem('sas-classroom-auth'),'legacy');assert.equal(t.getItem('sas-classroom-auth'),null);p.removeItem('sas-classroom-auth');t.setItem('sas-classroom-auth','stale duplicated tab');migrateTabSession(p,t);assert.equal(p.getItem('sas-classroom-auth'),null);});
test('persistent refreshed session wins over stale duplicated tab',()=>{const p=storage([['sas-classroom-auth','fresh']]),t=storage([['sas-classroom-auth','stale']]);migrateTabSession(p,t);assert.equal(p.getItem('sas-classroom-auth'),'fresh');assert.equal(t.getItem('sas-classroom-auth'),null);});
test('storage failure keeps existing legacy credentials available',()=>{const t=storage([['sas-classroom-auth','legacy']]);assert.equal(migrateTabSession({getItem(){throw Error('blocked')}},t),false);assert.equal(t.getItem('sas-classroom-auth'),'legacy');});
