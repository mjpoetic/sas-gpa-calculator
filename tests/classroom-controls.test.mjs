import test from 'node:test';import assert from 'node:assert/strict';import {controlSize,placeControls} from '../classroom/control-placement.mjs';
const bounds={left:0,top:0,right:400,bottom:400},box={left:100,right:300,top:2,bottom:8,width:200,height:6};
test('thin fixtures use compact controls below the object at the top edge',()=>{assert.equal(controlSize(box,.6),20);const p=placeControls(box,100,20,bounds);assert(p.y-10>box.bottom);assert(p.x-50>=bounds.left);});
test('bottom-edge objects get controls above, keeping zoom tools clear',()=>{const b={...box,top:380,bottom:390};const p=placeControls(b,100,20,bounds,[{left:200,right:400,top:340,bottom:400}]);assert(p.x+50<=200||p.y+10<=340);});
test('controls shrink for zoom but retain a touch-size floor',()=>{const b={width:200,height:200};assert(controlSize(b,3)<controlSize(b,1));assert.equal(controlSize(box,3,true),32);});
