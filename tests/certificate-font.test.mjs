import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const bundle=readFileSync(new URL('../assets/index-CzOoK3C1.js',import.meta.url),'utf8');
const helper=bundle.slice(bundle.indexOf('async function verifyCertificateFont'),bundle.indexOf('function FontPicker'));
function setup({installed=false,ok=true,loadFails=false}={}){
 const faces=[];let requests=0;
 const context=vm.createContext({setTimeout:fn=>({fn}),clearTimeout(){},AbortController,document:{createElement:()=>({getContext:()=>({font:'',measureText(){return {width:installed&&this.font.includes('"')?20:10};}})}),fonts:{add:face=>faces.push(face)}},fetch:async()=>{requests++;return {ok,text:async()=>"@font-face { src: url(https://example.test/font.woff2); }"};},FontFace:class{async load(){if(loadFails)throw Error('failed');return this;}}});
 vm.runInContext(helper,context);return {check:name=>context.verifyCertificateFont(name),faces,requests:()=>requests};
}
test('confirms a Google font only after its font face loads',async()=>{const s=setup();await s.check('Italianno');assert.equal(s.requests(),1);assert.equal(s.faces.length,1);});
test('rejects missing families and failed font downloads',async()=>{await assert.rejects(setup({ok:false}).check('Missing Font'));await assert.rejects(setup({loadFails:true}).check('Italianno'));});
test('recognizes installed fonts without a network request',async()=>{const s=setup({installed:true});await s.check('Local Font');assert.equal(s.requests(),0);});
test('rejects CSS syntax and multiple families',async()=>{await assert.rejects(setup().check('Font, serif'));});
test('picker applies after typing and exposes accessible status glyphs',()=>{const picker=bundle.slice(bundle.indexOf('function FontPicker'),bundle.indexOf('const SUBJECT_ICONS'));assert.ok(picker.includes('[x,y]'));assert.ok(picker.includes('if(!active)return'));assert.ok(picker.includes('role:"status"'));assert.ok(picker.includes('"✓"'));assert.ok(picker.includes('"×"'));assert.ok(!picker.includes('children:"Apply"'));});
