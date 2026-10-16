// Authenticator secrets stay only in this panel's memory/DOM during enrollment.
export function createMFA(client,{changed,locked}) {
 const root=document.getElementById('cloud-mfa'),$=id=>document.getElementById(id);
 let factors=[],pending=null,userId=null,working=false,mode='verify',epoch=0;
 const message=text=>{$('mfa-status').textContent=text;};
 function clearSecret(){pending=null;$('mfa-qr').removeAttribute('src');$('mfa-secret').textContent='';$('mfa-code').value='';$('mfa-form').hidden=true;$('mfa-setup').hidden=true;}
 function reset(){epoch++;userId=null;factors=[];clearSecret();root.hidden=true;}
 async function authorize(user){
  if(userId!==user.id){reset();userId=user.id;}
  const request=epoch;
  const [{data,error},{data:assurance,error:assuranceError}]=await Promise.all([client.auth.mfa.listFactors(),client.auth.mfa.getAuthenticatorAssuranceLevel()]);
  if(error||assuranceError)throw error||assuranceError;
  if(request!==epoch)return false;
  factors=data.all.filter(f=>f.status==='verified');
  root.hidden=false;
  const needsCode=factors.length>0&&assurance.currentLevel!=='aal2';
  $('mfa-enable').hidden=factors.length>0||!!pending;
  $('mfa-remove').hidden=!factors.length||needsCode;
  $('mfa-factor-label').hidden=!needsCode;
  $('mfa-factor').replaceChildren(...factors.map(f=>new Option(f.friendly_name||'Authenticator app',f.id)));
  if(needsCode){clearSecret();mode='verify';$('mfa-form').hidden=false;$('mfa-cancel').hidden=true;message('Enter an authenticator code to unlock cloud charts. Email links and password resets do not bypass this step.');locked();}
  else if(!pending)message(factors.length?'Two-factor authentication is on.':'Two-factor authentication is optional and currently off.');
  return !needsCode;
 }
 async function run(action){if(working)return;working=true;root.querySelectorAll('button').forEach(b=>b.disabled=true);const request=epoch;try{await action(request);}catch(error){if(request===epoch)message(error.status===429?'Too many attempts. Wait before trying again.':'Could not complete that step. Check your connection and use a fresh authenticator code.');}finally{working=false;root.querySelectorAll('button').forEach(b=>b.disabled=false);$('mfa-code').value='';}}
 $('mfa-enable').onclick=()=>run(async request=>{
  // Remove only abandoned, unverified enrollments belonging to this account.
  const {data,error}=await client.auth.mfa.listFactors();if(error)throw error;
  for(const factor of data.all.filter(f=>f.factor_type==='totp'&&f.status==='unverified')){const {error}=await client.auth.mfa.unenroll({factorId:factor.id});if(error)throw error;}
  const result=await client.auth.mfa.enroll({factorType:'totp',friendlyName:'Classroom Studio',issuer:'Classroom Studio'});if(result.error)throw result.error;
  if(request!==epoch)return;
  pending=result.data.id;mode='enroll';$('mfa-enable').hidden=true;$('mfa-setup').hidden=false;
  $('mfa-qr').src=result.data.totp.qr_code.startsWith('data:image/svg+xml')?result.data.totp.qr_code:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(result.data.totp.qr_code);
  $('mfa-secret').textContent=result.data.totp.secret;$('mfa-form').hidden=false;$('mfa-cancel').hidden=false;
  message('Scan the QR code in your authenticator app, or enter the setup key. Then enter its six-digit code to turn on 2FA. Keep a secure backup in your authenticator app; email resets cannot recover a lost authenticator.');$('mfa-code').focus();
 });
 $('mfa-cancel').onclick=()=>run(async()=>{if(pending){const {error}=await client.auth.mfa.unenroll({factorId:pending});if(error)throw error;}clearSecret();await changed();});
 $('mfa-remove').onclick=()=>{if(working)return;mode='remove';$('mfa-form').hidden=false;$('mfa-cancel').hidden=false;$('mfa-factor-label').hidden=false;message('Enter a fresh authenticator code to remove the selected authenticator. Removing the last one turns off 2FA.');$('mfa-code').focus();};
 $('mfa-form').onsubmit=e=>{e.preventDefault();if(!$('mfa-form').reportValidity())return;const code=$('mfa-code').value;void run(async request=>{
  const factorId=pending||$('mfa-factor').value;if(!factorId)throw Error('No authenticator');
  const {error}=await client.auth.mfa.challengeAndVerify({factorId,code});if(error)throw error;
  if(request!==epoch)return;
  if(mode==='remove'){const {error}=await client.auth.mfa.unenroll({factorId});if(error)throw error;const refreshed=await client.auth.refreshSession();if(refreshed.error)throw refreshed.error;}
  clearSecret();await changed();
 });};
 // Hiding/closing Account immediately removes the displayed enrollment secret.
 document.addEventListener('close',e=>{if(e.target.id==='account-dialog'&&pending){clearSecret();$('mfa-enable').hidden=false;message('Setup was not completed. Choose Enable 2FA to start again.');}},true);
 return {authorize,reset};
}
