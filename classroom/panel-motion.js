// Fade workspace tools without transforming or scaling the classroom canvas.
let running=[];
export function animateWorkspace(update){
 for(const stop of running)stop();running=[];
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){update();return;}
 const nodes=[...document.querySelectorAll('.library,.inspector,.room-toolbar,.workspace-dock,.room-footer,.message')];
 const visible=n=>!!n.getClientRects().length&&getComputedStyle(n).display!=='none';
 const before=new Map(nodes.map(n=>[n,visible(n)?n.getBoundingClientRect():null]));
 const displays=new Map(nodes.map(n=>[n,getComputedStyle(n).display]));
 const copies=new Map(nodes.filter(n=>before.get(n)&&!n.matches('.room-panel,.room-scroll')).map(n=>[n,n.cloneNode(true)]));
 update();
 const timing={duration:170,easing:'cubic-bezier(.22,1,.36,1)'};
 const animate=(n,frames,done)=>{const a=n.animate(frames,timing);const stop=()=>{a.cancel();done?.();};running.push(stop);a.finished.then(()=>done?.()).catch(()=>{});};
 for(const n of nodes){const from=before.get(n),to=visible(n)?n.getBoundingClientRect():null;
  const direction=n.matches('.library')?'translateX(-4px)':n.matches('.inspector')?(innerWidth<1100?'translateY(4px)':'translateX(4px)'):'translateY(4px)';
  if(from&&!to){const ghost=copies.get(n);if(!ghost)continue;ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.classList.add('workspace-motion-ghost');Object.assign(ghost.style,{position:'fixed',left:from.x+'px',top:from.y+'px',width:from.width+'px',height:from.height+'px',margin:'0',boxSizing:'border-box',zIndex:'1000',pointerEvents:'none'});ghost.style.setProperty('display',displays.get(n),'important');document.body.append(ghost);ghost.scrollTop=n.scrollTop;animate(ghost,[{opacity:1,transform:'none'},{opacity:0,transform:direction}],()=>ghost.remove());
  }else if(!from&&to){animate(n,[{opacity:0,transform:direction},{opacity:1,transform:'none'}]);

  }
 }
}
