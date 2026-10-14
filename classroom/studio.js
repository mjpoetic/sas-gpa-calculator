import {normalizeStudentName,rosterName,seatName} from './student-names.mjs?v=20261013-release7';
import {furnitureArt} from './furniture-art.mjs?v=20261013-release7';
import {snapToWall, rotateGroup, separationConflicts, catalog, uid, newChart, layout, furniture, constrain, seats, assignUnseated, shuffle, validateBackup, defaultAppearance,groupBounds,moveGroup,scaleGroup,snapAngle,snapGroup,footprint,resizeFurniture,proportionalTypes,vacantPosition,setRoomSize,reshapeRoom,rotateRoom,WIDTH,HEIGHT} from './model.mjs?v=20261013-release7';
import {fontOptions,validateFont,fontCSS,loadFont,suggestFonts,fontWeights} from '../assets/font-options.mjs?v=20261013-release7';
import {connectCloud} from './cloud.js?v=20261013-release7';

const $ = id => document.getElementById(id);
const KEY = 'sas-classroom-studio-v1';
let controlFrame,controlEntries=[],groupOverlay,lastSeatTap,labelObservers=[],hoverOwner=null;
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
function paintPositions(){positionGroupOverlay();showGuides(selectedItems());for(const it of selectedItems()){const n=$('room').querySelector(`[data-id="${it.id}"]`);if(n){Object.assign(n.style,{left:it.x+'px',top:it.y+'px',width:it.width+'px',height:it.height+'px',transform:`rotate(${it.rotation}deg)`});n.dataset.rotation=it.rotation;n.querySelectorAll('.seat-name').forEach(t=>t.style.transform=`rotate(${-it.rotation}deg)`);}}}
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
function addFurniture(type,preferred){if(chart().items.length>=500)return say('This chart has reached the furniture limit.');change(()=>{const item=furniture(type);const found=vacantPosition(item,chart().items,preferred);if($('snap').checked)snapToWall(item);chart().items.push(item);choose(item);if(!found)say('Room is full; move the new item to make space.');},catalog[type].label+' added.');}
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
  cancelAnimationFrame(controlFrame);controlEntries=[];groupOverlay=null;if(!chart().items.some(it=>it.id===hoverOwner))hoverOwner=null;labelObservers.forEach(o=>o.disconnect());labelObservers=[];
  const room = $('room');room.style.width=WIDTH+'px';room.style.height=HEIGHT+'px';
  const previous=new Map([...room.querySelectorAll('.item')].map(node=>[node.dataset.id,{x:parseFloat(node.style.left),y:parseFloat(node.style.top),width:parseFloat(node.style.width),height:parseFloat(node.style.height),rotation:Number(node.dataset.rotation||0),active:node.classList.contains('dragging')||node.classList.contains('resizing')} ]));
  room.replaceChildren();
  if(!selection)selectedIds.clear();else if(!selectedIds.has(selection.id))selectedIds=new Set([selection.id]);
  room.style.setProperty('--chart-font-weight',appearance().weight||400);
  room.style.fontFamily=fontCSS(appearance().font);
  room.style.setProperty('--chart-font-size',`${appearance().fontSize}px`);
  const font=appearance().font,weight=appearance().weight||400;$('chart-font-status').textContent=font.source==='google'?'Loading '+font.family+'…':'Font applied: '+(fontOptions[font.family]?.label||font.family);void loadFont(font,weight).then(async()=>{if(document.fonts?.load)await document.fonts.load(`${weight} 14px ${fontCSS(font)}`);if(JSON.stringify(appearance().font)===JSON.stringify(font))$('chart-font-status').textContent='Font applied: '+(fontOptions[font.family]?.label||font.family);}).catch(error=>{$('chart-font-status').textContent=error.message;say(error.message);});
  const layers=new Map([...chart().items].sort((a,b)=>b.width*b.height-a.width*a.height).map((it,i)=>[it.id,i+1]));
  for(const it of chart().items) {
    const node = element('div',`item ${it.type}${selectedIds.has(it.id) ? ' selected' : ''}`);
    node.ondblclick=e=>{if(it.type==='label'||e.target.closest('.seat'))return;if(e.target.closest('.furniture-actions,.resize-handle'))return;e.preventDefault();e.stopPropagation();choose(it);renderInspector();$('item-color').focus();$('item-color').click();};
    node.style.zIndex=layers.get(it.id);node.dataset.id = it.id;node.dataset.rotation=it.rotation;node.tabIndex = 0;node.setAttribute('aria-label',`${it.label}. Drag to move, or use arrow keys.`);
    Object.assign(node.style,{left:`${it.x}px`,top:`${it.y}px`,width:`${it.width}px`,height:`${it.height}px`,transform:`rotate(${it.rotation}deg)`});
    const color=it.color || appearance().color;
    if(color) {node.style.background=color;node.style.setProperty('--furniture-color',color);const rgb=color.slice(1).match(/../g).map(c=>parseInt(c,16));node.style.color=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#172c3e':'#ffffff';}
    const caption=element('span','item-caption',it.label);if(it.seats.length||['rug','label'].includes(it.type))node.append(caption);
    if(it.type==='label'){caption.classList.add('editable-room-label');caption.tabIndex=0;caption.setAttribute('role','textbox');caption.setAttribute('aria-label','Room label; click to rename');caption.title='Click to rename; drag the border to move';if(it.labelFont){caption.style.fontFamily=fontCSS(it.labelFont);void loadFont(it.labelFont).then(async()=>{if(document.fonts?.load)await document.fonts.load(`400 100px ${fontCSS(it.labelFont)}`);fitCaption(caption,it);}).catch(e=>say(e.message));}const observer=new ResizeObserver(()=>fitCaption(caption,it));observer.observe(node);labelObservers.push(observer);caption.oninput=()=>fitCaption(caption,it);caption.onpointerdown=e=>e.stopPropagation();caption.onclick=e=>{e.stopPropagation();choose(it);room.querySelectorAll('.item').forEach(n=>n.classList.toggle('selected',n===node));renderInspector();caption.contentEditable='true';caption.focus();};caption.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();caption.blur();}if(e.key==='Escape'){caption.textContent=it.label;caption.blur();}};caption.onblur=()=>{caption.contentEditable='false';const value=caption.textContent.trim().slice(0,60)||'Room label';if(value!==it.label)change(()=>{it.label=value;},'Room label updated.');};}

    if(!it.seats.length&&it.type!=='teacher'){const art=element('div','furniture-art');art.setAttribute('aria-hidden','true');art.innerHTML=furnitureArt(it.type,it.height);const f=footprint(it),wall=it.type==='door'&&(f.y<=1||f.x<=1||f.y+f.height>=HEIGHT-1||f.x+f.width>=WIDTH-1),wallFlip=it.type==='door'&&((f.y+f.height>=HEIGHT-1&&it.rotation===0)||(f.y<=1&&it.rotation===180)||(f.x+f.width>=WIDTH-1&&it.rotation===270)||(f.x<=1&&it.rotation===90));art.style.transform=`scale(${it.flipX?-1:1},${(wall?wallFlip:it.flipY)?-1:1})`;node.prepend(art);if(color&&!art.innerHTML.includes('var(--furniture-color')){const rects=[...art.querySelectorAll('rect')].sort((a,b)=>Number(b.getAttribute('width'))*Number(b.getAttribute('height'))-Number(a.getAttribute('width'))*Number(a.getAttribute('height')));(rects[0]||art.querySelector('circle'))?.setAttribute('fill',color);}requestAnimationFrame(()=>fitCaption(caption,it));}
    node.title=it.label;
    if(it.seats.length) {
      const grid = element('div','seat-grid');grid.style.setProperty('--columns',it.seats.length === 1 ? 1 : 2);
      it.seats.forEach((s,i) => {
        const student = chart().students.find(st => st.id === s.student);
        const btn = element('button',`seat${student ? ' assigned' : ''}${s.locked ? ' locked' : ''}${selection?.id === it.id && selection?.seat === i ? ' selected-seat' : ''}`);
        const text = element('span','seat-name',student?seatName(student,chart().students):`Seat ${i+1}`);
        // The seat footprint follows its desk; only its name stays upright.
        text.style.transform = `rotate(${-it.rotation}deg)`;
        const sideways = it.rotation % 180 !== 0;
        text.style.width = sideways ? 'calc(100% - 8px)' : 'calc(100% - 6px)';
        if(s.color){btn.style.setProperty('--seat-custom-color',s.color);const rgb=s.color.slice(1).match(/../g).map(c=>parseInt(c,16));btn.style.setProperty('--seat-custom-ink',rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#172c3e':'#ffffff');}btn.append(text);
        new ResizeObserver(([entry], observer) => {
          const {width,height} = entry.contentRect;
          const angle=it.rotation*Math.PI/180,diagonal=it.rotation%90!==0;
          const side=Math.min(width,height)/(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)));
          text.style.width = `${Math.max(0,(diagonal?side:sideways ? height : width)-6)}px`;
          text.style.maxHeight = `${Math.max(0,(diagonal?side:sideways ? width : height)-4)}px`;
          observer.disconnect();
        }).observe(btn);
        btn.setAttribute('aria-label',`${it.label}, seat ${i+1}: ${student?seatName(student,chart().students):'unassigned'}${s.locked ? ', locked during shuffle' : ''}`);
        btn.ondblclick=e=>{e.stopPropagation();e.preventDefault();openSeatDetails(it,i);};
        btn.onclick = e => {e.stopPropagation();const key=it.id+':'+i,now=Date.now(),double=lastSeatTap?.key===key&&now-lastSeatTap.time<400;lastSeatTap={key,time:now};if(double){openSeatDetails(it,i);return;}if(e.shiftKey||e.metaKey||multiMode){choose(it,true);renderRoom();renderInspector();return;}selectedIds=new Set([it.id]);selection = {id:it.id,seat:i};renderRoom();renderInspector();($('assignment').parentElement.querySelector('.site-select-trigger')||$('assignment')).focus();};
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
    const duplicate=element('button','furniture-duplicate');duplicate.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 9h11v11H9ZM4 15H3V3h12v1"/></svg>';duplicate.type='button';duplicate.title='Duplicate furniture with empty seats';duplicate.setAttribute('aria-label',`Duplicate ${it.label}`);duplicate.onclick=e=>{e.stopPropagation();duplicateFurniture(it);};actions.append(turn,duplicate,remove);node.append(actions);
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
        it.height=Math.max(8,Math.min(300,Math.round((start.h-dx*Math.sin(angle)+dy*Math.cos(angle))/step)*step));if(proportionalTypes.has(it.type)||['door','board','smartboard','bulletin','cabinet'].includes(it.type))resizeFurniture(it,it.width,it.height,Math.abs(dx*Math.cos(angle)+dy*Math.sin(angle))/start.w>=Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle))/start.h?'width':'height');else constrain(it);snapResize(it);
        Object.assign(node.style,{width:`${it.width}px`,height:`${it.height}px`,left:`${it.x}px`,top:`${it.y}px`});if(it.type==='cabinet')node.querySelector('.furniture-art').innerHTML=furnitureArt(it.type,it.height);showGuides([it]);
      };
      const end=()=>{resize.removeEventListener('pointermove',move);resize.removeEventListener('pointerup',end);resize.removeEventListener('pointercancel',end);if(moved){if(members.length===1&&$('snap').checked){it.width=Math.max(40,Math.min(400,Math.round(it.width/10)*10));it.height=Math.max(8,Math.min(300,Math.round(it.height/10)*10));resizeFurniture(it,it.width,it.height);}save();render();}};
      resize.addEventListener('pointermove',move);resize.addEventListener('pointerup',end);resize.addEventListener('pointercancel',end);
    };node.append(resize);if(selectedIds.size<2)controlEntries.push({node,actions,resize});node.addEventListener('pointerenter',updateObjectControls);node.addEventListener('focusin',updateObjectControls);
    node.addEventListener('pointerdown', e => {
      if(e.button !== 0 || e.target.closest('button')) return;
      if(e.shiftKey||e.metaKey||(multiMode&&!selectedIds.has(it.id))){choose(it,true);renderRoom();renderInspector();return;}
      if(!selectedIds.has(it.id))choose(it);
      selection={id:it.id,seat:null};room.querySelectorAll('.item').forEach(n=>n.classList.toggle('selected',selectedIds.has(n.dataset.id)));renderInspector();
      const members=selectedItems(),original=structuredClone(members),start={x:e.clientX,y:e.clientY};let moved=false;
      node.setPointerCapture(e.pointerId);
      const move=ev=>{const dx=(ev.clientX-start.x)/zoom,dy=(ev.clientY-start.y)/zoom;if(!moved&&Math.hypot(dx,dy)<3)return;if(!moved){checkpoint();moved=true;node.classList.add('dragging');}members.forEach((item,i)=>Object.assign(item,original[i]));moveGroup(members,dx,dy);if($('snap').checked)snapGroup(members,chart().items.filter(x=>!selectedIds.has(x.id)));if(members.length===1&&$('snap').checked)snapToWall(members[0]);paintPositions();};
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
  if(selectedItems().length>1)renderGroupControls();updateZoom();updateObjectControls();
}
function renderInspector() {
  document.dispatchEvent(new CustomEvent('sas-selection-changed',{detail:{selected:!!selected(),seat:!!selected()&&selection?.seat!==null}}));
  const it = selected(),group=selectedItems().length>1;$('group-controls').hidden=!group;$('group-summary').textContent=`${selectedItems().length} objects selected. Drag any selected object to move the group; drag a resize handle to scale everything together.`;$('group-scale').value=100;$('item-controls').hidden = !it||group;$('seat-controls').hidden = group || !it || selection.seat === null;
  $('selection-title').textContent = group ? `${selectedItems().length} objects selected` : it ? catalog[it.type].label : 'Fine-tune your room';$('selection-hint').hidden = !!it;
  if(!it) return;
  for(const field of ['label','width','height','x','y']) $('item-'+field).value = it[field];
  $('item-angle').value=it.rotation;$('item-width').disabled=it.type==='cabinet';$('item-height').min=['door','board','smartboard','bulletin'].includes(it.type)?8:30;$('item-height').step=1;
  $('label-font-controls').hidden=it.type!=='label';$('label-font-source').value=it.labelFont?.source||'preset';$('label-font-family').value=it.labelFont?.family||'system';
  $('item-color').value=it.color || appearance().color || '#e8d7bb';
  if(selection.seat !== null) {
    const s = it.seats[selection.seat];$('seat-title').textContent = `Seat ${selection.seat+1}`;
    $('assignment').replaceChildren(option('','Unassigned'), ...chart().students.map(st => option(st.id,rosterName(st))));
    $('seat-color').value=s.color||'#f4eee3';const student=chart().students.find(st=>st.id===s.student);$('seat-student-options').hidden=!student;$('seat-student-name').value=student?.name||'';
    $('assignment').value = s.student || '';$('locked').checked = s.locked;
  }
}
function renderRoster() {
  const picked=$('saved-rosters').value;$('saved-rosters').replaceChildren(option('','Choose a list'),...(state.studentLists||[]).map(l=>option(l.id,l.name)));$('saved-rosters').value=picked;
  $('load-roster').disabled=$('delete-roster').disabled=!$('saved-rosters').value;
  const assigned = new Set(seats(chart()).map(s => s.student));$('roster').replaceChildren();
  chart().students.forEach(st => {
    const row = element('div','student-row');const input = element('input');input.value=rosterName(st);input.readOnly=true;input.maxLength=80;input.setAttribute('aria-label',`Student ${rosterName(st)}`);
    let editing=false;const edit=element('button','student-edit','✎');edit.type='button';edit.setAttribute('aria-label',`Edit name for ${rosterName(st)}`);edit.title='Edit full student name';
    edit.onclick=()=>{editing=true;input.readOnly=false;input.value=st.name;input.focus();input.select();};
    input.onblur=()=>{if(!editing)return;editing=false;const name=normalizeStudentName(input.value);if(name&&name!==st.name)change(()=>{st.name=name;},'Student name updated.');else{input.readOnly=true;input.value=rosterName(st);}};
    input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();input.blur();}if(e.key==='Escape'){editing=false;input.readOnly=true;input.value=rosterName(st);}};
    const remove = element('button','','×');remove.setAttribute('aria-label',`Remove ${rosterName(st)}`);
    remove.onclick = () => change(() => {chart().students = chart().students.filter(s => s.id !== st.id);chart().students.forEach(s=>{if(s.avoid)s.avoid=s.avoid.filter(id=>id!==st.id);});seats(chart()).forEach(s => {if(s.student === st.id) {s.student=null;s.locked=false;}});},'Student removed. Undo is available.');
    const avoid=element('button','student-avoid','↔');avoid.title='Choose students to seat apart';avoid.setAttribute('aria-label','Separation preferences for '+rosterName(st));avoid.onclick=()=>editSeparation(st);input.ondblclick=()=>editSeparation(st);row.append(avoid,input,element('small','',assigned.has(st.id)?'Seated':'Waiting'),edit,remove);$('roster').append(row);
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
$('add-students').onsubmit = e => {e.preventDefault();const names = $('student-names').value.split(/\r?\n/).map(normalizeStudentName).filter(Boolean);if(!names.length) return;if(names.some(n => n.length>80) || chart().students.length+names.length>500) return say('Use names up to 80 characters and no more than 500 students per chart.');change(() => {chart().students.push(...names.map(name => ({id:uid(),name})));$('student-names').value='';},`${names.length} students added. Use “Seat unassigned students” to place them.`);};
$('assign-all').onclick = () => {change(() => assignUnseated(chart()));say('Students placed. '+separationMessage());};
$('shuffle').onclick = () => {
  const movable = seats(chart()).filter(s => s.student && !s.locked).length;
  change(() => shuffle(chart()));say((movable>=2?'Students shuffled. ':'Unassigned students seated where possible. ')+separationMessage());
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
function duplicateFurniture(it){if(!it||chart().items.length>=500)return;change(()=>{const copy=structuredClone(it);copy.id=uid();copy.seats.forEach(s=>{s.student=null;s.locked=false;});vacantPosition(copy,chart().items,{x:it.x+30,y:it.y+30});chart().items.push(copy);choose(copy);},'Furniture duplicated with empty seats. Undo is available.');}
$('duplicate-item').onclick=()=>duplicateFurniture(selected());
$('delete-item').onclick = () => {const it=selected();if(it) change(() => {chart().items=chart().items.filter(i => i.id!==it.id);selection=null;},'Furniture removed. Its students are now unassigned.');};
$('assignment').onchange = () => {const it=selected();if(!it || selection.seat===null) return;const target=it.seats[selection.seat], id=$('assignment').value||null;
  const previous=id ? seats(chart()).find(s => s.student===id && s!==target) : null;
  if(previous?.locked) {$('assignment').value=target.student||'';return say('That student has a locked seat. Unlock their current seat before moving them.');}
  change(() => {if(previous) previous.student=target.student;target.student=id;},'Seat assignment updated.');
};
$('locked').onchange = () => {const it=selected();if(it && selection.seat!==null) change(() => {it.seats[selection.seat].locked=$('locked').checked;});};
function updateZoom() {
  $('room').parentElement.dataset.zoom=$('zoom').value==='fit'?'fit':'manual';
  zoom = $('zoom').value === 'fit' ? Math.min(3,Math.max(80,$('room').parentElement.clientWidth-4)/WIDTH,Math.max(80,$('room').parentElement.clientHeight-4)/HEIGHT) : Number($('zoom').value);
  $('room').style.zoom = zoom;if($('canvas-zoom-level'))$('canvas-zoom-level').textContent=Math.round(zoom*100)+'%';
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
 if(!el.isConnected)return;
 if(it.type==='label'){const ctx=document.createElement('canvas').getContext('2d');ctx.font=`400 100px ${getComputedStyle(el).fontFamily}`;const text=el.textContent||'Room label',width=ctx.measureText(text).width;el.style.fontSize=Math.max(8,Math.min(200,(it.width-12)*100/Math.max(1,width),(it.height-10)*.8))+'px';return;}el.classList.add('adaptive-caption');const long=el.scrollWidth>it.width-10;
 if(long&&it.height>it.width){el.classList.add('vertical-caption');el.style.width=(it.height-10)+'px';}
 const available=el.classList.contains('vertical-caption')?it.width-6:it.height-6;let size=appearance().fontSize;while(el.scrollHeight>available&&size>8){size--;el.style.fontSize=size+'px';}
 if(el.scrollHeight>available){el.classList.remove('vertical-caption');el.classList.add('floating-caption');el.style.width=Math.max(120,it.width)+'px';}
 el.title=it.label;
}

$('apply-room').onclick=()=>{if(!$('room-width').reportValidity()||!$('room-depth').reportValidity())return;change(()=>reshapeRoom(chart(),Number($('room-width').value),Number($('room-depth').value)),'Room resized. Undo is available.');updateZoom();};
$('square-room').onclick=()=>{change(()=>reshapeRoom(chart(),Math.max(WIDTH,HEIGHT),Math.max(WIDTH,HEIGHT)),'Square room applied.');updateZoom();};
$('rotate-room').onclick=()=>{change(()=>rotateRoom(chart()),'Room and furniture rotated 90°.');updateZoom();};

document.addEventListener('sas-workspace-resize',updateZoom);window.visualViewport?.addEventListener('resize',updateZoom);

let panMode=false;
function setPan(value){panMode=value;$('room').dataset.pan=String(value);$('canvas-pan').setAttribute('aria-pressed',String(value));}
function setCanvasZoom(value){const scroller=$('room').parentElement;value=Math.max(.05,Math.min(3,value));let entry=$('zoom').querySelector('option[data-custom-zoom]');if(!entry){entry=option('custom','Custom zoom');entry.dataset.customZoom='true';$('zoom').append(entry);}entry.value=String(value);entry.textContent=Math.round(value*100)+'%';$('zoom').value=String(value);updateZoom();scroller.scrollLeft=Math.max(0,(scroller.scrollWidth-scroller.clientWidth)/2);scroller.scrollTop=Math.max(0,(scroller.scrollHeight-scroller.clientHeight)/2);setPan(true);say('Drag to pan the enlarged room. Turn Pan off to move furniture.');}
document.addEventListener('sas-canvas-zoom',event=>{const mode=event.detail.mode;if(mode==='pan'){setPan(!panMode);return;}if(mode==='fit'){$('zoom').value='fit';updateZoom();setPan(false);return;}if(mode==='fill'){const s=$('room').parentElement;setCanvasZoom(Math.max(s.clientWidth/WIDTH,s.clientHeight/HEIGHT));return;}setCanvasZoom(zoom*(mode==='in'?1.25:.8));});
$('room').addEventListener('pointerdown',event=>{if(!panMode||event.button!==0)return;event.preventDefault();event.stopImmediatePropagation();const room=$('room'),s=room.parentElement,start={x:event.clientX,y:event.clientY,left:s.scrollLeft,top:s.scrollTop};room.setPointerCapture(event.pointerId);const move=e=>{s.scrollLeft=start.left-(e.clientX-start.x);s.scrollTop=start.top-(e.clientY-start.y);};const end=()=>{room.removeEventListener('pointermove',move);room.removeEventListener('pointerup',end);room.removeEventListener('pointercancel',end);};room.addEventListener('pointermove',move);room.addEventListener('pointerup',end);room.addEventListener('pointercancel',end);},true);
$('zoom').addEventListener('change',()=>{if($('zoom').value==='fit')setPan(false);});

$('room').addEventListener('click',event=>{if(panMode){event.preventDefault();event.stopImmediatePropagation();}},true);
$('student-names').addEventListener('paste',event=>{const text=event.clipboardData?.getData('text/plain');if(!text)return;event.preventDefault();const clean=text.split(/\r\n|\r|\n/).map(normalizeStudentName).join('\n');event.target.setRangeText(clean,event.target.selectionStart,event.target.selectionEnd,'end');event.target.dispatchEvent(new Event('input',{bubbles:true}));});

function updateObjectControls(){
 cancelAnimationFrame(controlFrame);const s=$('room').parentElement,b=s.getBoundingClientRect(),v=window.visualViewport;
 const bounds={left:Math.max(b.left,v?.offsetLeft||0)+5,top:Math.max(b.top,v?.offsetTop||0)+5,right:Math.min(b.right,(v?.offsetLeft||0)+(v?.width||innerWidth))-5,bottom:Math.min(b.bottom,(v?.offsetTop||0)+(v?.height||innerHeight))-5};
 for(const panel of document.querySelectorAll('.library:not([hidden]),.inspector:not([hidden])')){if(getComputedStyle(panel).position!=='fixed')continue;const p=panel.getBoundingClientRect();if(p.width>=b.width*.8&&p.top>b.top)bounds.bottom=Math.min(bounds.bottom,p.top-5);else if(p.right>=b.right-20&&p.left>b.left)bounds.right=Math.min(bounds.right,p.left-5);}
 const zoomBox=document.querySelector('.canvas-zoom')?.getBoundingClientRect();
 let active=false;const touch=matchMedia('(pointer:coarse)').matches,base=touch?44:32,size=Math.max(touch?36:24,base/Math.sqrt(Math.max(1,zoom)));
 for(const {node,actions,resize} of controlEntries){if(!node.isConnected)continue;if(!(node.classList.contains('group-selection')||node.dataset.id===hoverOwner||(!hoverOwner&&(node.classList.contains('selected')||node.matches(':focus-within'))))){node.classList.remove('controls-visible');continue;}const box=node.getBoundingClientRect(),visible=box.right>bounds.left&&box.left<bounds.right&&box.bottom>bounds.top&&box.top<bounds.bottom;
 const showing=visible;node.classList.toggle('controls-visible',showing);if(!showing)continue;active=true;
 const angle=Number(node.dataset.rotation||0),r=angle*Math.PI/180,w=parseFloat(node.style.width),h=parseFloat(node.style.height),cx=box.x+box.width/2,cy=box.y+box.height/2;
 function place(el,x,y,factor){const ew=el.offsetWidth*zoom*factor,eh=el.offsetHeight*zoom*factor;if(zoomBox&&x+ew/2>zoomBox.left&&x-ew/2<zoomBox.right&&y+eh/2>zoomBox.top&&y-eh/2<zoomBox.bottom)y=Math.max(bounds.top+eh/2,zoomBox.top-eh/2-5);const dx=x-cx,dy=y-cy;el.style.left=(w/2+(dx*Math.cos(r)+dy*Math.sin(r))/zoom)+'px';el.style.top=(h/2+(-dx*Math.sin(r)+dy*Math.cos(r))/zoom)+'px';el.style.right='auto';el.style.bottom='auto';el.style.transform=`translate(-50%,-50%) rotate(${-angle}deg) scale(${factor})`;}
 const factor=size/((actions.firstElementChild.offsetWidth||base)*zoom),aw=actions.offsetWidth*zoom*factor,ah=actions.offsetHeight*zoom*factor;
 place(actions,Math.max(bounds.left+aw/2,Math.min(bounds.right-aw/2,box.right-aw/2)),Math.max(bounds.top+ah/2,Math.min(bounds.bottom-ah/2,(node.classList.contains('label')&&box.top-ah<bounds.top?box.bottom+ah/2+5:box.top-ah/2-5))),factor);
 const rs=touch?36:Math.max(22,26/Math.sqrt(Math.max(1,zoom)));place(resize,Math.max(bounds.left+rs/2,Math.min(bounds.right-rs/2,box.right)),Math.max(bounds.top+rs/2,Math.min(bounds.bottom-rs/2,box.bottom)),rs/(resize.offsetWidth*zoom||24*zoom));
 }if(active)controlFrame=requestAnimationFrame(updateObjectControls);
}
$('room').parentElement.addEventListener('scroll',updateObjectControls,{passive:true});window.addEventListener('resize',updateObjectControls);

$('saved-rosters').onchange=()=>{$('load-roster').disabled=$('delete-roster').disabled=!$('saved-rosters').value;};
$('save-roster').onclick=()=>{const name=$('roster-name').value.trim();if(!name||!chart().students.length)return say('Enter a list name and add students first.');if((state.studentLists||[]).length>=100)return say('You can save up to 100 student lists.');change(()=>{(state.studentLists||= []).push({id:uid(),name,names:chart().students.map(s=>s.name),avoid:chart().students.map(s=>(s.avoid||[]).map(id=>chart().students.findIndex(st=>st.id===id)).filter(i=>i>=0))});$('roster-name').value='';},'Student list saved for other classrooms.');};
$('load-roster').onclick=()=>{const list=state.studentLists?.find(l=>l.id===$('saved-rosters').value);if(!list)return;if(chart().students.length&&!confirm('Replace the current students with '+list.name+'? Furniture stays in place. Undo is available.'))return;change(()=>{chart().students=list.names.map(name=>({id:uid(),name}));chart().students.forEach((s,i)=>{s.avoid=(list.avoid?.[i]||[]).map(n=>chart().students[n].id);});seats(chart()).forEach(s=>{s.student=null;s.locked=false;});},'Student list loaded. Use Seat unassigned students when ready.');};
$('delete-roster').onclick=()=>{const id=$('saved-rosters').value;if(id)change(()=>{state.studentLists=state.studentLists.filter(l=>l.id!==id);},'Saved list deleted. Classroom students are unchanged.');};

function separationMessage(){const count=separationConflicts(chart());return count?`${count} separation preference(s) could not be met. Check neighboring seats; locked seats stay fixed.`:'Separation preferences checked; locked seats stay fixed.';}
function editSeparation(student){const d=element('dialog','workspace-dialog separation-dialog');const form=element('form');form.method='dialog';form.append(element('h2','',`Seat ${rosterName(student)} apart from…`));const close=element('button','','×');close.setAttribute('aria-label','Close separation preferences');form.append(close);d.append(form,element('p','hint','We try to keep these students apart during seating and shuffle. Nearby seats and seats at the same desk count as neighbors; locked seats stay fixed.'));
const choices=[];for(const other of chart().students.filter(s=>s.id!==student.id)){const label=element('label','check');const box=element('input');box.type='checkbox';box.checked=student.avoid?.includes(other.id)||other.avoid?.includes(student.id)||false;choices.push({box,id:other.id});label.append(box,document.createTextNode(rosterName(other)));d.append(label);}const saveButton=element('button','primary','Save preferences');saveButton.onclick=()=>{change(()=>{student.avoid=choices.filter(c=>c.box.checked).map(c=>c.id);for(const c of choices){const other=chart().students.find(s=>s.id===c.id);other.avoid=(other.avoid||[]).filter(id=>id!==student.id);if(c.box.checked)other.avoid.push(student.id);}},'Separation preferences saved. Use Shuffle students to apply them.');d.close();};d.append(saveButton);d.onclose=()=>d.remove();document.body.append(d);d.showModal();}
$('seat-color').onchange=()=>{const it=selected();if(it&&selection.seat!==null)change(()=>{it.seats[selection.seat].color=$('seat-color').value;});};
$('seat-color-reset').onclick=()=>{const it=selected();if(it&&selection.seat!==null)change(()=>{delete it.seats[selection.seat].color;});};
$('label-font-apply').onclick=async()=>{const it=selected();if(it?.type!=='label')return;try{const font=validateFont({source:$('label-font-source').value,family:$('label-font-family').value.trim()});await loadFont(font);change(()=>{it.labelFont=font;},'Label font applied.');}catch(e){say(e.message);}};

$('label-font-source').onchange=()=>{const source=$('label-font-source').value;suggestFonts($('label-font-family'),source,'label-font-suggestions');if(source==='preset')$('label-font-family').value='system';};

function openSeatDetails(it,index){choose(it);selection={id:it.id,seat:index};renderRoom();renderInspector();document.dispatchEvent(new Event('sas-seat-details'));$('seat-color').focus();}
$('seat-student-name').onchange=()=>{const it=selected(),student=chart().students.find(s=>s.id===it?.seats[selection?.seat]?.student),name=normalizeStudentName($('seat-student-name').value);if(student&&name&&name.length<=80)change(()=>{student.name=name;},'Student name updated.');};
$('seat-student-separation').onclick=()=>{const student=chart().students.find(s=>s.id===selected()?.seats[selection?.seat]?.student);if(student)editSeparation(student);};
function positionGroupOverlay(){if(!groupOverlay||selectedItems().length<2)return;const b=groupBounds(selectedItems());Object.assign(groupOverlay.style,{left:b.x+'px',top:b.y+'px',width:b.width+'px',height:b.height+'px'});}
function renderGroupControls(){
 const members=selectedItems();groupOverlay=element('div','group-selection selected');groupOverlay.dataset.rotation=0;const actions=element('div','furniture-actions'),resize=element('button','resize-handle','↘'),turn=element('button','furniture-rotate','↻'),copy=element('button','furniture-duplicate','⧉'),remove=element('button','furniture-delete','×');
 copy.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 9h11v11H9ZM4 15H3V3h12v1"/></svg>';
 for(const [button,label] of [[turn,'Rotate selected objects'],[copy,'Duplicate selected objects'],[remove,'Delete selected objects'],[resize,'Resize selected objects']]){button.type='button';button.setAttribute('aria-label',label);button.title=label;}
 remove.onclick=e=>{e.stopPropagation();change(()=>{chart().items=chart().items.filter(it=>!selectedIds.has(it.id));selectedIds.clear();selection=null;},'Selected furniture removed. Undo is available.');};
 copy.onclick=e=>{e.stopPropagation();if(chart().items.length+members.length>500)return say('This chart has reached the furniture limit.');change(()=>{const copies=structuredClone(members);copies.forEach(it=>{it.id=uid();it.seats.forEach(s=>{s.student=null;s.locked=false;});});const b=groupBounds(copies),proxy={x:b.x,y:b.y,width:b.width,height:b.height,rotation:0};vacantPosition(proxy,chart().items,{x:b.x+30,y:b.y+30});moveGroup(copies,proxy.x-b.x,proxy.y-b.y);chart().items.push(...copies);selectedIds=new Set(copies.map(it=>it.id));selection={id:copies[0].id,seat:null};},'Group duplicated with empty seats. Undo is available.');};
 let rotated=false;turn.onclick=e=>{e.stopPropagation();if(rotated){rotated=false;return;}change(()=>{if(!rotateGroup(members,90))say('This group is too large to rotate within the room. Resize it first.');});};
 turn.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const original=structuredClone(members),r=groupOverlay.getBoundingClientRect(),cx=r.x+r.width/2,cy=r.y+r.height/2,start=Math.atan2(e.clientY-cy,e.clientX-cx);rotated=false;turn.setPointerCapture(e.pointerId);const move=ev=>{const delta=snapAngle((Math.atan2(ev.clientY-cy,ev.clientX-cx)-start)*180/Math.PI,$('snap').checked);if(!rotated&&Math.min(delta,360-delta)<2)return;if(!rotated){checkpoint();rotated=true;}members.forEach((it,i)=>Object.assign(it,original[i]));rotateGroup(members,delta);paintPositions();for(const it of members){const n=$('room').querySelector(`[data-id="${it.id}"]`);n.dataset.rotation=it.rotation;n.style.transform=`rotate(${it.rotation}deg)`;n.querySelectorAll('.seat-name').forEach(t=>t.style.transform=`rotate(${-it.rotation}deg)`);}};const end=()=>{turn.removeEventListener('pointermove',move);turn.removeEventListener('pointerup',end);turn.removeEventListener('pointercancel',end);if(rotated){save();render();}};turn.addEventListener('pointermove',move);turn.addEventListener('pointerup',end);turn.addEventListener('pointercancel',end);};
 resize.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const original=structuredClone(members),b=groupBounds(members),start={x:e.clientX,y:e.clientY};let moved=false;resize.setPointerCapture(e.pointerId);const move=ev=>{const dx=(ev.clientX-start.x)/zoom,dy=(ev.clientY-start.y)/zoom;if(!moved&&Math.hypot(dx,dy)<3)return;if(!moved){checkpoint();moved=true;}members.forEach((it,i)=>Object.assign(it,original[i]));scaleGroup(members,Math.max(.1,1+(dx+dy)/(b.width+b.height)));paintPositions();};const end=()=>{resize.removeEventListener('pointermove',move);resize.removeEventListener('pointerup',end);resize.removeEventListener('pointercancel',end);if(moved){save();render();}};resize.addEventListener('pointermove',move);resize.addEventListener('pointerup',end);resize.addEventListener('pointercancel',end);};
 actions.append(turn,copy,remove);groupOverlay.append(actions,resize);$('room').append(groupOverlay);positionGroupOverlay();controlEntries.push({node:groupOverlay,actions,resize});
}

// Hover never changes furniture stacking: smaller objects remain above their surfaces.
$('room').addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 const target=e.target.closest('.item'),previous=controlEntries.find(entry=>entry.node.dataset.id===hoverOwner);
 if(previous&&target!==previous.node&&!e.target.closest('.furniture-actions,.resize-handle')){const a=previous.actions.getBoundingClientRect(),n=previous.node.getBoundingClientRect();const corridor=e.clientX>=Math.min(a.left,n.left)-4&&e.clientX<=Math.max(a.right,n.right)+4&&e.clientY>=Math.min(a.top,n.top)-4&&e.clientY<=Math.max(n.top,a.bottom)+6;if(corridor)return;}
 const owner=target?.dataset.id||null;if(owner!==hoverOwner){hoverOwner=owner;updateObjectControls();}
});
$('room').addEventListener('pointerleave',()=>{hoverOwner=null;updateObjectControls();});

$('room').addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){hoverOwner=null;updateObjectControls();}},true);
