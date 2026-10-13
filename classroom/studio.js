import {furnitureArt} from './furniture-art.mjs';
import {catalog, uid, newChart, layout, furniture, constrain, seats, assignUnseated, shuffle, validateBackup, defaultAppearance,groupBounds,moveGroup,scaleGroup,snapAngle,snapGroup,footprint,resizeFurniture,proportionalTypes,vacantPosition,setRoomSize,reshapeRoom,rotateRoom,WIDTH,HEIGHT} from './model.mjs';
import {fontOptions,validateFont,fontCSS,loadFont,suggestFonts,fontWeights} from '../assets/font-options.mjs';
import {connectCloud} from './cloud.js';

const $ = id => document.getElementById(id);
const KEY = 'sas-classroom-studio-v1';
let state, loadError = '', selection = null, history = [], redoHistory = [], zoom = 1;
try {
  const saved = localStorage.getItem(KEY);
  state = saved ? validateBackup(JSON.parse(saved)) : null;
} catch { loadError = 'Saved charts could not be loaded. Export your current work before reloading; the previous saved data will remain untouched until you make a change.'; }
if (!state) {const c = newChart(); state = {version:1, active:c.id, charts:[c]};}
const chart = () => state.charts.find(c => c.id === state.active);
let selectedIds=new Set(),multiMode=false;
const selectedItems=()=>chart().items.filter(it=>selectedIds.has(it.id));
function choose(it,add=false){if(add){if(selectedIds.has(it.id))selectedIds.delete(it.id);else selectedIds.add(it.id);}else selectedIds=new Set([it.id]);selection=selectedIds.size?{id:[...selectedIds].at(-1),seat:null}:null;}
function snapResize(it){if(!$('snap').checked)return;for(const other of chart().items){if(other.id===it.id)continue;if(Math.abs(it.width-other.width)<8)resizeFurniture(it,other.width,it.height,'width');if(Math.abs(it.height-other.height)<8)resizeFurniture(it,it.width,other.height,'height');}}
function showGuides(items){const room=$('room');room.querySelectorAll('.alignment-guide').forEach(n=>n.remove());const b=groupBounds(items);for(const target of chart().items.filter(x=>!items.some(i=>i.id===x.id))){const t=footprint(target);for(const [axis,values,other] of [['x',[b.x,b.x+b.width/2,b.x+b.width],[t.x,t.x+t.width/2,t.x+t.width]],['y',[b.y,b.y+b.height/2,b.y+b.height],[t.y,t.y+t.height/2,t.y+t.height]]])for(const value of values)if(other.some(v=>Math.abs(v-value)<4)){const line=element('div','alignment-guide '+axis);line.style[axis==='x'?'left':'top']=value+'px';room.append(line);}}}
function paintPositions(){showGuides(selectedItems());for(const it of selectedItems()){const n=$('room').querySelector(`[data-id="${it.id}"]`);if(n)Object.assign(n.style,{left:it.x+'px',top:it.y+'px',width:it.width+'px',height:it.height+'px'});}}
const selected = () => chart().items.find(it => it.id === selection?.id);
const appearance = () => chart().appearance || defaultAppearance();
const say = text => {$('message').textContent = text;};
function save() {
  try {localStorage.setItem(KEY, JSON.stringify(state)); $('save-state').textContent = '✓ Saved in this browser';document.dispatchEvent(new Event('sas-chart-edited'));}
  catch {$('save-state').textContent = 'Save unavailable — export a backup'; say('Browser storage is unavailable or full. Export a backup to preserve your work.');}
}
function checkpoint() {redoHistory=[];history.push(JSON.stringify(state)); if(history.length > 40) history.shift();}
function change(fn, message) {checkpoint();fn();save();render();if(message) say(message);}
function element(tag, className, text) {const el = document.createElement(tag);if(className) el.className = className;if(text !== undefined) el.textContent = text;return el;}
function option(value, text) {const el = element('option','',text);el.value = value;return el;}
function tab(students) {
  $('students-panel').hidden = !students; $('furniture-panel').hidden = students;
  $('students-tab').setAttribute('aria-selected',String(students));$('furniture-tab').setAttribute('aria-selected',String(!students));
  $('students-tab').tabIndex = students ? 0 : -1; $('furniture-tab').tabIndex = students ? -1 : 0;
}
for (const [type,spec] of Object.entries(catalog)) {
  const btn = element('button'),mini=element('span',`mini ${type}`);if(furnitureArt(type))mini.innerHTML=furnitureArt(type);btn.append(mini,element('span','',spec.label));
  let dragged=false;
  btn.onclick=()=>{if(dragged){dragged=false;return;}addFurniture(type);};
  btn.onpointerdown=e=>{if(e.button!==0)return;const start={x:e.clientX,y:e.clientY};let ghost;btn.setPointerCapture(e.pointerId);
    const move=ev=>{if(!ghost&&Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>6){dragged=true;ghost=element('div','palette-drag-preview',spec.label);document.body.append(ghost);}if(ghost)Object.assign(ghost.style,{left:ev.clientX+12+'px',top:ev.clientY+12+'px'});};
    const end=ev=>{btn.removeEventListener('pointermove',move);btn.removeEventListener('pointerup',end);btn.removeEventListener('pointercancel',end);ghost?.remove();if(!dragged||ev.type==='pointercancel')return;const r=$('room').getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)addFurniture(type,{x:(ev.clientX-r.x)/zoom-spec.width/2,y:(ev.clientY-r.y)/zoom-spec.height/2});};
    btn.addEventListener('pointermove',move);btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);
  };
  $('palette').append(btn);
}
function addFurniture(type,preferred){if(chart().items.length>=500)return say('This chart has reached the furniture limit.');change(()=>{const item=furniture(type);const found=vacantPosition(item,chart().items,preferred);chart().items.push(item);choose(item);if(!found)say('Room is full; move the new item to make space.');},catalog[type].label+' added.');}
function render() {
  const c = chart();setRoomSize(c.room);$('room-width').value=WIDTH;$('room-depth').value=HEIGHT;
  $('charts').replaceChildren(...state.charts.map(c => option(c.id,c.name)));$('charts').value = c.id;
  $('name').value = c.name;$('room-title').textContent = c.name;$('student-count').textContent = c.students.length;
  const all = seats(c), count = all.filter(s => s.student).length;
  $('seat-summary').textContent = `${count} seated · ${all.length} seats · ${c.students.length-count} unassigned`;
  $('roster-summary').textContent = `${c.students.length} students · ${c.students.length-count} unassigned`;
  $('undo').disabled = !history.length;$('redo').disabled=!redoHistory.length;$('delete-chart').disabled = state.charts.length === 1;
  if(!selection)selectedIds.clear();else if(!selectedIds.has(selection.id))selectedIds=new Set([selection.id]);
  renderRoom();renderInspector();renderRoster();
  renderAppearance();
}
function renderAppearance() {
  const a=appearance();$('chart-font-preview').style.fontFamily=fontCSS(a.font);$('chart-font-preview').style.fontWeight=a.weight||400;$('chart-font-weight').value=a.weight||400;$('chart-font-source').value=a.font.source;$('chart-font').value=a.font.source==='preset'?a.font.family:'system';
  $('chart-font-family').value=a.font.source==='preset'?'':a.font.family;$('chart-font-size').value=a.fontSize;$('chart-color').value=a.color||'#e8d7bb';chartFontFields();
}
function chartFontFields() {const custom=$('chart-font-source').value!=='preset';$('chart-custom-font').hidden=!custom;$('chart-preset-label').hidden=custom;suggestFonts($('chart-font-family'),$('chart-font-source').value,'chart-font-suggestions');}
function chartStyle(fn,message) {change(()=>{chart().appearance=structuredClone(appearance());fn(chart().appearance);},message);}
for(const [value,label] of Object.entries(fontWeights))$('chart-font-weight').append(option(value,label));
$('chart-font-weight').onchange=()=>chartStyle(a=>{a.weight=Number($('chart-font-weight').value);});
for(const [key,spec] of Object.entries(fontOptions)) $('chart-font').append(option(key,spec.label));
$('chart-font-source').onchange=()=>{const source=$('chart-font-source').value,family=source==='preset'?$('chart-font').value:source==='google'?'Inter':'Arial';chartStyle(a=>{a.font={source,family};});};
$('chart-font').onchange=()=>chartStyle(a=>{a.font={source:'preset',family:$('chart-font').value};});
$('chart-font-family').onchange=()=>{const form=$('chart-custom-font');if($('chart-font-family').value.trim())form.requestSubmit();};
$('chart-custom-font').onsubmit=e=>{e.preventDefault();try{const font=validateFont({source:$('chart-font-source').value,family:$('chart-font-family').value.trim()});chartStyle(a=>{a.font=font;},'Chart font applied.');}catch(error){say(error.message);}};
$('chart-font-size').onchange=()=>{if(!$('chart-font-size').checkValidity() || !$('chart-font-size').value){renderAppearance();return;}chartStyle(a=>{a.fontSize=Number($('chart-font-size').value);});};
$('chart-color').onchange=()=>chartStyle(a=>{a.color=$('chart-color').value;});
$('chart-natural').onclick=()=>chartStyle(a=>{a.color=null;},'Natural colors restored. Individual furniture colors are kept.');
$('chart-reset').onclick=()=>change(()=>{chart().appearance=defaultAppearance();chart().items.forEach(it=>delete it.color);},'Chart fonts and colors reset. Room arrangement and students are kept.');
$('item-color').onchange=()=>{const it=selected();if(it)change(()=>{it.color=$('item-color').value;});};
$('item-color-reset').onclick=()=>{const it=selected();if(it)change(()=>{delete it.color;});};
function renderRoom() {
  const room = $('room');room.style.width=WIDTH+'px';room.style.height=HEIGHT+'px';
  const previous=new Map([...room.querySelectorAll('.item')].map(node=>[node.dataset.id,{x:parseFloat(node.style.left),y:parseFloat(node.style.top),width:parseFloat(node.style.width),height:parseFloat(node.style.height),rotation:Number(node.dataset.rotation||0),active:node.classList.contains('dragging')||node.classList.contains('resizing')} ]));
  room.replaceChildren();
  if(!selection)selectedIds.clear();else if(!selectedIds.has(selection.id))selectedIds=new Set([selection.id]);
  room.style.setProperty('--chart-font-weight',appearance().weight||400);
  room.style.fontFamily=fontCSS(appearance().font);
  room.style.setProperty('--chart-font-size',`${appearance().fontSize}px`);
  const font=appearance().font,weight=appearance().weight||400;$('chart-font-status').textContent=font.source==='google'?'Loading '+font.family+'…':'Font applied: '+(fontOptions[font.family]?.label||font.family);void loadFont(font,weight).then(async()=>{if(document.fonts?.load)await document.fonts.load(`${weight} 14px ${fontCSS(font)}`);if(JSON.stringify(appearance().font)===JSON.stringify(font))$('chart-font-status').textContent='Font applied: '+(fontOptions[font.family]?.label||font.family);}).catch(error=>{$('chart-font-status').textContent=error.message;say(error.message);});
  for(const it of chart().items) {
    const node = element('div',`item ${it.type}${selectedIds.has(it.id) ? ' selected' : ''}`);
    node.ondblclick=e=>{if(e.target.closest('.furniture-actions,.resize-handle'))return;e.preventDefault();e.stopPropagation();choose(it);renderInspector();$('item-color').focus();$('item-color').click();};
    node.dataset.id = it.id;node.dataset.rotation=it.rotation;node.tabIndex = 0;node.setAttribute('aria-label',`${it.label}. Drag to move, or use arrow keys.`);
    Object.assign(node.style,{left:`${it.x}px`,top:`${it.y}px`,width:`${it.width}px`,height:`${it.height}px`,transform:`rotate(${it.rotation}deg)`});
    const color=it.color || appearance().color;
    if(color) {node.style.background=color;node.style.setProperty('--furniture-color',color);const rgb=color.slice(1).match(/../g).map(c=>parseInt(c,16));node.style.color=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#172c3e':'#ffffff';}
    const caption=element('span','item-caption',it.label);if(it.seats.length||['rug','label'].includes(it.type))node.append(caption);
    if(!it.seats.length&&it.type!=='teacher'){const art=element('div','furniture-art');art.setAttribute('aria-hidden','true');art.innerHTML=furnitureArt(it.type,it.height);const f=footprint(it),wall=it.type==='door'&&(f.y<=1||f.x<=1||f.y+f.height>=HEIGHT-1||f.x+f.width>=WIDTH-1),wallFlip=it.type==='door'&&((f.y+f.height>=HEIGHT-1&&it.rotation===0)||(f.y<=1&&it.rotation===180)||(f.x+f.width>=WIDTH-1&&it.rotation===270)||(f.x<=1&&it.rotation===90));art.style.transform=`scale(${it.flipX?-1:1},${(wall?wallFlip:it.flipY)?-1:1})`;node.prepend(art);if(color){const rects=[...art.querySelectorAll('rect')].sort((a,b)=>Number(b.getAttribute('width'))*Number(b.getAttribute('height'))-Number(a.getAttribute('width'))*Number(a.getAttribute('height')));(rects[0]||art.querySelector('circle'))?.setAttribute('fill',color);}requestAnimationFrame(()=>fitCaption(caption,it));}
    node.title=it.label;
    if(it.seats.length) {
      const grid = element('div','seat-grid');grid.style.setProperty('--columns',it.seats.length === 1 ? 1 : 2);
      it.seats.forEach((s,i) => {
        const student = chart().students.find(st => st.id === s.student);
        const btn = element('button',`seat${student ? ' assigned' : ''}${s.locked ? ' locked' : ''}${selection?.id === it.id && selection?.seat === i ? ' selected-seat' : ''}`);
        const text = element('span','seat-name',student?.name || `Seat ${i+1}`);
        // The seat footprint follows its desk; only its name stays upright.
        text.style.transform = `rotate(${-it.rotation}deg)`;
        const sideways = it.rotation % 180 !== 0;
        text.style.width = sideways ? 'calc(100% - 8px)' : 'calc(100% - 6px)';
        btn.append(text);
        new ResizeObserver(([entry], observer) => {
          const {width,height} = entry.contentRect;
          const angle=it.rotation*Math.PI/180,diagonal=it.rotation%90!==0;
          const side=Math.min(width,height)/(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)));
          text.style.width = `${Math.max(0,(diagonal?side:sideways ? height : width)-6)}px`;
          text.style.maxHeight = `${Math.max(0,(diagonal?side:sideways ? width : height)-4)}px`;
          observer.disconnect();
        }).observe(btn);
        btn.setAttribute('aria-label',`${it.label}, seat ${i+1}: ${student?.name || 'unassigned'}${s.locked ? ', locked during shuffle' : ''}`);
        btn.onclick = e => {e.stopPropagation();if(e.shiftKey||e.metaKey||multiMode){choose(it,true);renderRoom();renderInspector();return;}selectedIds=new Set([it.id]);selection = {id:it.id,seat:i};renderRoom();renderInspector();$('assignment').focus();};
        grid.append(btn);
      });node.append(grid);
    }
    const actions=element('div','furniture-actions');actions.style.transform=`rotate(${-it.rotation}deg)`;
    const remove=element('button','furniture-delete','×');remove.type='button';remove.setAttribute('aria-label',`Delete ${it.label}`);remove.title='Delete furniture';
    remove.onclick=e=>{e.stopPropagation();change(()=>{chart().items=chart().items.filter(item=>item.id!==it.id);selection=null;},'Furniture deleted. Undo is available.');};
    const turn=element('button','furniture-rotate','↻');turn.type='button';turn.setAttribute('aria-label',`Rotate ${it.label}`);turn.title='Drag to rotate freely; tap for 90°';
    let rotationDragged=false;
    turn.onpointerdown=e=>{
      if(e.button!==0)return;e.preventDefault();e.stopPropagation();selection={id:it.id,seat:null};renderInspector();
      const box=node.getBoundingClientRect(),cx=box.x+box.width/2,cy=box.y+box.height/2,start=Math.atan2(e.clientY-cy,e.clientX-cx),initial=it.rotation;rotationDragged=false;turn.setPointerCapture(e.pointerId);
      const move=ev=>{const delta=(Math.atan2(ev.clientY-cy,ev.clientX-cx)-start)*180/Math.PI;if(!rotationDragged&&Math.abs(delta)<2)return;if(!rotationDragged){checkpoint();rotationDragged=true;node.classList.add('rotating');}
        it.rotation=snapAngle(Math.round(initial+delta),$('snap').checked);node.dataset.rotation=it.rotation;constrain(it);if($('snap').checked)snapGroup([it],chart().items.filter(x=>x.id!==it.id));Object.assign(node.style,{transform:`rotate(${it.rotation}deg)`,left:`${it.x}px`,top:`${it.y}px`});actions.style.transform=`rotate(${-it.rotation}deg)`;node.querySelectorAll('.seat-name').forEach(text=>text.style.transform=`rotate(${-it.rotation}deg)`);};
      const end=()=>{turn.removeEventListener('pointermove',move);turn.removeEventListener('pointerup',end);turn.removeEventListener('pointercancel',end);if(rotationDragged){if($('snap').checked)snapGroup([it],chart().items.filter(x=>x.id!==it.id));save();render();}};
      turn.addEventListener('pointermove',move);turn.addEventListener('pointerup',end);turn.addEventListener('pointercancel',end);
    };
    turn.onclick=e=>{e.stopPropagation();if(rotationDragged){rotationDragged=false;return;}change(()=>{it.rotation=(it.rotation+90)%360;constrain(it);selection={id:it.id,seat:null};});};
    actions.append(turn,remove);node.append(actions);
    const resize=element('button','resize-handle','↘');resize.setAttribute('aria-label',`Resize ${it.label}`);resize.title='Drag to resize; use Width and Depth for exact sizes';
    resize.onpointerdown=e=>{
      if(e.button!==0) return;e.preventDefault();e.stopPropagation();if(!selectedIds.has(it.id))choose(it);selection={id:it.id,seat:null};renderInspector();
      const members=selectedItems(),original=structuredClone(members),bounds=groupBounds(members);
      const start={x:e.clientX,y:e.clientY,w:it.width,h:it.height};let moved=false;resize.setPointerCapture(e.pointerId);
      const move=ev=>{
        const dx=(ev.clientX-start.x)/zoom,dy=(ev.clientY-start.y)/zoom;if(!moved&&Math.hypot(dx,dy)<3)return;
        if(!moved){checkpoint();moved=true;node.classList.add('resizing');}
        if(members.length>1){members.forEach((item,i)=>Object.assign(item,original[i]));scaleGroup(members,Math.max(.1,1+(dx+dy)/(bounds.width+bounds.height)));paintPositions();return;}
        const angle=it.rotation*Math.PI/180,step=1;
        it.width=Math.max(40,Math.min(400,Math.round((start.w+dx*Math.cos(angle)+dy*Math.sin(angle))/step)*step));
        it.height=Math.max(8,Math.min(300,Math.round((start.h-dx*Math.sin(angle)+dy*Math.cos(angle))/step)*step));if(proportionalTypes.has(it.type)||['door','board','smartboard','cabinet'].includes(it.type))resizeFurniture(it,it.width,it.height,Math.abs(dx*Math.cos(angle)+dy*Math.sin(angle))/start.w>=Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle))/start.h?'width':'height');else constrain(it);snapResize(it);
        Object.assign(node.style,{width:`${it.width}px`,height:`${it.height}px`,left:`${it.x}px`,top:`${it.y}px`});if(it.type==='cabinet')node.querySelector('.furniture-art').innerHTML=furnitureArt(it.type,it.height);showGuides([it]);
      };
      const end=()=>{resize.removeEventListener('pointermove',move);resize.removeEventListener('pointerup',end);resize.removeEventListener('pointercancel',end);if(moved){if(members.length===1&&$('snap').checked){it.width=Math.max(40,Math.min(400,Math.round(it.width/10)*10));it.height=Math.max(8,Math.min(300,Math.round(it.height/10)*10));resizeFurniture(it,it.width,it.height);}save();render();}};
      resize.addEventListener('pointermove',move);resize.addEventListener('pointerup',end);resize.addEventListener('pointercancel',end);
    };node.append(resize);
    node.addEventListener('pointerdown', e => {
      if(e.button !== 0 || e.target.closest('button')) return;
      if(e.shiftKey||e.metaKey||(multiMode&&!selectedIds.has(it.id))){choose(it,true);renderRoom();renderInspector();return;}
      if(!selectedIds.has(it.id))choose(it);
      selection={id:it.id,seat:null};room.querySelectorAll('.item').forEach(n=>n.classList.toggle('selected',selectedIds.has(n.dataset.id)));renderInspector();
      const members=selectedItems(),original=structuredClone(members),start={x:e.clientX,y:e.clientY};let moved=false;
      node.setPointerCapture(e.pointerId);
      const move=ev=>{const dx=(ev.clientX-start.x)/zoom,dy=(ev.clientY-start.y)/zoom;if(!moved&&Math.hypot(dx,dy)<3)return;if(!moved){checkpoint();moved=true;node.classList.add('dragging');}members.forEach((item,i)=>Object.assign(item,original[i]));moveGroup(members,dx,dy);if($('snap').checked)snapGroup(members,chart().items.filter(x=>!selectedIds.has(x.id)));paintPositions();};
      const end=()=>{node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',end);node.removeEventListener('pointercancel',end);if(moved){save();render();}};
      node.addEventListener('pointermove',move);node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);
    });
    node.addEventListener('keydown',e => {
      if(e.target !== node) return;
      if(e.key === 'Enter' || e.key === ' ') {e.preventDefault();selection = {id:it.id,seat:it.seats.length ? 0 : null};renderRoom();renderInspector();(it.seats.length ? $('assignment') : $('item-label')).focus();return;}
      const delta = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(!delta) return;e.preventDefault();
      change(() => {if(!selectedIds.has(it.id))choose(it);selection={id:it.id,seat:null};moveGroup(selectedItems(),delta[0]*(e.shiftKey?1:20),delta[1]*(e.shiftKey?1:20));});
      [...room.children].find(n => n.dataset.id === it.id)?.focus();
    });room.append(node);
    const prior=previous.get(it.id);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      if(prior && (prior.x!==it.x||prior.y!==it.y||prior.width!==it.width||prior.height!==it.height||prior.rotation!==it.rotation)) node.animate([{transform:`translate(${prior.x-it.x}px,${prior.y-it.y}px) rotate(${prior.rotation}deg)`,width:`${prior.width}px`,height:`${prior.height}px`},{transform:`rotate(${prior.rotation+((it.rotation-prior.rotation+540)%360-180)}deg)`,width:`${it.width}px`,height:`${it.height}px`}],{duration:180,easing:'cubic-bezier(.22,1,.36,1)'});
      else if(!prior)node.animate([{opacity:0},{opacity:1}],{duration:160});
      if(prior?.active)node.classList.add('settling');
    }
  }
  updateZoom();
}
function renderInspector() {
  const it = selected(),group=selectedItems().length>1;$('group-controls').hidden=!group;$('group-summary').textContent=`${selectedItems().length} objects selected. Drag any selected object to move the group; drag a resize handle to scale everything together.`;$('group-scale').value=100;$('item-controls').hidden = !it||group;$('seat-controls').hidden = group || !it || selection.seat === null;
  $('selection-title').textContent = group ? `${selectedItems().length} objects selected` : it ? catalog[it.type].label : 'Fine-tune your room';$('selection-hint').hidden = !!it;
  if(!it) return;
  for(const field of ['label','width','height','x','y']) $('item-'+field).value = it[field];
  $('item-angle').value=it.rotation;$('item-width').disabled=it.type==='cabinet';$('item-height').min=['door','board','smartboard'].includes(it.type)?8:30;$('item-height').step=1;
  $('item-color').value=it.color || appearance().color || '#e8d7bb';
  if(selection.seat !== null) {
    const s = it.seats[selection.seat];$('seat-title').textContent = `Seat ${selection.seat+1}`;
    $('assignment').replaceChildren(option('','Unassigned'), ...chart().students.map(st => option(st.id,st.name)));
    $('assignment').value = s.student || '';$('locked').checked = s.locked;
  }
}
function renderRoster() {
  const assigned = new Set(seats(chart()).map(s => s.student));$('roster').replaceChildren();
  chart().students.forEach(st => {
    const row = element('div','student-row');const input = element('input');input.value = st.name;input.maxLength = 80;input.setAttribute('aria-label',`Rename ${st.name}`);
    input.onchange = () => {if(!input.value.trim()) {input.value = st.name;return;} change(() => {st.name = input.value.trim();});};
    const remove = element('button','','×');remove.setAttribute('aria-label',`Remove ${st.name}`);
    remove.onclick = () => change(() => {chart().students = chart().students.filter(s => s.id !== st.id);seats(chart()).forEach(s => {if(s.student === st.id) {s.student=null;s.locked=false;}});},'Student removed. Undo is available.');
    row.append(input,element('small','',assigned.has(st.id)?'Seated':'Waiting'),remove);$('roster').append(row);
  });
}
$('furniture-tab').onclick = () => tab(false);$('students-tab').onclick = () => tab(true);
for(const id of ['furniture-tab','students-tab']) $(id).onkeydown = e => {if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {e.preventDefault();const show = e.key === 'Home' ? false : e.key === 'End' ? true : id === 'furniture-tab';tab(show);$(show?'students-tab':'furniture-tab').focus();}};

