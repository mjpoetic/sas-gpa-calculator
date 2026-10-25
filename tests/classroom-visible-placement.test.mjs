import test from 'node:test';
import assert from 'node:assert/strict';
import {furniture,vacantPosition} from '../classroom/model.mjs';
import {readFileSync} from 'node:fs';
test('new furniture searches for free space inside the visible room bounds',()=>{const bounds={x:400,y:350,width:230,height:180},item=furniture('bible'),obstacle=furniture('sidetable',470,390);assert.equal(vacantPosition(item,[obstacle],{x:470,y:390},bounds),true);assert.ok(item.x>=400&&item.y>=350&&item.x+item.width<=630&&item.y+item.height<=530);assert.ok(item.x+item.width+8<=obstacle.x||item.x>=obstacle.x+obstacle.width+8||item.y+item.height+8<=obstacle.y||item.y>=obstacle.y+obstacle.height+8);});
test('crowded views retain the item locally instead of searching the whole room',()=>{const item=furniture('calendar'),bounds={x:400,y:350,width:100,height:100};assert.equal(vacantPosition(item,[{...furniture('rug',0,0),type:'teacher',width:1000,height:680}],{x:420,y:370},bounds),false);assert.equal(item.x,420);assert.equal(item.y,370);});
test('studio imports the model using a release-versioned cache URL',()=>{assert.match(readFileSync(new URL('../classroom/studio.js',import.meta.url),'utf8'),/model\.mjs\?v=\d{8}-release\d+/);});
