// Open sections by default; only an explicit summary activation changes the preference.
const storageKey='sas-disclosure-preferences-v1';let preferences={};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))preferences=saved;}catch{}
const initialized=new WeakSet();
function key(section){const summary=section.querySelector(':scope > summary');return location.pathname+'|'+(section.id||section.closest('dialog')?.id||'page')+'|'+(summary?.textContent.trim()||'section');}
function initialize(){for(const section of document.querySelectorAll('details')){if(initialized.has(section))continue;initialized.add(section);section.open=preferences[key(section)]!==false;}}
initialize();new MutationObserver(initialize).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',event=>{const summary=event.target.closest('summary');if(!summary||summary.parentElement.tagName!=='DETAILS'||event.defaultPrevented)return;const section=summary.parentElement;preferences[key(section)]=!section.open;try{localStorage.setItem(storageKey,JSON.stringify(preferences));}catch{}});
