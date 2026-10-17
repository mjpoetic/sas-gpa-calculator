// Attach to the calculator header after its app has rendered.
function attachTeacherTools(){
 const host=document.querySelector('#root header > div');
 if(!host||host.querySelector('.teacher-tools-entry'))return;
 host.dataset.teacherToolsNavigation='';
 const link=document.createElement('a');link.className='teacher-tools-entry';link.href=new URL('./teacher-tools/',document.baseURI).href;
 link.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v12H4ZM8 21l4-4 4 4M8 9h8m-8 4h5"/></svg><span>Teacher Tools</span>';
 link.setAttribute('aria-label','Teacher Tools');
 host.append(link);
}
new MutationObserver(attachTeacherTools).observe(document.getElementById('root'),{childList:true,subtree:true});
attachTeacherTools();

// Keep the generated app's theme control available to its state bridge, while
// presenting color scheme and appearance together in one Settings dialog.
function arrangeHeader(){
 const host=document.querySelector('#root header > div');
 const settings=host?.querySelector('[data-appearance-button]');
 const tools=host?.querySelector('.teacher-tools-entry');
 if(!settings||!tools||host.hasAttribute('data-header-settings'))return;
 host.dataset.headerSettings='';
 const actions=document.createElement('div');actions.className='header-actions';
 host.append(actions);actions.append(tools,settings);
 const refresh=host.querySelector('.site-refresh');if(refresh)actions.append(refresh);
 settings.setAttribute('aria-label','Settings');settings.removeAttribute('title');
 settings.setAttribute('aria-haspopup','dialog');
 settings.querySelector('.appearance-label').textContent='Settings';
 settings.querySelector('svg').innerHTML='<path d="m9 3-.6 2.2-2 .9-2-.6-2 3.5 1.6 1.6v2.3L2.4 15l2 3.5 2-.6 2 .9L9 21h4l.6-2.2 2-.9 2 .6 2-3.5-1.6-1.6v-2.3L19.6 9l-2-3.5-2 .6-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/>';
 const heading=document.getElementById('appearance-title');if(heading)heading.textContent='Settings';
 document.querySelector('.appearance-heading button')?.setAttribute('aria-label','Close settings');
 for(const button of actions.querySelectorAll('a,button')){
  const label=button.getAttribute('aria-label')||button.textContent.trim();
  button.removeAttribute('title');button.dataset.headerTooltip=label;
 }
}
new MutationObserver(arrangeHeader).observe(document.getElementById('root'),{childList:true,subtree:true});
arrangeHeader();
const tooltip=document.createElement('div');tooltip.id='header-tooltip';tooltip.className='header-tooltip';tooltip.role='tooltip';tooltip.hidden=true;document.body.append(tooltip);
let tooltipTimer,tooltipTarget;
function hideTooltip(){clearTimeout(tooltipTimer);tooltip.hidden=true;if(tooltipTarget)tooltipTarget.removeAttribute('aria-describedby');tooltipTarget=null;}
function scheduleTooltip(target){
 hideTooltip();tooltipTarget=target;
 tooltipTimer=setTimeout(()=>{
  if(!target.isConnected)return;
  tooltip.textContent=target.dataset.headerTooltip;tooltip.hidden=false;
  const box=target.getBoundingClientRect();
  tooltip.style.left=Math.max(8,Math.min(innerWidth-tooltip.offsetWidth-8,box.left+(box.width-tooltip.offsetWidth)/2))+'px';
  tooltip.style.top=(box.bottom+8)+'px';target.setAttribute('aria-describedby',tooltip.id);
 },2300);
}
document.addEventListener('pointerover',e=>{const target=e.target.closest?.('[data-header-tooltip]');if(target&&!target.contains(e.relatedTarget))scheduleTooltip(target);});
document.addEventListener('pointerout',e=>{if(tooltipTarget?.contains(e.target)&&!tooltipTarget.contains(e.relatedTarget))hideTooltip();});
document.addEventListener('focusin',e=>{if(e.target.matches('[data-header-tooltip]'))scheduleTooltip(e.target);});
document.addEventListener('focusout',hideTooltip);
document.addEventListener('pointerdown',hideTooltip,true);
document.addEventListener('click',hideTooltip,true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTooltip();});
window.addEventListener('scroll',hideTooltip,true);window.addEventListener('resize',hideTooltip);