$('charts').onchange = () => {state.active = $('charts').value;selection=null;save();render();};
$('name').onchange = () => change(() => {chart().name = $('name').value.trim() || 'Untitled classroom';});
$('new-chart').onclick = () => {if(state.charts.length >= 100) return say('You can keep up to 100 charts.');change(() => {const c = newChart(`Classroom ${state.charts.length+1}`);state.charts.push(c);state.active=c.id;selection=null;},'New chart created.');};
$('copy-chart').onclick = () => {if(state.charts.length >= 100) return say('You can keep up to 100 charts.');change(() => {
  const c = structuredClone(chart());c.id=uid();c.name=`${c.name.slice(0,73)} (copy)`;const map = new Map();c.students.forEach(s => {const old=s.id;s.id=uid();map.set(old,s.id);});c.items.forEach(it => {it.id=uid();it.seats.forEach(s => {s.student=map.get(s.student)||null;});});state.charts.push(c);state.active=c.id;selection=null;
},'Chart duplicated with its roster and assignments.');};
$('delete-chart').onclick = () => {if(state.charts.length<2 || !confirm(`Delete “${chart().name}”? Undo will restore it.`)) return;change(() => {state.charts=state.charts.filter(c => c.id !== state.active);state.active=state.charts[0].id;selection=null;},'Chart deleted. Undo is available.');};
$('apply-preset').onclick = () => {if(!confirm('Replace the room furniture with this layout? Your student list stays. Undo will restore the previous room.')) return;change(() => {chart().items=layout($('preset').value);assignUnseated(chart());selection=null;},'Layout applied. Students seated in roster order.');};
$('add-students').onsubmit = e => {e.preventDefault();const names = $('student-names').value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);if(!names.length) return;if(names.some(n => n.length>80) || chart().students.length+names.length>500) return say('Use names up to 80 characters and no more than 500 students per chart.');change(() => {chart().students.push(...names.map(name => ({id:uid(),name})));$('student-names').value='';},`${names.length} students added. Use “Seat unassigned students” to place them.`);};
$('assign-all').onclick = () => change(() => assignUnseated(chart()),'Students placed in empty, unlocked seats. Any remaining students are marked Waiting.');
$('shuffle').onclick = () => {
  const movable = seats(chart()).filter(s => s.student && !s.locked).length;
  change(() => shuffle(chart()),movable>=2 ? 'Students shuffled. Furniture and locked seats stayed in place.' : 'Unassigned students seated where possible. At least two unlocked, seated students are needed to swap seats.');
};
function restoreEdit(from,to,message){if(!from.length)return;to.push(JSON.stringify(state));if(to.length>40)to.shift();state=JSON.parse(from.pop());selection=null;selectedIds.clear();save();render();say(message);}
$('undo').onclick=()=>restoreEdit(history,redoHistory,'Previous change restored.');
$('redo').onclick=()=>restoreEdit(redoHistory,history,'Change reapplied.');
document.addEventListener('keydown',e=>{if(!(e.metaKey||e.ctrlKey)||e.altKey||e.key.toLowerCase()!=='z'||e.target.closest?.('input,textarea,select,[contenteditable]'))return;e.preventDefault();(e.shiftKey?$('redo'):$('undo')).click();});
for(const field of ['label','width','height','x','y']) $('item-'+field).onchange = () => {
  const it=selected();if(!it) return;const input=$('item-'+field);
  if(field !== 'label' && !input.checkValidity()) {renderInspector();return;}
  change(() => {if(field==='width'||field==='height')resizeFurniture(it,field==='width'?Number(input.value):it.width,field==='height'?Number(input.value):it.height,field);else {it[field]=field==='label'?input.value.trim()||catalog[it.type].label:Number(input.value);constrain(it);}});
};
$('rotate').onclick = () => {const it=selected();if(it) change(() => {it.rotation=(it.rotation+90)%360;constrain(it);});};
$('duplicate-item').onclick = () => {const it=selected();if(!it || chart().items.length>=500) return;change(() => {const copy=structuredClone(it);copy.id=uid();copy.x+=30;copy.y+=30;copy.seats.forEach(s => {s.student=null;s.locked=false;});constrain(copy);chart().items.push(copy);selection={id:copy.id,seat:null};},'Furniture duplicated with empty seats.');};
$('delete-item').onclick = () => {const it=selected();if(it) change(() => {chart().items=chart().items.filter(i => i.id!==it.id);selection=null;},'Furniture removed. Its students are now unassigned.');};
$('assignment').onchange = () => {const it=selected();if(!it || selection.seat===null) return;const target=it.seats[selection.seat], id=$('assignment').value||null;
  const previous=id ? seats(chart()).find(s => s.student===id && s!==target) : null;
  if(previous?.locked) {$('assignment').value=target.student||'';return say('That student has a locked seat. Unlock their current seat before moving them.');}
  change(() => {if(previous) previous.student=target.student;target.student=id;},'Seat assignment updated.');
};
$('locked').onchange = () => {const it=selected();if(it && selection.seat!==null) change(() => {it.seats[selection.seat].locked=$('locked').checked;});};
function updateZoom() {
  zoom = $('zoom').value === 'fit' ? Math.min(1, ($('room').parentElement.clientWidth-40)/WIDTH) : Number($('zoom').value);
  $('room').style.zoom = zoom;
}
$('zoom').onchange = updateZoom;
new ResizeObserver(updateZoom).observe($('room').parentElement);
$('export').onclick = () => {const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=element('a');a.href=url;a.download=`sas-classrooms-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(() => URL.revokeObjectURL(url),1000);say('Backup exported. It includes all classrooms and student names.');};
$('import').onclick = () => $('import-file').click();
$('import-file').onchange = async () => {const file=$('import-file').files[0];if(!file) return;try {
  if(file.size>5_000_000) throw new Error('Backup must be smaller than 5 MB.');
  const incoming=validateBackup(JSON.parse(await file.text()));
  if(!confirm(`Replace your saved classrooms with ${incoming.charts.length} imported chart(s)? Export a backup first if needed. Undo is available.`)) return;
  change(() => {state=incoming;selection=null;},'Backup imported. Undo is available.');
} catch(error) {say(`Import failed: ${error.message}`);} finally {$('import-file').value='';}};
$('print').onclick = () => window.print();
tab(false);render();if(loadError) {say(loadError);$('save-state').textContent='Saved data could not be loaded';}
void connectCloud({getState:()=>structuredClone(state),applyState:incoming=>change(()=>{state=incoming;selection=null;},'Cloud charts opened. Undo is available.'),notify:say});

document.addEventListener('sas-before-refresh',()=>save());

$('item-angle').onchange=()=>{const it=selected();if(!it)return;if(!$('item-angle').checkValidity()||!$('item-angle').value){renderInspector();return;}change(()=>{it.rotation=Number($('item-angle').value);constrain(it);});};

$('multi-select').onclick=()=>{multiMode=!multiMode;$('multi-select').setAttribute('aria-pressed',String(multiMode));say(multiMode?'Tap furniture or seats to add or remove them from the selection. Turn Select multiple off to drag the group.':'Drag selected furniture to move the group.');};
$('clear-selection').onclick=()=>{selection=null;selectedIds.clear();renderRoom();renderInspector();};
$('group-delete').onclick=()=>change(()=>{chart().items=chart().items.filter(it=>!selectedIds.has(it.id));selection=null;},'Selected furniture deleted. Undo is available.');
$('group-scale').onchange=()=>{if(!$('group-scale').checkValidity())return;change(()=>scaleGroup(selectedItems(),Number($('group-scale').value)/100),'Group resized with its spacing preserved.');};
for(const [id,axis] of [['flip-horizontal','flipX'],['flip-vertical','flipY']])$(id).onclick=()=>{const it=selected();if(it)change(()=>{it[axis]=!it[axis];});};

$('room').addEventListener('pointerdown',e=>{
 if(e.target!==$('room')||e.button!==0)return;
 const room=$('room'),rect=room.getBoundingClientRect(),start={x:(e.clientX-rect.x)/zoom,y:(e.clientY-rect.y)/zoom},keep=e.shiftKey||e.metaKey||multiMode?new Set(selectedIds):new Set();let moved=false;
 const box=element('div','selection-marquee');room.append(box);room.setPointerCapture(e.pointerId);
 const move=ev=>{const x=(ev.clientX-rect.x)/zoom,y=(ev.clientY-rect.y)/zoom,l=Math.min(x,start.x),t=Math.min(y,start.y),w=Math.abs(x-start.x),h=Math.abs(y-start.y);moved ||= w+h>4;Object.assign(box.style,{left:l+'px',top:t+'px',width:w+'px',height:h+'px'});selectedIds=new Set(keep);chart().items.forEach(it=>{const b=footprint(it);if(b.x<l+w&&b.x+b.width>l&&b.y<t+h&&b.y+b.height>t)selectedIds.add(it.id);});room.querySelectorAll('.item').forEach(n=>n.classList.toggle('selected',selectedIds.has(n.dataset.id)));};
 const end=()=>{room.removeEventListener('pointermove',move);room.removeEventListener('pointerup',end);room.removeEventListener('pointercancel',end);box.remove();if(!moved)selectedIds=keep;selection=selectedIds.size?{id:[...selectedIds].at(-1),seat:null}:null;renderRoom();renderInspector();};room.addEventListener('pointermove',move);room.addEventListener('pointerup',end);room.addEventListener('pointercancel',end);
});
function fitCaption(el,it){
 if(!el.isConnected)return;el.classList.add('adaptive-caption');const long=el.scrollWidth>it.width-10;
 if(long&&it.height>it.width){el.classList.add('vertical-caption');el.style.width=(it.height-10)+'px';}
 const available=el.classList.contains('vertical-caption')?it.width-6:it.height-6;let size=appearance().fontSize;while(el.scrollHeight>available&&size>8){size--;el.style.fontSize=size+'px';}
 if(el.scrollHeight>available){el.classList.remove('vertical-caption');el.classList.add('floating-caption');el.style.width=Math.max(120,it.width)+'px';}
 el.title=it.label;
}

$('apply-room').onclick=()=>{if(!$('room-width').reportValidity()||!$('room-depth').reportValidity())return;change(()=>reshapeRoom(chart(),Number($('room-width').value),Number($('room-depth').value)),'Room resized. Undo is available.');updateZoom();};
$('square-room').onclick=()=>{change(()=>reshapeRoom(chart(),Math.max(WIDTH,HEIGHT),Math.max(WIDTH,HEIGHT)),'Square room applied.');updateZoom();};
$('rotate-room').onclick=()=>{change(()=>rotateRoom(chart()),'Room and furniture rotated 90°.');updateZoom();};
