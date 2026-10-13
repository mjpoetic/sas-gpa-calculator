import {catalog, uid, newChart, layout, furniture, constrain, seats, assignUnseated, shuffle, validateBackup, defaultAppearance} from './model.mjs';
import {fontOptions,validateFont,fontCSS,loadFont,suggestFonts} from '../assets/font-options.mjs';
import {connectCloud} from './cloud.js';

const $ = id => document.getElementById(id);
const KEY = 'sas-classroom-studio-v1';
let state, loadError = '', selection = null, history = [], zoom = 1;
try {
  const saved = localStorage.getItem(KEY);
  state = saved ? validateBackup(JSON.parse(saved)) : null;
} catch { loadError = 'Saved charts could not be loaded. Export your current work before reloading; the previous saved data will remain untouched until you make a change.'; }
if (!state) {const c = newChart(); state = {version:1, active:c.id, charts:[c]};}
const chart = () => state.charts.find(c => c.id === state.active);
const selected = () => chart().items.find(it => it.id === selection?.id);
const appearance = () => chart().appearance || defaultAppearance();
const say = text => {$('message').textContent = text;};
function save() {
  try {localStorage.setItem(KEY, JSON.stringify(state)); $('save-state').textContent = '✓ Saved in this browser';}
  catch {$('save-state').textContent = 'Save unavailable — export a backup'; say('Browser storage is unavailable or full. Export a backup to preserve your work.');}
}
function checkpoint() {history.push(JSON.stringify(state)); if(history.length > 40) history.shift();}
function change(fn, message) {checkpoint();fn();save();render();if(message) say(message);}
function element(tag, className, text) {const el = document.createElement(tag);if(className) el.className = className;if(text !== undefined) el.textContent = text;return el;}
function option(value, text) {const el = element('option','',text);el.value = value;return el;}
function tab(students) {
  $('students-panel').hidden = !students; $('furniture-panel').hidden = students;
  $('students-tab').setAttribute('aria-selected',String(students));$('furniture-tab').setAttribute('aria-selected',String(!students));
  $('students-tab').tabIndex = students ? 0 : -1; $('furniture-tab').tabIndex = students ? -1 : 0;
}
for (const [type,spec] of Object.entries(catalog)) {
  const btn = element('button');btn.append(element('span',`mini ${type}`),element('span','',spec.label));
  btn.onclick = () => {
    if(chart().items.length >= 500) return say('This chart has reached the 500 furniture limit.');
    change(() => {const shift = chart().items.length % 8 * 20;const item = furniture(type,320+shift,220+shift);chart().items.push(item);selection = {id:item.id, seat:null};},`${spec.label} added. Drag it into place.`);
  };
  $('palette').append(btn);
}
function render() {
  const c = chart();
  $('charts').replaceChildren(...state.charts.map(c => option(c.id,c.name)));$('charts').value = c.id;
  $('name').value = c.name;$('room-title').textContent = c.name;$('student-count').textContent = c.students.length;
  const all = seats(c), count = all.filter(s => s.student).length;
  $('seat-summary').textContent = `${count} seated · ${all.length} seats · ${c.students.length-count} unassigned`;
  $('roster-summary').textContent = `${c.students.length} students · ${c.students.length-count} unassigned`;
  $('undo').disabled = !history.length;$('delete-chart').disabled = state.charts.length === 1;
  renderRoom();renderInspector();renderRoster();
  renderAppearance();
}
function renderAppearance() {
  const a=appearance();$('chart-font-source').value=a.font.source;$('chart-font').value=a.font.source==='preset'?a.font.family:'system';
  $('chart-font-family').value=a.font.source==='preset'?'':a.font.family;$('chart-font-size').value=a.fontSize;$('chart-color').value=a.color||'#e8d7bb';chartFontFields();
}
function chartFontFields() {const custom=$('chart-font-source').value!=='preset';$('chart-custom-font').hidden=!custom;$('chart-preset-label').hidden=custom;suggestFonts($('chart-font-family'),$('chart-font-source').value,'chart-font-suggestions');}
function chartStyle(fn,message) {change(()=>{chart().appearance=structuredClone(appearance());fn(chart().appearance);},message);}
for(const [key,spec] of Object.entries(fontOptions)) $('chart-font').append(option(key,spec.label));
$('chart-font-source').onchange=()=>{chartFontFields();if($('chart-font-source').value==='preset') chartStyle(a=>{a.font={source:'preset',family:$('chart-font').value};});};
$('chart-font').onchange=()=>chartStyle(a=>{a.font={source:'preset',family:$('chart-font').value};});
$('chart-custom-font').onsubmit=e=>{e.preventDefault();try{const font=validateFont({source:$('chart-font-source').value,family:$('chart-font-family').value.trim()});chartStyle(a=>{a.font=font;},'Chart font applied.');}catch(error){say(error.message);}};
$('chart-font-size').onchange=()=>{if(!$('chart-font-size').checkValidity() || !$('chart-font-size').value){renderAppearance();return;}chartStyle(a=>{a.fontSize=Number($('chart-font-size').value);});};
$('chart-color').onchange=()=>chartStyle(a=>{a.color=$('chart-color').value;});
$('chart-natural').onclick=()=>chartStyle(a=>{a.color=null;},'Natural colors restored. Individual furniture colors are kept.');
$('chart-reset').onclick=()=>change(()=>{chart().appearance=defaultAppearance();chart().items.forEach(it=>delete it.color);},'Chart fonts and colors reset. Room arrangement and students are kept.');
$('item-color').onchange=()=>{const it=selected();if(it)change(()=>{it.color=$('item-color').value;});};
$('item-color-reset').onclick=()=>{const it=selected();if(it)change(()=>{delete it.color;});};
function renderRoom() {
  const room = $('room');
  const previous=new Map([...room.children].map(node=>[node.dataset.id,{x:parseFloat(node.style.left),y:parseFloat(node.style.top),width:parseFloat(node.style.width),height:parseFloat(node.style.height),rotation:Number(node.dataset.rotation||0),active:node.classList.contains('dragging')||node.classList.contains('resizing')} ]));
  room.replaceChildren();
  room.style.fontFamily=fontCSS(appearance().font);
  room.style.setProperty('--chart-font-size',`${appearance().fontSize}px`);
  void loadFont(appearance().font).catch(error=>say(error.message));
  for(const it of chart().items) {
    const node = element('div',`item ${it.type}${selection?.id === it.id ? ' selected' : ''}`);
    node.dataset.id = it.id;node.dataset.rotation=it.rotation;node.tabIndex = 0;node.setAttribute('aria-label',`${it.label}. Drag to move, or use arrow keys.`);
    Object.assign(node.style,{left:`${it.x}px`,top:`${it.y}px`,width:`${it.width}px`,height:`${it.height}px`,transform:`rotate(${it.rotation}deg)`});
    const color=it.color || appearance().color;
    if(color) {node.style.background=color;const rgb=color.slice(1).match(/../g).map(c=>parseInt(c,16));node.style.color=rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#172c3e':'#ffffff';}
    node.append(element('span','item-caption',it.label));
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
          text.style.width = `${Math.max(0,(sideways ? height : width)-6)}px`;
          text.style.maxHeight = `${Math.max(0,(sideways ? width : height)-4)}px`;
          observer.disconnect();
        }).observe(btn);
        btn.setAttribute('aria-label',`${it.label}, seat ${i+1}: ${student?.name || 'unassigned'}${s.locked ? ', locked during shuffle' : ''}`);
        btn.onclick = e => {e.stopPropagation();selection = {id:it.id,seat:i};renderRoom();renderInspector();$('assignment').focus();};
        grid.append(btn);
      });node.append(grid);
    }
    const resize=element('button','resize-handle','↘');resize.setAttribute('aria-label',`Resize ${it.label}`);resize.title='Drag to resize; use Width and Depth for exact sizes';
    resize.onpointerdown=e=>{
      if(e.button!==0) return;e.preventDefault();e.stopPropagation();selection={id:it.id,seat:null};renderInspector();
      const start={x:e.clientX,y:e.clientY,w:it.width,h:it.height};let moved=false;resize.setPointerCapture(e.pointerId);
      const move=ev=>{
        const dx=(ev.clientX-start.x)/zoom,dy=(ev.clientY-start.y)/zoom;if(!moved&&Math.hypot(dx,dy)<3)return;
        if(!moved){checkpoint();moved=true;node.classList.add('resizing');}
        const angle=it.rotation*Math.PI/180,step=1;
        it.width=Math.max(40,Math.min(400,Math.round((start.w+dx*Math.cos(angle)+dy*Math.sin(angle))/step)*step));
        it.height=Math.max(30,Math.min(300,Math.round((start.h-dx*Math.sin(angle)+dy*Math.cos(angle))/step)*step));constrain(it);
        Object.assign(node.style,{width:`${it.width}px`,height:`${it.height}px`,left:`${it.x}px`,top:`${it.y}px`});
      };
      const end=()=>{resize.removeEventListener('pointermove',move);resize.removeEventListener('pointerup',end);resize.removeEventListener('pointercancel',end);if(moved){if($('snap').checked){it.width=Math.max(40,Math.min(400,Math.round(it.width/10)*10));it.height=Math.max(30,Math.min(300,Math.round(it.height/10)*10));constrain(it);}save();render();}};
      resize.addEventListener('pointermove',move);resize.addEventListener('pointerup',end);resize.addEventListener('pointercancel',end);
    };node.append(resize);
    node.addEventListener('pointerdown', e => {
      if(e.button !== 0 || e.target.closest('button')) return;
      selection = {id:it.id,seat:null};
      room.querySelectorAll('.selected').forEach(n => n.classList.remove('selected'));node.classList.add('selected');renderInspector();
      const start = {x:e.clientX,y:e.clientY,ix:it.x,iy:it.y};let moved = false;
      node.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = (ev.clientX-start.x)/zoom, dy = (ev.clientY-start.y)/zoom;
        if(!moved && Math.hypot(dx,dy)<3) return;
        if(!moved) {checkpoint();moved = true;node.classList.add('dragging');}
        const step = 1;
        it.x = Math.round((start.ix+dx)/step)*step;it.y = Math.round((start.iy+dy)/step)*step;constrain(it);
        node.style.left = `${it.x}px`;node.style.top = `${it.y}px`;
      };
      const end = () => {node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',end);node.removeEventListener('pointercancel',end);if(moved) {if($('snap').checked){it.x=Math.round(it.x/20)*20;it.y=Math.round(it.y/20)*20;constrain(it);}save();render();}};
      node.addEventListener('pointermove',move);node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);
    });
    node.addEventListener('keydown',e => {
      if(e.target !== node) return;
      if(e.key === 'Enter' || e.key === ' ') {e.preventDefault();selection = {id:it.id,seat:it.seats.length ? 0 : null};renderRoom();renderInspector();(it.seats.length ? $('assignment') : $('item-label')).focus();return;}
      const delta = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(!delta) return;e.preventDefault();
      change(() => {selection = {id:it.id,seat:null};it.x += delta[0]*(e.shiftKey?1:20);it.y += delta[1]*(e.shiftKey?1:20);constrain(it);});
      [...room.children].find(n => n.dataset.id === it.id)?.focus();
    });room.append(node);
    const prior=previous.get(it.id);
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      if(prior && (prior.x!==it.x||prior.y!==it.y||prior.width!==it.width||prior.height!==it.height||prior.rotation!==it.rotation)) node.animate([{transform:`translate(${prior.x-it.x}px,${prior.y-it.y}px) rotate(${prior.rotation}deg)`,width:`${prior.width}px`,height:`${prior.height}px`},{transform:`rotate(${prior.rotation+((it.rotation-prior.rotation+540)%360-180)}deg)`,width:`${it.width}px`,height:`${it.height}px`}],{duration:180,easing:'cubic-bezier(.22,1,.36,1)'});
      else if(!prior)node.animate([{opacity:0},{opacity:1}],{duration:160});
      if(prior?.active)node.classList.add('settling');
    }
  }
  room.style.zoom = zoom;
}
function renderInspector() {
  const it = selected();$('item-controls').hidden = !it;$('seat-controls').hidden = !it || selection.seat === null;
  $('selection-title').textContent = it ? catalog[it.type].label : 'Fine-tune your room';$('selection-hint').hidden = !!it;
  if(!it) return;
  for(const field of ['label','width','height','x','y']) $('item-'+field).value = it[field];
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
$('room').onclick = e => {if(e.target === $('room')) {selection=null;renderRoom();renderInspector();}};
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
$('undo').onclick = () => {if(!history.length) return;state=JSON.parse(history.pop());selection=null;save();render();say('Previous change restored.');};
for(const field of ['label','width','height','x','y']) $('item-'+field).onchange = () => {
  const it=selected();if(!it) return;const input=$('item-'+field);
  if(field !== 'label' && !input.checkValidity()) {renderInspector();return;}
  change(() => {it[field] = field==='label' ? input.value.trim() || catalog[it.type].label : Number(input.value);constrain(it);});
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
  zoom = $('zoom').value === 'fit' ? Math.min(1, ($('room').parentElement.clientWidth-40)/960) : Number($('zoom').value);
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
