// Two fingers always navigate, even when the normal tool edits furniture.
export function enableTwoFingerPan(scroller,{begin,transform}){
 const touches=new Map();let navigating=false,anchor=null,suppressUntil=0;
 const center=()=>{const pair=[...touches.values()].slice(0,2);return {x:(pair[0].x+pair[1].x)/2,y:(pair[0].y+pair[1].y)/2};};
 const distance=()=>{const p=[...touches.values()].slice(0,2);return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);};
 const resetAnchor=()=>{if(touches.size<2){anchor=null;return;}anchor={...center(),left:scroller.scrollLeft,top:scroller.scrollTop,distance:Math.max(1,distance()),context:begin(center())};};
 scroller.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY,target:e.target});
  if(touches.size<2&&!navigating)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!navigating){
   navigating=true;scroller.classList.add('two-finger-panning');
   // End any one-finger drag before taking ownership of both contacts.
   for(const [id,touch] of touches){if(id===e.pointerId)continue;const owner=[scroller,...scroller.querySelectorAll('*')].find(n=>n.hasPointerCapture?.(id))||touch.target;owner.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true,pointerId:id,pointerType:'touch'}));if(owner.hasPointerCapture?.(id))owner.releasePointerCapture(id);}
  }
  resetAnchor();
 },true);
 window.addEventListener('pointermove',e=>{
  const touch=touches.get(e.pointerId);if(!touch)return;touch.x=e.clientX;touch.y=e.clientY;
  if(!navigating)return;e.preventDefault();e.stopImmediatePropagation();
  if(anchor&&touches.size>=2){const c=center();transform(anchor.context,distance()/anchor.distance,c);}
 },{capture:true,passive:false});
 const end=e=>{if(!touches.has(e.pointerId))return;touches.delete(e.pointerId);if(!navigating)return;e.preventDefault();e.stopImmediatePropagation();suppressUntil=Date.now()+500;resetAnchor();if(!touches.size){navigating=false;scroller.classList.remove('two-finger-panning');}};
 // Synthetic cancellation above cleans up existing tools, not this gesture.
 for(const type of ['pointerup','pointercancel'])window.addEventListener(type,e=>{if(e.type==='pointercancel'&&!e.isTrusted)return;end(e);},true);
 scroller.addEventListener('click',e=>{if(navigating||Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>{touches.clear();navigating=false;anchor=null;scroller.classList.remove('two-finger-panning');});
}
