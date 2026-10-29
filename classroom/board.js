import {BOARD_COLORS,NOTE_COLORS,newNote} from './board-model.mjs?v=20261029-release1';
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn)=>{const n=make('button','',text);n.type='button';n.onclick=fn;return n;};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Notes are plain text with a small formatting vocabulary; never render saved HTML.
function inline(host,text){text.split(/(\*\*[^*]+\*\*)/g).forEach(part=>host.append(part.startsWith('**')&&part.endsWith('**')?make('strong','',part.slice(2,-2)):document.createTextNode(part)));}
export function setupBoard({getChart,commit,uid}){
 let view='room',presenting=false,scale=1,selected=null,editing=null,editorChart=null;
 const board=()=>getChart().board||{color:BOARD_COLORS[0],notes:[]};
 const mutate=fn=>commit(()=>{getChart().board??={color:BOARD_COLORS[0],notes:[]};fn(getChart().board);});
 const room=document.querySelector('main > .workspace')||document.querySelector('.workspace');
 const modes=make('div','studio-modes');modes.setAttribute('role','group');modes.setAttribute('aria-label','Studio view');
 const roomButton=button('Room',()=>switchView('room')),boardButton=button('Board',()=>switchView('board'));modes.append(roomButton,boardButton);document.querySelector('.header').after(modes);
 const host=make('section','studio-board');host.hidden=true;host.setAttribute('aria-label','Classroom board');
 const bar=make('div','board-toolbar'),title=make('div','board-heading');title.append(make('strong','','Classroom board'),make('span','','Notes and teaching tools, together.'));
 const tools=button('+ Add tool',()=>toolDialog.showModal());tools.id='board-add-tool';
 const manage=button('Notes',()=>{renderList();listDialog.showModal();});manage.id='board-notes';
 const bg=make('select');bg.setAttribute('aria-label','Board background');BOARD_COLORS.forEach((color,i)=>{const o=make('option','',['Mist','Sky','Midnight','Sand','Sage'][i]);o.value=color;bg.append(o);});bg.onchange=()=>mutate(b=>b.color=bg.value);
 const undo=button('Undo',()=>document.getElementById('undo').click()),redo=button('Redo',()=>document.getElementById('redo').click());undo.setAttribute('aria-label','Undo board edit');redo.setAttribute('aria-label','Redo board edit');
 const saved=make('span','board-save');saved.setAttribute('role','status');title.append(saved);const saveState=document.getElementById('save-state');const syncSave=()=>{saved.textContent=saveState.textContent;};new MutationObserver(syncSave).observe(saveState,{childList:true,subtree:true});syncSave();
 const present=button('Present',()=>setPresent(true));present.id='board-present';bar.append(title,undo,redo,tools,manage,bg,present);
 const viewport=make('div','board-viewport'),canvas=make('div','board-canvas');canvas.setAttribute('aria-label','Notes canvas');viewport.append(canvas);
 const empty=make('div','board-empty');empty.append(make('span','board-empty-icon','Aa'),make('h2','','Make space for today'),make('p','','Add instructions, a morning message, or a checklist. Your board saves with this classroom.'),button('+ Add your first note',()=>addNote()));
 const exit=button('Exit presentation',()=>setPresent(false));exit.className='board-exit';
 host.append(bar,viewport,exit);room.after(host);
 function dialog(name){const d=make('dialog','workspace-dialog board-dialog');d.setAttribute('aria-label',name);const h=make('form');h.method='dialog';h.append(make('h2','',name),button('×',()=>d.close()));h.lastChild.setAttribute('aria-label','Close '+name);d.append(h);document.body.append(d);return d;}
 const toolDialog=dialog('Add a tool');const noteTool=button('Aa  Note',()=>{toolDialog.close();addNote();});noteTool.className='board-note-tool';toolDialog.append(noteTool,make('p','hint','Instructions, agendas, and checklists. Noise meter and brain breaks will join this workspace later.'));
 const listDialog=dialog('Board notes'),list=make('div','board-note-list');listDialog.append(list);
 const editor=dialog('Edit note'),fields=make('div','board-editor-fields');
 function field(label,input){const l=make('label','',label);l.append(input);fields.append(l);return input;}
 const titleInput=field('Title (optional)',make('input'));titleInput.maxLength=120;
 const format=make('div','board-format');format.setAttribute('role','group');format.setAttribute('aria-label','Text formatting');
 const textInput=make('textarea');textInput.setAttribute('aria-label','Note text');textInput.rows=7;textInput.maxLength=12000;textInput.placeholder='What should your class know?';
 const textLabel=make('label','','Note text');textLabel.append(format,textInput);fields.append(textLabel);
 function patch(values){if(!editing||getChart().id!==editorChart)return;mutate(b=>{const n=b.notes.find(n=>n.id===editing);if(n)Object.assign(n,values);});}
 titleInput.oninput=()=>patch({title:titleInput.value});textInput.oninput=()=>patch({text:textInput.value});
 function formatText(kind){const a=textInput.selectionStart,z=textInput.selectionEnd,value=textInput.value;let replacement,start=a,end=z;
  if(kind==='bold'){replacement='**'+(value.slice(a,z)||'bold text')+'**';}
  else {start=value.lastIndexOf('\n',a-1)+1;const next=value.indexOf('\n',z);end=next<0?value.length:next;replacement=value.slice(start,end).split('\n').map((line,i)=>({bullet:'- ',number:(i+1)+'. ',check:'- [ ] '}[kind])+line.replace(/^(?:- \[[ x]\] |[-*] |\d+\. )/, '')).join('\n');}
  if(value.length-(end-start)+replacement.length>12000)return;
  textInput.setRangeText(replacement,start,end,'select');textInput.dispatchEvent(new Event('input'));textInput.focus();
 }
 for(const [label,kind] of [['Bold','bold'],['Bullets','bullet'],['Numbers','number'],['Checklist','check']])format.append(button(label,()=>formatText(kind)));
 const settings=make('div','board-note-settings');fields.append(settings);
 function setting(label,input){const l=make('label','',label);l.append(input);settings.append(l);return input;}
 const color=setting('Note color',make('select'));NOTE_COLORS.forEach((c,i)=>{const o=make('option','',['Butter','White','Blue','Green','Rose','Lavender'][i]);o.value=c;color.append(o);});color.onchange=()=>patch({color:color.value});
 const ink=setting('Text color',make('input'));ink.type='color';ink.onchange=ink.oninput=()=>patch({ink:ink.value});
 const size=setting('Text size',make('select'));[16,20,24,28,32,40,48,64].forEach(v=>{const o=make('option','',v+' px');o.value=v;size.append(o);});size.onchange=()=>patch({fontSize:Number(size.value)});
 const align=setting('Alignment',make('select'));['left','center','right'].forEach(v=>{const o=make('option','',v[0].toUpperCase()+v.slice(1));o.value=v;align.append(o);});align.onchange=()=>patch({align:align.value});
 const width=setting('Width',make('input')),height=setting('Height',make('input'));for(const [input,key,min,max] of [[width,'width',220,1200],[height,'height',140,800]]){input.type='number';input.min=min;input.max=max;input.step=10;input.onchange=()=>{if(!input.checkValidity())return;const n=board().notes.find(n=>n.id===editing);if(n){const value=Number(input.value);patch({[key]:value,[key==='width'?'x':'y']:Math.min(n[key==='width'?'x':'y'],(key==='width'?1600:900)-value)});}};}
 const actions=make('div','board-editor-actions');actions.append(button('Duplicate',()=>{const n=board().notes.find(n=>n.id===editing);if(n&&board().notes.length<100){const copy={...n,id:uid(),title:n.title? n.title.slice(0,113)+' (copy)':'',x:Math.min(1600-n.width,n.x+30),y:Math.min(900-n.height,n.y+30),locked:false,hidden:false};mutate(b=>b.notes.push(copy));openEditor(copy.id);}}),button('Hide note',()=>{patch({hidden:true});editor.close();}),button('Delete note',()=>{mutate(b=>b.notes=b.notes.filter(n=>n.id!==editing));editor.close();}),button('Done',()=>editor.close()));
 editor.append(fields,make('p','hint','Changes save automatically. Drag a note’s top bar to move it; use its corner to resize. Arrow keys move a focused handle; Shift + arrow makes a smaller adjustment.'),actions);
 editor.addEventListener('close',()=>{editing=null;selected=null;render();});
 function openEditor(id){const n=board().notes.find(n=>n.id===id);if(!n)return;editing=selected=id;editorChart=getChart().id;titleInput.value=n.title;textInput.value=n.text;color.value=n.color;ink.value=n.ink;size.value=n.fontSize;align.value=n.align;width.value=n.width;height.value=n.height;if(!editor.open)editor.showModal();render();titleInput.focus();}
 function addNote(){if(board().notes.length>=100)return;const n=newNote(uid(),board().notes.length);mutate(b=>b.notes.push(n));openEditor(n.id);}
 function renderList(){list.replaceChildren();if(!board().notes.length)list.append(make('p','hint','No notes yet. Add a note to get started.'));for(const n of board().notes){const row=make('div','board-note-row');row.append(make('span','',n.title||n.text.slice(0,45)||'Untitled note'),button(n.hidden?'Show':'Hide',()=>{mutate(b=>b.notes.find(x=>x.id===n.id).hidden=!n.hidden);renderList();}),button(n.locked?'Unlock':'Lock',()=>{mutate(b=>b.notes.find(x=>x.id===n.id).locked=!n.locked);renderList();}),button('Edit',()=>{listDialog.close();openEditor(n.id);}));list.append(row);}}
 function switchView(next){view=next;document.body.dataset.studioView=view;room.hidden=view!=='room';host.hidden=view!=='board';roomButton.setAttribute('aria-pressed',String(view==='room'));boardButton.setAttribute('aria-pressed',String(view==='board'));if(view==='board'){render();requestAnimationFrame(fit);}else document.dispatchEvent(new Event('sas-workspace-resize'));}
 function setPresent(value){presenting=value;document.body.classList.toggle('board-presenting',value);if(value)document.activeElement?.blur();render();requestAnimationFrame(fit);if(!value)present.focus();else exit.focus();}
 document.addEventListener('keydown',e=>{if(presenting&&e.key==='Escape'){e.preventDefault();setPresent(false);}});
 // Keep room editing shortcuts from affecting furniture while working on a board.
 host.addEventListener('keydown',e=>{if(presenting&&e.key==='Escape'){e.preventDefault();setPresent(false);}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z')return;e.stopPropagation();});
 exit.addEventListener('keydown',e=>{if(e.key==='Escape')setPresent(false);});
 function fit(){if(host.hidden)return;scale=Math.max(.12,Math.min(viewport.clientWidth/1600,viewport.clientHeight/900));canvas.style.transform=`scale(${scale})`;canvas.style.left=Math.max(0,(viewport.clientWidth-1600*scale)/2)+'px';canvas.style.top=Math.max(0,(viewport.clientHeight-900*scale)/2)+'px';}
 new ResizeObserver(fit).observe(viewport);
 function geometry(n,key,dx,dy){if(key==='move')return {x:clamp(n.x+dx,0,1600-n.width),y:clamp(n.y+dy,0,900-n.height)};return {width:clamp(n.width+dx,220,Math.min(1200,1600-n.x)),height:clamp(n.height+dy,140,Math.min(800,900-n.y))};}
 function gesture(handle,n,node,key){handle.onpointerdown=e=>{if(n.locked||presenting||e.button!==0)return;e.preventDefault();const x=e.clientX,y=e.clientY;let values;handle.setPointerCapture(e.pointerId);const move=ev=>{values=geometry(n,key,(ev.clientX-x)/scale,(ev.clientY-y)/scale);for(const [k,v] of Object.entries(values))node.style[{x:'left',y:'top'}[k]||k]=v+'px';};const end=ev=>{handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',end);handle.removeEventListener('pointercancel',end);if(values&&ev.type!=='pointercancel')mutate(b=>Object.assign(b.notes.find(x=>x.id===n.id),values));else render();};handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);};handle.onkeydown=e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d||n.locked)return;e.preventDefault();const step=e.shiftKey?1:10;mutate(b=>Object.assign(b.notes.find(x=>x.id===n.id),geometry(n,key,d[0]*step,d[1]*step)));canvas.querySelector(`[data-note-id="${n.id}"] .note-${key}`)?.focus();};}
 function render(){undo.disabled=document.getElementById('undo').disabled;redo.disabled=document.getElementById('redo').disabled;if(editor.open&&editorChart!==getChart().id)editor.close();bg.value=board().color;canvas.style.background=board().color;canvas.replaceChildren();const visible=board().notes.filter(n=>!n.hidden);if(!visible.length){canvas.append(empty);empty.hidden=presenting;}
 for(const n of visible){const node=make('article','board-note');node.dataset.noteId=n.id;node.setAttribute('aria-label',n.title||'Classroom note');Object.assign(node.style,{left:n.x+'px',top:n.y+'px',width:n.width+'px',height:n.height+'px',background:n.color,color:n.ink,fontSize:n.fontSize+'px',textAlign:n.align});
  const top=make('div','note-top');const mover=button(n.locked?'Locked':'⠿ Move',()=>{});mover.className='note-move';mover.setAttribute('aria-label','Move '+(n.title||'note'));mover.disabled=n.locked;gesture(mover,n,node,'move');
  const edit=button('Edit',()=>openEditor(n.id));const lock=button(n.locked?'Unlock':'Lock',()=>mutate(b=>b.notes.find(x=>x.id===n.id).locked=!n.locked));top.append(mover,edit,lock);
  const content=make('div','note-content');if(n.title)content.append(make('h2','',n.title));if(!n.title&&!n.text&&!presenting)content.append(make('p','note-placeholder','Click Edit to write a note…'));
  n.text.split('\n').forEach((line,i)=>{const row=make('div','note-line');const check=line.match(/^- \[([ x])\] (.*)$/);if(check){row.classList.add('note-check');const box=make('input');box.type='checkbox';box.checked=check[1]==='x';box.setAttribute('aria-label',check[2]||'Checklist item');box.onchange=()=>mutate(b=>{const note=b.notes.find(x=>x.id===n.id),lines=note.text.split('\n');lines[i]='- ['+(box.checked?'x':' ')+'] '+check[2];note.text=lines.join('\n');});row.append(box);const label=make('span');inline(label,check[2]);row.append(label);if(box.checked)row.classList.add('checked');}else {const bullet=line.match(/^[-*] (.*)$/),number=line.match(/^(\d+\. )(.+)$/);if(bullet){row.classList.add('note-bullet');inline(row,bullet[1]);}else if(number){row.append(document.createTextNode(number[1]));inline(row,number[2]);}else inline(row,line||'\u00a0');}content.append(row);});
  const resize=button('↘',()=>{});resize.className='note-resize';resize.setAttribute('aria-label','Resize '+(n.title||'note'));resize.disabled=n.locked;gesture(resize,n,node,'resize');node.append(top,content,resize);node.ondblclick=e=>{if(!presenting&&!e.target.closest('button,input'))openEditor(n.id);};canvas.append(node);
 }fit();}
 switchView('room');return {render};
}
