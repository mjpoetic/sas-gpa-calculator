import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLabelStyle,validateBackup,furniture} from '../classroom/model.mjs';
const legacy={background:true,outline:false,fill:'#3388ff',border:'#66899f',text:'#ffffff'};
test('room label text outlines persist and old labels remain compatible',()=>{
 assert.deepEqual(validateLabelStyle(legacy),legacy);
 const style={...legacy,textOutline:true,textOutlineColor:'#102030'};
 assert.deepEqual(validateLabelStyle(JSON.parse(JSON.stringify(style))),style);
 assert.equal(validateLabelStyle({...style,textOutline:false}).textOutline,false);
 assert.throws(()=>validateLabelStyle({...style,textOutline:'true'}),/text outline/);
 assert.throws(()=>validateLabelStyle({...style,textOutlineColor:'red'}),/text outline/);
});

test('outline thickness survives saved chart reloads and sync validation',()=>{
 for(const width of [.5,.55,1.75,4,12]){
  const label=furniture('label');label.labelStyle={...legacy,textOutline:true,textOutlineColor:'#102030',textOutlineWidth:width};
  const data={version:1,active:'chart',charts:[{id:'chart',name:'Room',students:[],items:[label]}]};
  let restored=data;
  for(let i=0;i<3;i++)restored=validateBackup(JSON.parse(JSON.stringify(restored)));
  assert.deepEqual(restored.charts[0].items[0].labelStyle,label.labelStyle);
 }
 for(const width of [0,.49,12.1,NaN,Infinity,'2',null])assert.throws(()=>validateLabelStyle({...legacy,textOutlineWidth:width}),/outline thickness/);
});
