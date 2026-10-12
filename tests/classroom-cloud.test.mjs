import test from 'node:test';
import assert from 'node:assert/strict';
import {CloudStore} from '../classroom/cloud-store.mjs';
import {newChart} from '../classroom/model.mjs';

function fakeBackend() {
  const rows=new Map();
  return {rows,client:{from() {
    let action='load',values,filters=[];
    const query={select(){return query;},eq(key,value){filters.push([key,value]);return query;},insert(v){action='insert';values=v;return query;},update(v){action='update';values=v;return query;},async maybeSingle(){
      const user=action==='insert' ? values.user_id : filters.find(([k])=>k==='user_id')[1];
      const row=rows.get(user);
      if(action==='load') return {data:row ? structuredClone(row) : null,error:null};
      if(action==='insert') {if(row) return {data:null,error:{code:'23505'}};rows.set(user,structuredClone(values));return {data:{revision:1},error:null};}
      if(!row || !filters.every(([k,v])=>row[k]===v)) return {data:null,error:null};
      rows.set(user,{...row,...structuredClone(values)});return {data:{revision:values.revision},error:null};
    }};return query;
  }}};
}
const document=()=>{const c=newChart();return {version:1,active:c.id,charts:[c]};};
test('cloud state loads on another browser and saves with revision checks',async()=>{
  const {client}=fakeBackend(),a=new CloudStore(client,'owner'),b=new CloudStore(client,'owner');
  const first=document();await a.save(first);assert.deepEqual(await b.load(),first);
  first.charts[0].name='Changed';await a.save(first);
  await assert.rejects(()=>b.save(document()),/Another browser changed/);
  assert.equal((await b.load()).charts[0].name,'Changed');await b.save(first);assert.equal(b.revision,3);
});
test('concurrent first saves cannot overwrite a cloud document',async()=>{
  const {client}=fakeBackend(),a=new CloudStore(client,'owner'),b=new CloudStore(client,'owner');
  await a.save(document());await assert.rejects(()=>b.save(document()),/Another browser changed/);
});
test('invalid cloud documents fail before revision is adopted or data is saved',async()=>{
  const {client,rows}=fakeBackend(),a=new CloudStore(client,'owner');rows.set('owner',{document:{bad:true},revision:7});
  await assert.rejects(()=>a.load());assert.equal(a.revision,null);
  await assert.rejects(()=>a.save({bad:true}));assert.equal(rows.get('owner').revision,7);
});
test('storage errors do not advance the revision',async()=>{
  const client={from:()=>({insert(){return this;},select(){return this;},maybeSingle:async()=>({data:null,error:new Error('Offline')})})};
  const a=new CloudStore(client,'owner');await assert.rejects(()=>a.save(document()),/Offline/);assert.equal(a.revision,null);
});
