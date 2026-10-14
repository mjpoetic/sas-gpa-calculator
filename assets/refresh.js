let refreshing=false;
export async function refreshSite(button){
 if(refreshing)return false;const classroom=location.pathname.includes('/classroom');
 if(!classroom&&!confirm('Reload this page? Export any unsaved calculator work first.'))return false;
 refreshing=true;const original=button?.innerHTML;if(button){button.disabled=true;button.textContent='Saving…';}
 let timeout;try{document.activeElement?.blur();const waits=[],event=new CustomEvent('sas-before-refresh',{cancelable:true,detail:{waitUntil:promise=>waits.push(Promise.resolve(promise))}});const allowed=document.dispatchEvent(event);const results=await Promise.race([Promise.all(waits),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Refresh paused: saving is taking longer than expected. Please try again.')),20000);})]);if(!allowed||results.some(value=>value===false))throw new Error('Refresh paused. Finish syncing or export a backup, then try again.');location.reload();return true;}
 catch(error){let notice=document.getElementById('refresh-status');if(!notice){notice=document.createElement('div');notice.id='refresh-status';notice.setAttribute('role','alert');Object.assign(notice.style,{position:'fixed',bottom:'16px',left:'12px',right:'12px',zIndex:'50000',padding:'16px',borderRadius:'14px',background:'#203c51',color:'#fff',font:'14px/1.5 Arial,sans-serif'});document.body.append(notice);}notice.textContent=error.message;return false;}
 finally{clearTimeout(timeout);refreshing=false;if(button){button.disabled=false;button.innerHTML=original;}}
}
