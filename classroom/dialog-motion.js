// Keep native dialog focus and dismissal semantics; animate before releasing the modal.
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const decorated=new WeakSet();
function decorate(d){
 if(decorated.has(d))return;decorated.add(d);
 const nativeClose=d.close.bind(d),nativeShow=d.showModal.bind(d);let motion=null,closing=false;
 const enter=()=>{motion?.cancel();closing=false;d.classList.remove('dialog-motion-closing');if(!reduced())motion=d.animate([{opacity:0,transform:'translateY(14px) scale(.97)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});};
 d.showModal=function(){if(closing){enter();return;}const wasOpen=d.open;nativeShow();if(!wasOpen)enter();};
 d.close=function(value){if(!d.open||closing)return;if(reduced()){value===undefined?nativeClose():nativeClose(value);return;}motion?.cancel();closing=true;d.classList.add('dialog-motion-closing');const exit=d.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(8px) scale(.98)'}],{duration:150,easing:'ease-in',fill:'forwards'});motion=exit;exit.finished.then(()=>{if(motion!==exit)return;value===undefined?nativeClose():nativeClose(value);exit.cancel();motion=null;closing=false;d.classList.remove('dialog-motion-closing');}).catch(()=>{});};
 d.addEventListener('cancel',e=>{if(e.defaultPrevented)return;e.preventDefault();d.close();});
 d.addEventListener('submit',e=>{const method=e.submitter?.getAttribute('formmethod')||e.target.getAttribute('method');if(e.defaultPrevented||method?.toLowerCase()!=='dialog')return;e.preventDefault();d.close(e.submitter?.value||'');});
 d.addEventListener('close',()=>{motion?.cancel();motion=null;closing=false;d.classList.remove('dialog-motion-closing');});
 d.addEventListener('toggle',e=>{if(e.newState==='open'&&!closing&&!motion)enter();});
 if(d.open)enter();
}
function scan(){document.querySelectorAll('dialog').forEach(decorate);}
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
