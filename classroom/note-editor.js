import {fontCSS,loadFont,validateFont,fontOptions,suggestFonts} from '../assets/font-options.mjs?v=20261030-release12';
import {validateRich,richTags} from './note-rich.mjs?v=20261030-release12';
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
const hex=color=>{const values=color?.match(/\d+/g);return values&&values.length>=3?'#'+values.slice(0,3).map(x=>Number(x).toString(16).padStart(2,'0')).join(''): /^#[\da-f]{6}$/i.test(color||'')?color:undefined;};
export function readRich(host,fontSource='local'){
 function read(node){if(node.nodeType===3)return {text:node.textContent};if(node.nodeType!==1)return null;if(node.dataset.noteCheck!==undefined||node.classList.contains('note-check')){const box=node.querySelector('input[type=checkbox]'),text=node.querySelector('.rich-check-text,span');return {tag:'check',checked:!!box?.checked,children:[...(text||node).childNodes].filter(n=>n!==box).map(read).filter(Boolean)};}const tag=node.tagName.toLowerCase();if(['script','style','iframe','object','img','svg'].includes(tag))return null;const children=[...node.childNodes].map(read).filter(Boolean);const result={tag:richTags.has(tag)?tag:'span',children},style={};
  const family=(node.getAttribute('face')||node.style.fontFamily||'').replaceAll('"','').replaceAll("'",'').split(',')[0].trim();if(family)try{style.font=validateFont({source:node.dataset.fontSource||fontSource,family:node.dataset.fontKey||family});}catch{}
  const color=hex(node.getAttribute('color')||node.style.color);if(color)style.color=color;
  const size=node.style.fontSize;if(size&&size.endsWith('px'))style.size=Math.max(8,Math.min(96,parseFloat(size)));
  if(['left','center','right'].includes(node.style.textAlign))style.align=node.style.textAlign;
  if(node.style.fontWeight)style.bold=!['normal','400'].includes(node.style.fontWeight);if(node.style.fontStyle)style.italic=node.style.fontStyle==='italic';if(node.style.textDecoration)style.underline=node.style.textDecoration.includes('underline');
  if(Object.keys(style).length)result.style=style;return result;
 }
 return validateRich([...host.childNodes].map(read).filter(Boolean));
}
export function paintRich(host,nodes,onError=()=>{},onChange=()=>{}){for(const n of nodes){if(Object.hasOwn(n,'text')){host.append(document.createTextNode(n.text));continue;}if(n.tag==='check'){const row=el('div'),box=el('input'),text=el('span');row.className='note-check';row.classList.toggle('checked',n.checked);row.dataset.noteCheck='';text.className='rich-check-text';box.type='checkbox';box.checked=n.checked;box.contentEditable='false';box.setAttribute('aria-label','Checklist item');box.onchange=onChange;row.append(box,text);paintRich(text,n.children,onError,onChange);host.append(row);continue;}const node=el(n.tag),s=n.style||{};if(s.font){node.dataset.fontSource=s.font.source;if(s.font.source==='preset')node.dataset.fontKey=s.font.family;node.style.fontFamily=fontCSS(s.font);void loadFont(s.font).catch(onError);}if(s.size)node.style.fontSize=s.size+'px';if(s.color)node.style.color=s.color;if(s.align)node.style.textAlign=s.align;if(s.bold!==undefined)node.style.fontWeight=s.bold?'700':'400';if(s.italic!==undefined)node.style.fontStyle=s.italic?'italic':'normal';if(s.underline!==undefined)node.style.textDecoration=s.underline?'underline':'none';paintRich(node,n.children,onError,onChange);host.append(node);}}
export function inlineNoteToolbar({host,getNote,patch,finish}){
 const toolbar=el('div');toolbar.className='note-inline-toolbar note-floating-toolbar';toolbar.setAttribute('aria-label','Note formatting');toolbar.setAttribute('role','toolbar');toolbar.hidden=true;
 const mini=el('div');mini.className='note-mini-bar';mini.setAttribute('role','group');mini.setAttribute('aria-label','Quick text formatting');
 const extra=el('div');extra.className='note-extra-tools';extra.id='note-extra-tools';extra.hidden=true;
 const context=el('span','Body');context.className='note-format-context';mini.append(context);
 const status=el('span');status.className='note-font-status';status.role='status';
 let body=null,title=null,content=null,range=null,source='preset',sourceForRuns='local',fontRequest=0,pendingSize=null;
 let anchor=null,positionFrame=0;
 const knownFonts=new Map(),toggles=[];const faceKey=value=>(value||'').replace(/["']/g,'').replace(/\s+/g,' ').trim().toLowerCase();
 function refresh(input){const trigger=input.closest('.site-select')?.querySelector('.site-select-trigger');if(trigger)trigger.textContent=input.selectedOptions[0]?.textContent||'Mixed';}
 function btn(parent,text,label,fn){const b=el('button',text);b.type='button';b.dataset.glyphDone='true';b.setAttribute('aria-label',label);b.title=label;b.onpointerdown=e=>e.preventDefault();b.onclick=fn;parent.append(b);return b;}
 function select(parent,label,values,fn){const l=el('label',label),input=el('select');input.setAttribute('aria-label',label);for(const [value,text]of values){const o=el('option',text);o.value=value;input.append(o);}input.onchange=()=>fn(input.value);l.append(input);parent.append(l);return input;}
 function tagFonts(){for(const root of [body,title].filter(Boolean))for(const node of root.querySelectorAll('font')){const font=knownFonts.get(faceKey(node.getAttribute('face')));if(font){node.dataset.fontSource=font.source;if(font.source==='preset')node.dataset.fontKey=font.family;}if(node.getAttribute('size')==='7'&&pendingSize){node.removeAttribute('size');node.style.fontSize=pendingSize+'px';}}}
 function save(){if(!body)return;try{tagFonts();const values={rich:readRich(body,sourceForRuns),text:body.innerText.slice(0,12000)};if(title){const rich=readRich(title,sourceForRuns);values.titleRich=validateRich(rich,120);values.title=title.innerText.replace(/\n/g,' ').slice(0,120);}patch(values);status.textContent='';}catch(error){status.textContent=error.message;}}
 function restore(){content?.focus({preventScroll:true});if(range&&content?.contains(range.commonAncestorContainer)){const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}}
 function capture(){const selection=getSelection();if(!selection?.rangeCount)return;const root=[title,body].find(n=>n?.contains(selection.anchorNode)&&n.contains(selection.focusNode));if(!root)return;if(root!==content){content=root;fontRequest++;pendingSize=null;}range=selection.getRangeAt(0).cloneRange();sync();}
 document.addEventListener('selectionchange',capture);
 function command(cmd,value){if(!content)return;restore();document.execCommand(cmd,false,value);tagFonts();capture();save();sync();}
 for(const [text,label,cmd]of[['B','Bold','bold'],['I','Italic','italic'],['U','Underline','underline'],['S','Strikethrough','strikeThrough']]){const b=btn(mini,text,label,()=>command(cmd));b.setAttribute('aria-pressed','false');toggles.push([b,cmd]);}
 const quickFonts=[...Object.entries(fontOptions).map(([key,font])=>['preset:'+key,font.label]),...['Arial','Georgia','Verdana','Comic Sans MS'].map(f=>['local:'+f,f]),...['Lexend','Nunito','Lora','Montserrat','Comic Neue'].map(f=>['google:'+f,f+' · Google'])];
 const quick=select(mini,'Font',quickFonts,value=>{const split=value.indexOf(':');void applyFont({source:value.slice(0,split),family:value.slice(split+1)});});
 const size=select(mini,'Size',[12,16,20,24,28,32,40,48,64,80,96].map(v=>[String(v),String(v)]),v=>{pendingSize=Number(v);command('fontSize','7');});
 const more=btn(mini,'More','More note formatting',()=>{extra.hidden=!extra.hidden;more.setAttribute('aria-expanded',String(!extra.hidden));schedulePosition();});more.setAttribute('aria-expanded','false');more.setAttribute('aria-controls',extra.id);
 btn(mini,'Done','Done',finish);
 const lists=[];for(const [text,label,cmd]of [['• List','Bulleted list','insertUnorderedList'],['1. List','Numbered list','insertOrderedList']])lists.push(btn(extra,text,label,()=>command(cmd)));
 const check=btn(extra,'☐ Checklist','Insert checklist',()=>{if(content===title)return;restore();const selection=getSelection(),row=el('div'),box=el('input'),text=el('span');row.dataset.noteCheck='';row.className='note-check';box.type='checkbox';box.contentEditable='false';box.setAttribute('aria-label','Checklist item');box.onchange=save;text.className='rich-check-text';text.textContent=selection.toString()||'Checklist item';row.append(box,text);if(selection.rangeCount){const r=selection.getRangeAt(0);r.deleteContents();r.insertNode(row);r.selectNodeContents(text);selection.removeAllRanges();selection.addRange(r);range=r.cloneRange();}else content.append(row);save();});lists.push(check);
 const fontSource=select(extra,'Font source',[['preset','Built-in'],['google','Google Fonts'],['local','Device fonts']],v=>{source=v;family.hidden=v==='preset';family.value='';suggestFonts(family,v,'note-font-suggestions');apply.disabled=v==='preset';schedulePosition();});
 const family=el('input');family.placeholder='Font family, e.g. Lexend';family.setAttribute('aria-label','Font family');family.maxLength=80;family.hidden=true;extra.append(family);
 async function applyFont(value){capture();const request=++fontRequest,noteId=getNote()?.id,target=content,saved=range?.cloneRange();try{const font=validateFont(value);status.textContent=font.source==='google'?'Loading font…':'';await loadFont(font);if(request!==fontRequest||getNote()?.id!==noteId||content!==target||!target?.isConnected)return;sourceForRuns=font.source==='preset'?'local':font.source;const face=font.source==='preset'?fontCSS(font):font.family;knownFonts.set(faceKey(face),font);range=saved;command('fontName',face);status.textContent='';}catch(error){if(request===fontRequest)status.textContent=error.message;}}
 const apply=btn(extra,'Apply font','Apply font',()=>void applyFont({source,family:family.value.trim()}));family.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();void applyFont({source,family:family.value.trim()});}};
 const align=select(extra,'Align',[['left','Left'],['center','Center'],['right','Right']],v=>command('justify'+v[0].toUpperCase()+v.slice(1)));
 const color=el('input');color.type='color';color.dataset.simplePalette='true';color.setAttribute('aria-label','Selected text color');color.oninput=()=>command('foreColor',color.value);extra.append(color);
 const background=select(extra,'Note color',[['#fff1bb','Butter'],['#ffffff','White'],['#dceefb','Blue'],['#e1f0de','Green'],['#f8e1e9','Rose'],['#eee4fa','Lavender']],v=>patch({color:v}));
 function sync(){if(!content)return;schedulePosition();context.textContent=content===title?'Title':'Body';for(const b of lists)b.disabled=content===title;for(const [b,cmd]of toggles)b.setAttribute('aria-pressed',String(document.queryCommandState(cmd)));
  let node=range?.startContainer;if(node?.nodeType===3)node=node.parentElement;const element=node&&content.contains(node)?node:content;const styled=element.closest('[data-font-source]');let font=getNote()?.font||{source:'preset',family:'system'};
  if(styled&&content.contains(styled)){const s=styled.dataset.fontSource,f=styled.dataset.fontKey||(styled.getAttribute('face')||styled.style.fontFamily).replaceAll('"','').split(',')[0].trim();try{font=validateFont({source:s,family:f});}catch{}}
  const key=font.source+':'+font.family;if(![...quick.options].some(o=>o.value===key)){const o=el('option',font.family);o.value=key;quick.append(o);}quick.value=key;refresh(quick);
  const pixels=Math.round(parseFloat(getComputedStyle(element).fontSize));if(Number.isFinite(pixels)){if(![...size.options].some(o=>o.value===String(pixels))){const o=el('option',String(pixels));o.value=String(pixels);size.append(o);}size.value=String(pixels);refresh(size);}
 }
 const paths={
  Bold:'M6 4h7a4 4 0 0 1 0 8H6m0-8v16h8a4 4 0 0 0 0-8H6',
  Italic:'M10 4h9M5 20h9M15 4 9 20',
  Underline:'M6 4v7a6 6 0 0 0 12 0V4M4 21h16',
  Strikethrough:'M18 6c-1-2-3-3-6-3-4 0-6 2-6 5 0 2 2 3 6 4m-8 0h16M6 18c2 4 12 4 12-2',
  'Bulleted list':'M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01',
  'Numbered list':'M10 6h11M10 12h11M10 18h11M3 3h1v5M2 8h4M2 12h4l-4 5h4',
  'Insert checklist':'M9 6h12M9 12h12M9 18h12M2 5l2 2 3-4M2 11l2 2 3-4M2 17l2 2 3-4',
  'Align left':'M3 5h18M3 10h12M3 15h18M3 20h12',
  'Align center':'M3 5h18M6 10h12M3 15h18M6 20h12',
  'Align right':'M3 5h18M9 10h12M3 15h18M9 20h12',
  'More note formatting':'M5 12h.01M12 12h.01M19 12h.01',
  Done:'M5 12l4 4L19 6',
  'Apply font':'M4 18 9 5l5 13M6 13h6M15 18l3 3 4-6'
 };
 function glyph(button,label){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width',label==='More note formatting'?'3':['Bold','Italic','Underline'].includes(label)?'2':'1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',paths[label]);svg.append(path);button.replaceChildren(svg);button.classList.add('note-icon-button');}
 // Familiar actions stay in reach; font and size controls form the top row.
 const top=el('div');top.className='note-toolbar-heading';const mark=el('span');mark.className='note-toolbar-mark';mark.textContent='Aa';mark.setAttribute('aria-hidden','true');top.append(mark,context,quick.closest('label'),size.closest('label'),mini.querySelector('[aria-label="Done"]'));
 quick.closest('label').classList.add('note-font-control');size.closest('label').classList.add('note-size-control');
 mini.insertBefore(lists[0],more);mini.insertBefore(lists[1],more);mini.insertBefore(check,more);
 for(const [label,cmd]of [['Align left','justifyLeft'],['Align center','justifyCenter'],['Align right','justifyRight']]){const b=btn(mini,'',label,()=>command(cmd));b.setAttribute('aria-pressed','false');toggles.push([b,cmd]);mini.insertBefore(b,more);}
 const colorLabel=el('label');colorLabel.className='note-text-color';colorLabel.title='Text color';const colorGlyph=el('span','A');colorGlyph.setAttribute('aria-hidden','true');colorLabel.append(colorGlyph,color);color.addEventListener('input',()=>colorLabel.style.setProperty('--selected-text-color',color.value));mini.insertBefore(colorLabel,more);
 for(const b of [...mini.querySelectorAll('button'),...top.querySelectorAll('button'),...extra.querySelectorAll('button')]){const label=b.getAttribute('aria-label');if(paths[label])glyph(b,label);}
 toolbar.append(top,mini,extra,status);host.append(toolbar);
 function position(){positionFrame=0;if(toolbar.hidden||!anchor?.isConnected)return;const viewport=window.visualViewport,ox=viewport?.offsetLeft||0,oy=viewport?.offsetTop||0,vw=viewport?.width||innerWidth,vh=viewport?.height||innerHeight,pad=12;
  toolbar.style.maxWidth=Math.max(240,vw-pad*2)+'px';toolbar.style.maxHeight=Math.max(100,vh-pad*2)+'px';
  const r=anchor.getBoundingClientRect(),w=toolbar.offsetWidth,h=toolbar.offsetHeight,header=document.querySelector('.header')?.getBoundingClientRect(),minY=Math.max(oy+pad,(header?.bottom||0)+8);
  let x=r.left,y=r.top-h-12,placement='above';
  if(vw<700){x=ox+(vw-w)/2;y=oy+vh-h-pad;placement='bottom';}
  else if(y<minY){if(r.right+w+12<=ox+vw-pad){x=r.right+12;y=r.top;placement='right';}else if(r.left-w-12>=ox+pad){x=r.left-w-12;y=r.top;placement='left';}else{y=r.bottom+12;placement='below';}}
  x=Math.max(ox+pad,Math.min(ox+vw-w-pad,x));y=Math.max(oy+pad,Math.min(oy+vh-h-pad,y));toolbar.style.left=Math.round(x)+'px';toolbar.style.top=Math.round(y)+'px';toolbar.dataset.placement=placement;
  // Let the board reserve space for the touch toolbar without moving the page header.
  const reserve=vw<700?h+pad*2:0;if(host.style.getPropertyValue('--note-toolbar-reserve')!==reserve+'px')host.style.setProperty('--note-toolbar-reserve',reserve+'px');
 }
 function schedulePosition(){if(!positionFrame)positionFrame=requestAnimationFrame(position);}
 new ResizeObserver(schedulePosition).observe(toolbar);window.addEventListener('resize',schedulePosition);window.addEventListener('scroll',schedulePosition,true);window.visualViewport?.addEventListener('resize',schedulePosition);window.visualViewport?.addEventListener('scroll',schedulePosition);

 const anchorObserver=new ResizeObserver(schedulePosition);
 return {toolbar,save,reposition:schedulePosition,bind(node,note,titleNode){if(anchor)anchorObserver.unobserve(anchor);anchor=node.closest('.board-note');if(anchor)anchorObserver.observe(anchor);body=node;title=titleNode;content=body;range=null;knownFonts.clear();source=note.font?.source||'preset';sourceForRuns=source==='preset'?'local':source;fontSource.value=source;refresh(fontSource);family.hidden=source==='preset';apply.disabled=source==='preset';family.value=source==='preset'?'':note.font?.family||'';background.value=note.color;refresh(background);color.value=note.ink;colorLabel.style.setProperty('--selected-text-color',note.ink);toolbar.hidden=false;extra.hidden=true;more.setAttribute('aria-expanded','false');status.textContent='';for(const root of [body,title].filter(Boolean))root.onfocus=()=>{if(content!==root){content=root;range=null;fontRequest++;pendingSize=null;}context.textContent=root===title?'Title':'Body';for(const b of lists)b.disabled=root===title;};for(const root of [body,title].filter(Boolean))root.onkeyup=capture;if(source!=='preset')suggestFonts(family,source,'note-font-suggestions');sync();},close(){toolbar.hidden=true;if(anchor)anchorObserver.unobserve(anchor);anchor=null;host.style.removeProperty('--note-toolbar-reserve');body=title=content=null;range=null;pendingSize=null;fontRequest++;}};
}
