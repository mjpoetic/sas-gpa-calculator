import {avatarSVG} from './avatars.mjs?v=20261030-release8';
let currentPreview=null;
export function openAvatarPreview(person,{parent=document.body,pinned=false,returnFocus=document.activeElement}={}){
 currentPreview?.close();
 const overlay=document.createElement('div');overlay.className='avatar-enlarged-preview room-avatar-preview';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Avatar preview for '+person.name);
 const art=document.createElement('div');art.className='room-avatar-preview-art';art.innerHTML=avatarSVG(person.avatar);
 const name=document.createElement('strong');name.className='avatar-preview-name';name.textContent=person.name;
 const controls=document.createElement('div');controls.className='avatar-preview-controls';
 const pin=document.createElement('button');pin.type='button';pin.textContent='Pin preview';pin.setAttribute('aria-pressed','false');
 const closeButton=document.createElement('button');closeButton.type='button';closeButton.textContent='×';closeButton.setAttribute('aria-label','Close avatar preview');
 const hint=document.createElement('p');hint.className='avatar-preview-hint';hint.textContent='Release over Pin preview to keep open';
 controls.append(pin,closeButton);overlay.append(art,name,controls,hint);parent.append(overlay);
 let kept=false,closed=false;
 const close=()=>{if(closed)return;closed=true;overlay.remove();document.removeEventListener('keydown',key,true);window.removeEventListener('blur',away);document.removeEventListener('visibilitychange',hidden);if(currentPreview===api)currentPreview=null;if(kept&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});};
 const keep=()=>{kept=true;overlay.classList.add('is-pinned');overlay.setAttribute('aria-modal','true');pin.textContent='Pinned';pin.setAttribute('aria-pressed','true');hint.textContent='Close with ×, Escape, or a click outside';closeButton.focus({preventScroll:true});};
 const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'&&kept){e.preventDefault();(document.activeElement===pin?closeButton:pin).focus();}};
 const away=()=>{if(!kept)close();},hidden=()=>{if(document.hidden)away();};
 const api={close,get active(){return !closed;},get pinned(){return kept;},release(event){if(closed||kept)return;if(event?.type==='pointerup'){const r=pin.getBoundingClientRect();if(event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom){keep();return;}}close();}};
 pin.onclick=e=>{e.stopPropagation();keep();};closeButton.onclick=e=>{e.stopPropagation();close();};
 overlay.addEventListener('pointerdown',e=>e.stopPropagation());overlay.onclick=e=>{if(kept&&e.target===overlay)close();};
 document.addEventListener('keydown',key,true);window.addEventListener('blur',away);document.addEventListener('visibilitychange',hidden);currentPreview=api;if(pinned)keep();return api;
}
