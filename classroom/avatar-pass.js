import {cloudConfig} from './cloud-config.js?v=20261030-release7';
import {avatarSVG,defaultAvatar,validateAvatar} from './avatars.mjs?v=20261030-release7';
import {openAvatarEditor} from './avatar-editor.js?v=20261030-release7';
const status=document.getElementById('pass-status'),edit=document.getElementById('pass-edit'),portrait=document.getElementById('pass-portrait'),expiry=document.getElementById('pass-expiry');
// Fragment credentials stay out of HTTP paths, referrers and server access logs.
const token=location.hash.slice(1);
let person,expiresAt,timer;
async function usePass(avatar){
 const response=await fetch(cloudConfig.url+'/rest/v1/rpc/use_classroom_avatar_pass',{method:'POST',headers:{apikey:cloudConfig.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({p_token:token,...(avatar?{p_avatar:validateAvatar(avatar)}:{})}),cache:'no-store',referrerPolicy:'no-referrer'});
 const result=await response.json();if(!response.ok)throw new Error(result.message||'Could not connect. Try again.');return result;
}
function ended(){clearTimeout(timer);edit.hidden=true;status.textContent='This avatar pass has ended. Ask your teacher for a new one.';document.querySelector('.avatar-editor')?.close();}
function show(result){person={name:result.name||'Student',avatar:result.avatar||defaultAvatar()};expiresAt=Date.parse(result.expires_at);portrait.innerHTML=avatarSVG(person.avatar);expiry.textContent='You can edit until '+new Date(expiresAt).toLocaleString();edit.hidden=false;clearTimeout(timer);if(expiresAt<=Date.now())ended();else timer=setTimeout(ended,expiresAt-Date.now());}
edit.onclick=()=>{
 if(Date.now()>=expiresAt)return ended();
 openAvatarEditor(person,{studentPass:true,showAvatars:true,removable:false,onSave:async avatar=>{const result=await usePass(avatar);show(result);status.textContent='Avatar saved! Your teacher’s classroom will sync your changes.';}});
};
async function start(){if(!/^[0-9a-f]{64}$/.test(token)){status.textContent='Open the complete avatar link your teacher gave you.';return;}try{show(await usePass());status.textContent='Make this avatar your own, '+person.name+'.';}catch(error){status.textContent=error.message+' Ask your teacher for help if needed.';}}
void start();
