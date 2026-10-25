import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLabelStyle} from '../classroom/model.mjs';
const legacy={background:true,outline:false,fill:'#3388ff',border:'#66899f',text:'#ffffff'};
test('room label text outlines persist and old labels remain compatible',()=>{
 assert.deepEqual(validateLabelStyle(legacy),legacy);
 const style={...legacy,textOutline:true,textOutlineColor:'#102030'};
 assert.deepEqual(validateLabelStyle(JSON.parse(JSON.stringify(style))),style);
 assert.equal(validateLabelStyle({...style,textOutline:false}).textOutline,false);
 assert.throws(()=>validateLabelStyle({...style,textOutline:'true'}),/text outline/);
 assert.throws(()=>validateLabelStyle({...style,textOutlineColor:'red'}),/text outline/);
});
