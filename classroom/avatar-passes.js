import qrcode from './vendor/qrcode.js?v=20261024-release1';

export function setupAvatarPasses(request){
 document.addEventListener('sas-avatar-pass',event=>openPassDialog(event.detail,request));
}
function node(tag,text){const e=document.createElement(tag);if(text)e.textContent=text;return e;}
export function passURL(token){const url=new URL('avatar-pass.html',location.href);url.hash=token;return url.href;}
async function openPassDialog({chartId,studentId,name},request){
 if(document.querySelector('.avatar-pass-dialog'))return;
 const d=node('dialog');d.className='workspace-dialog avatar-pass-dialog';d.setAttribute('aria-label','Temporary avatar pass for '+name);
 const heading=node('h2','Temporary avatar pass · '+name),hint=node('p','Give this private pass only to this student. Anyone with it can edit this avatar until access ends.');hint.className='hint';
 const status=node('p');status.setAttribute('role','status');
 const label=node('label','Access lasts'),duration=node('select');duration.setAttribute('aria-label','Pass duration');
 for(const [value,text] of [[15,'15 minutes'],[30,'30 minutes'],[60,'1 hour'],[240,'4 hours'],[1440,'24 hours']]){const o=node('option',text);o.value=value;duration.append(o);}duration.value='60';label.append(duration);
 const create=node('button','Create temporary pass');create.className='primary';
 const output=node('section');output.hidden=true;
 const linkLabel=node('label','Student link'),link=node('input');link.readOnly=true;linkLabel.append(link);
 const copy=node('button','Copy link'),qr=node('div');qr.className='avatar-pass-qr';
 const expiry=node('p'),revoke=node('button','Close access now');revoke.className='danger';
 output.append(linkLabel,copy,qr,expiry,revoke);
 const existing=node('div'),close=node('button','Done');close.onclick=()=>d.close();
 d.append(heading,hint,label,create,status,output,existing,close);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
 let currentId,busy=false;
 const params={p_chart:chartId,p_student:studentId};
 async function run(fn){if(busy)return;busy=true;create.disabled=revoke.disabled=true;try{await fn();}catch(error){status.textContent=error.message||'Could not connect. Try again.';}finally{busy=false;create.disabled=revoke.disabled=false;}}
 async function refresh(){const passes=await request('list',params);existing.replaceChildren();for(const pass of passes){if(pass.id===currentId&&!output.hidden)continue;const row=node('p'),active=!pass.revoked_at&&Date.parse(pass.expires_at)>Date.now();row.append(node('span',(active?'Access open until ':'Access ended · ')+new Date(pass.expires_at).toLocaleString()+(pass.saved_at?' · Avatar saved':'')));if(active){const stop=node('button','Close access now');stop.onclick=()=>run(async()=>{await request('revoke',{id:pass.id});if(pass.id===currentId)output.hidden=true;status.textContent='Student access closed.';await refresh();});row.append(stop);}existing.append(row);}}
 create.onclick=()=>run(async()=>{status.textContent='Creating pass…';const pass=await request('create',{...params,p_minutes:Number(duration.value)});currentId=pass.id;link.value=passURL(pass.token);const code=qrcode(0,'M');code.addData(link.value);code.make();qr.innerHTML=code.createSvgTag({cellSize:4,margin:16,scalable:true});qr.querySelector('svg').setAttribute('aria-label','Scan to edit your avatar');qr.querySelector('svg').setAttribute('role','img');expiry.textContent='Access ends '+new Date(pass.expires_at).toLocaleString();output.hidden=false;status.textContent='Pass ready. Creating another pass closes the previous one.';await refresh();});
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(link.value);status.textContent='Student link copied.';}catch{link.focus();link.select();status.textContent='Select and copy the student link above.';}};
 revoke.onclick=()=>run(async()=>{await request('revoke',{id:currentId});output.hidden=true;status.textContent='Student access closed.';await refresh();});
 await run(refresh);
}
