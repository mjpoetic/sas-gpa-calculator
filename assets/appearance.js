import './surface-motion.js?v=20261025-release31';
import './dialog-motion.js?v=20261025-release31';
import {refreshSite} from './refresh.js?v=20261025-release31';
import './site-menus.js?v=20261025-release31';
import {fontOptions,validateFont,fontCSS,loadFont,suggestFonts,fontWeights,validateWeight} from './font-options.mjs?v=20261025-release31';
const KEY='sas-appearance-v1';
const defaults=()=>({theme:'system',font:{source:'preset',family:'system'},scale:100,weight:400});
let prefs=defaults(),internalTheme=false;
try {const p=JSON.parse(localStorage.getItem(KEY));if(p && ['system','light','dark'].includes(p.theme) && [90,100,110,125].includes(p.scale)) prefs={theme:p.theme,font:validateFont(p.font),scale:p.scale,weight:p.weight===undefined?400:validateWeight(p.weight)};}catch{}
const media=matchMedia('(prefers-color-scheme: dark)');
const dialog=document.createElement('dialog');dialog.className='appearance-dialog';dialog.setAttribute('aria-labelledby','appearance-title');
dialog.innerHTML=`<form method="dialog"><div class="appearance-heading"><h2 id="appearance-title">Appearance</h2><button aria-label="Close appearance settings">×</button></div></form><p>Make this site comfortable for you.</p><label>Color scheme<select id="appearance-theme"><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Font source<select id="appearance-source"><option value="preset">Built-in fonts</option><option value="google">Google Fonts</option><option value="local">Installed on this device</option></select></label><label id="appearance-preset-label">Font<select id="appearance-preset"></select></label><form id="appearance-custom" hidden><label>Font family name<input id="appearance-family" maxlength="80" placeholder="e.g. Atkinson Hyperlegible"></label><button>Apply font</button><p>Use a Google Fonts family name or the name of a font installed on this device. Unavailable fonts use a system fallback.</p></form><label>Font weight<select id="appearance-weight"></select></label><label>Interface text size<select id="appearance-scale"><option value="90">Small · 90%</option><option value="100">Default · 100%</option><option value="110">Large · 110%</option><option value="125">Extra large · 125%</option></select></label><p id="appearance-status" role="status"></p><button id="appearance-reset">Restore defaults</button>`;
document.body.append(dialog);
const $=id=>document.getElementById(id);
for(const [key,value] of Object.entries(fontOptions)){const o=document.createElement('option');o.value=key;o.textContent=value.label;$('appearance-preset').append(o);}
for(const [value,label] of Object.entries(fontWeights)){$('appearance-weight').append(new Option(label,value));}
function sync(){ $('appearance-weight').value=prefs.weight||400; $('appearance-theme').value=prefs.theme;$('appearance-source').value=prefs.font.source;$('appearance-scale').value=prefs.scale;$('appearance-preset').value=prefs.font.source==='preset'?prefs.font.family:'system';$('appearance-family').value=prefs.font.source==='preset'?'':prefs.font.family;sourceFields();}
function sourceFields(){const custom=$('appearance-source').value!=='preset';$('appearance-custom').hidden=!custom;$('appearance-preset-label').hidden=custom;suggestFonts($('appearance-family'),$('appearance-source').value,'site-font-suggestions');}
function apply(){
  const root=document.documentElement;root.style.setProperty('--font-sans',fontCSS(prefs.font));root.style.setProperty('--site-font',fontCSS(prefs.font));root.style.setProperty('--ui-text-scale',String(prefs.scale/100));
  root.style.fontSize=`${16*prefs.scale/100}px`;
  root.style.setProperty('--site-font-weight',prefs.weight||400);
  void loadFont(prefs.font,prefs.weight||400).catch(e=>{$('appearance-status').textContent=e.message;});
  const dark=prefs.theme==='dark' || prefs.theme==='system'&&media.matches;
  const native=document.querySelector('[data-testid="button-theme-toggle"]');
  if(native && native.getAttribute('aria-label').includes('light')!==dark){internalTheme=true;native.click();internalTheme=false;}
  else root.classList.toggle('dark',dark);
  root.style.colorScheme=dark?'dark':'light';
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs));$('appearance-status').textContent='Saved on this device.';}catch{$('appearance-status').textContent='Settings apply for this visit; browser storage is unavailable.';}apply();}
$('appearance-weight').onchange=()=>{prefs.weight=Number($('appearance-weight').value);save();};
$('appearance-theme').onchange=()=>{prefs.theme=$('appearance-theme').value;save();};
$('appearance-scale').onchange=()=>{prefs.scale=Number($('appearance-scale').value);save();};
$('appearance-source').onchange=()=>{const source=$('appearance-source').value;prefs.font={source,family:source==='preset'?$('appearance-preset').value:source==='google'?'Inter':'Arial'};sync();save();};
$('appearance-preset').onchange=()=>{prefs.font={source:'preset',family:$('appearance-preset').value};save();};
$('appearance-custom').onsubmit=e=>{e.preventDefault();try{prefs.font=validateFont({source:$('appearance-source').value,family:$('appearance-family').value.trim()});save();}catch(error){$('appearance-status').textContent=error.message;}};
$('appearance-reset').onclick=()=>{prefs=defaults();sync();save();};
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
function attach(){const host=document.querySelector('[data-appearance-host]')||document.querySelector('#root header > div');if(!host||host.dataset.appearanceAttached)return;host.dataset.appearanceAttached='true';const inline=document.querySelector('[data-appearance-inline]');if(inline){for(const node of [...dialog.children].slice(1))inline.append(node);dialog.remove();}else{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label','Appearance');button.title='Change color scheme, fonts, and interface text size.';button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 1.4-3.4l-.4-.4a1.5 1.5 0 0 1 1.1-2.6H17a4 4 0 0 0 4-4C21 6.3 17 3 12 3Z"/><circle cx="7.5" cy="10" r=".9"/><circle cx="10" cy="6.8" r=".9"/><circle cx="14" cy="6.8" r=".9"/><circle cx="17" cy="10" r=".9"/></svg><span class="appearance-label">Appearance</span>';button.className='appearance-trigger';button.dataset.appearanceButton='';button.onclick=()=>{sync();dialog.showModal();};host.append(button);}const refresh=document.createElement('button');refresh.type='button';refresh.className='site-refresh';refresh.setAttribute('aria-label','Refresh page');refresh.title='Refresh page';refresh.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 7v5h-5M20 12a8 8 0 1 0-2.3 5.7"/></svg>';refresh.onclick=()=>refreshSite(refresh);host.append(refresh);apply();}
document.addEventListener('click',e=>{if(!internalTheme&&e.target.closest?.('[data-testid="button-theme-toggle"]')){prefs.theme=document.documentElement.classList.contains('dark')?'light':'dark';try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{}document.documentElement.style.colorScheme=prefs.theme;}} ,true);
new MutationObserver(attach).observe(document.body,{childList:true,subtree:true});
media.addEventListener('change',()=>{if(prefs.theme==='system')apply();});
window.addEventListener('storage',e=>{if(e.key!==KEY)return;try{const p=e.newValue?JSON.parse(e.newValue):defaults();if(!['system','light','dark'].includes(p.theme)||![90,100,110,125].includes(p.scale))return;prefs={...p,font:validateFont(p.font)};sync();apply();}catch{}});
sync();apply();attach();
