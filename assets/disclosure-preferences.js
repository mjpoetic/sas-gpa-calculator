// Open sections by default; only an explicit summary activation changes the preference.
const storageKey='sas-disclosure-preferences-v1';let preferences={};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))preferences=saved;}catch{}
const initialized=new WeakSet();
function key(section){const summary=section.querySelector(':scope > summary');return location.pathname+'|'+(section.id||section.closest('dialog')?.id||'page')+'|'+(summary?.textContent.trim()||'section');}
function initialize(){for(const section of document.querySelectorAll('details')){if(initialized.has(section))continue;initialized.add(section);section.open=!section.hasAttribute('data-disclosure-transient')&&Object.hasOwn(preferences,key(section))?preferences[key(section)]:!section.hasAttribute('data-default-collapsed');}}
initialize();new MutationObserver(initialize).observe(document.body,{childList:true,subtree:true});
const motions=new WeakMap();
function toggleSection(section){
 const previous=motions.get(section),expand=previous?!previous.expand:!section.open,from=section.getBoundingClientRect().height;
 previous?.motion.cancel();
 const overflow=previous?.overflow??section.style.overflow,boxSizing=previous?.boxSizing??section.style.boxSizing;
 section.style.overflow=overflow;section.style.boxSizing=boxSizing;section.open=expand;
 const to=section.getBoundingClientRect().height;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){motions.delete(section);return expand;}
 section.open=true;section.style.overflow='hidden';section.style.boxSizing='border-box';
 const motion=section.animate([{height:from+'px'},{height:to+'px'}],{duration:240,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}),state={motion,expand,overflow,boxSizing};motions.set(section,state);
 motion.finished.then(()=>{if(motions.get(section)!==state)return;section.open=expand;section.style.overflow=overflow;section.style.boxSizing=boxSizing;motions.delete(section);motion.cancel();}).catch(()=>{});
 return expand;
}
document.addEventListener('click',event=>{const summary=event.target.closest('summary');if(!summary||summary.parentElement.tagName!=='DETAILS'||event.defaultPrevented||event.target.closest('a,input,button,select,textarea'))return;event.preventDefault();const section=summary.parentElement;const expanded=toggleSection(section);if(section.hasAttribute('data-disclosure-transient'))return;preferences[key(section)]=expanded;try{localStorage.setItem(storageKey,JSON.stringify(preferences));}catch{}});
