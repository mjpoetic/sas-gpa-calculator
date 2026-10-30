export const fontOptions={system:{label:'System sans',css:'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'},serif:{label:'Classic serif',css:'Georgia, "Times New Roman", serif'},rounded:{label:'Rounded',css:'"Trebuchet MS", sans-serif'},mono:{label:'Monospace',css:'ui-monospace, "Courier New", monospace'}};
export const fontSuggestions={google:['Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Nunito','Lexend','Atkinson Hyperlegible','Comic Neue','Lora','Merriweather','Source Sans 3','Architects Daughter'],local:['Arial','Helvetica','Verdana','Georgia','Times New Roman','Trebuchet MS','Comic Sans MS','Courier New','Aptos','Segoe UI','SF Pro Text']};
export function suggestFonts(input,source,id) {
  let list=document.getElementById(id);if(!list){list=document.createElement('datalist');list.id=id;input.after(list);input.setAttribute('list',id);}
  list.replaceChildren(...(fontSuggestions[source]||[]).map(family=>{const o=document.createElement('option');o.value=family;return o;}));
}
export function validateFont(font) {
  if(!font || !['preset','google','local'].includes(font.source) || typeof font.family!=='string') throw new Error('Invalid font setting.');
  if(font.source==='preset' ? !Object.hasOwn(fontOptions,font.family) : !/^[\p{L}\p{N}][\p{L}\p{N} ._-]{0,79}$/u.test(font.family)) throw new Error('Use a font family name up to 80 characters.');
  return {source:font.source,family:font.family};
}
export function fontCSS(font) {return font.source==='preset' ? fontOptions[font.family].css : `"${font.family}", ${fontOptions.system.css}`;}
const loaded=new Map();
export function loadFont(font,weight=400) {
  validateFont(font);
  if(font.source!=='google') return Promise.resolve();
  const key=font.family+weight;if(loaded.has(key)) return loaded.get(key);
  const promise=new Promise((resolve,reject)=>{
    const link=document.createElement('link');link.rel='stylesheet';
    const url=new URL('https://fonts.googleapis.com/css2');url.searchParams.set('family',font.family+':wght@'+weight);url.searchParams.set('display','swap');link.href=url.href;
    const timer=setTimeout(()=>{link.remove();loaded.delete(key);reject(new Error('Font download timed out. Using the system fallback.'));},10000);
    link.onload=async()=>{try{const faces=await document.fonts.load(`${weight} 16px "${font.family}"`);if(!faces.length)throw Error('Font unavailable');clearTimeout(timer);resolve();}catch{clearTimeout(timer);link.remove();loaded.delete(key);reject(new Error('Font could not be loaded. Check the name, weight, or connection.'));}};link.onerror=()=>{clearTimeout(timer);link.remove();loaded.delete(key);reject(new Error('This Google Font weight is unavailable. Try Regular or another weight, and check the family name or connection.'));};document.head.append(link);
  });loaded.set(key,promise);return promise;
}

export const fontWeights={100:'Thin',200:'Extra light',300:'Light',400:'Regular',500:'Medium',600:'Semibold',700:'Bold',800:'Extra bold',900:'Heavy'};
export function validateWeight(value){if(!Object.hasOwn(fontWeights,value))throw new Error('Invalid font weight.');return Number(value);}

export function autoFontField({input,source,weight,status,apply}) {
 let sequence=0,timer;
 const show=(text,color)=>{status.textContent=text;status.style.color=color||'';const available=text.startsWith('✓'),unavailable=text.startsWith('×');input.setAttribute('aria-invalid',String(unavailable));input.style.borderColor=available||unavailable?color:'';input.style.boxShadow=available||unavailable?`0 0 0 1px ${color}`:'';input.style.backgroundColor=available?'rgba(22,163,74,0.10)':unavailable?'rgba(220,38,38,0.10)':'';};
 const check=()=>{const current=++sequence;clearTimeout(timer);if(source.value==='preset'||!input.value.trim()){show('');return;}show('… Checking font');timer=setTimeout(async()=>{try{const font=validateFont({source:source.value,family:input.value.trim()});await loadFont(font,Number(weight?.value||400));if(current!==sequence)return;apply(font);show('✓ Font available and applied','#15803d');}catch(e){if(current===sequence)show('× '+e.message,'#dc2626');}},500);};
 input.addEventListener('input',check);source.addEventListener('change',check);weight?.addEventListener('change',check);input.form?.addEventListener('submit',e=>{e.preventDefault();check();});return check;
}
