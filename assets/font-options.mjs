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
export function loadFont(font) {
  validateFont(font);
  if(font.source!=='google') return Promise.resolve();
  if(loaded.has(font.family)) return loaded.get(font.family);
  const promise=new Promise((resolve,reject)=>{
    const link=document.createElement('link');link.rel='stylesheet';
    const url=new URL('https://fonts.googleapis.com/css2');url.searchParams.set('family',font.family);url.searchParams.set('display','swap');link.href=url.href;
    const timer=setTimeout(()=>{link.remove();loaded.delete(font.family);reject(new Error('Font download timed out. Using the system fallback.'));},10000);
    link.onload=()=>{clearTimeout(timer);resolve();};link.onerror=()=>{clearTimeout(timer);link.remove();loaded.delete(font.family);reject(new Error('Google Font unavailable. Check the family name or your connection.'));};document.head.append(link);
  });loaded.set(font.family,promise);return promise;
}
