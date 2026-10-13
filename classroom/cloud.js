import {cloudConfig} from './cloud-config.js';
import {CloudStore} from './cloud-store.mjs';

// Pin the browser SDK, including its bundled dependency versions.
const SDK = 'https://esm.sh/@supabase/supabase-js@2.117.3?bundle';
export async function connectCloud({getState,applyState,notify}) {
  const $=id=>document.getElementById(id), status=text=>{$('cloud-status').textContent=text;};
  let client, store, busy=false, accountEpoch=0, recovery=false;
  document.addEventListener('sas-before-refresh',event=>{if(busy){event.preventDefault();status('Wait for the current account or cloud request to finish before refreshing.');}});
  $('cloud-login-form').onsubmit=e=>e.preventDefault();
  $('cloud-password-form').onsubmit=e=>e.preventDefault();
  const configured=!!cloudConfig.url && !!cloudConfig.publishableKey;
  $('cloud-login-form').hidden=!configured;
  if(!configured) {status('Cloud sign-in is awaiting backend setup. Browser saving and backups are available.');return;}
  status('Connecting to sign-in…');
  function controls(signedIn) {
    $('cloud-login-form').hidden=signedIn;$('cloud-account').hidden=!signedIn;
    if(!signedIn) {$('cloud-password-form').hidden=true;$('cloud-new-password').value='';$('cloud-confirm-password').value='';}
  }
  function enable(enabled) {for(const id of ['cloud-upload','cloud-download','cloud-signout','cloud-send','cloud-password-signin','cloud-forgot','cloud-set-password','cloud-password-save','cloud-password-cancel']) $(id).disabled=!enabled;}
  enable(false);
  async function account(session) {
    // Auth emits SIGNED_IN again on tab focus. Keep the known cloud revision.
    if(store && session?.user?.id===store.userId) {
      if(recovery) {$('cloud-password-form').hidden=false;status('Your reset link is verified. Choose a new password below.');}
      return;
    }
    const epoch=++accountEpoch;
    store=null;controls(false);
    if(!session) {status('Sign in to save and open your charts across browsers.');return;}
    status('Checking your account access…');enable(false);
    try {
      const {data:{user},error}=await client.auth.getUser();if(error) throw error;
      const {data,error:accessError}=await client.from('classroom_access').select('email').limit(1);
      if(accessError) throw accessError;
      if(epoch!==accountEpoch) return;
      if(!data?.length) {await client.auth.signOut({scope:'local'});status('This account does not have access to the classroom preview.');return;}
      store=new CloudStore(client,user.id);controls(true);$('cloud-email-display').textContent=user.email;
      // Opening a session never uploads or replaces browser data automatically.
      if(recovery) {$('cloud-password-form').hidden=false;status('Your reset link is verified. Choose a new password below.');}
      else status('Signed in. Save this browser’s charts to cloud, or open your cloud charts.');
    } catch {status('Could not verify account access. Check your connection and try signing in again.');}
    finally {enable(true);}
  }
  try {
    const {createClient}=await import(SDK);
    // Keep the session in this tab. Share only the short-lived PKCE verifier
    // across tabs so an email link opened in a new tab can finish sign-in.
    const authStorage={
      getItem:key=>(key.endsWith('-code-verifier') ? localStorage : sessionStorage).getItem(key),
      setItem:(key,value)=>(key.endsWith('-code-verifier') ? localStorage : sessionStorage).setItem(key,value),
      removeItem:key=>(key.endsWith('-code-verifier') ? localStorage : sessionStorage).removeItem(key),
    };
    client=createClient(cloudConfig.url,cloudConfig.publishableKey,{auth:{flowType:'pkce',storage:authStorage,storageKey:'sas-classroom-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    client.auth.onAuthStateChange((event,session)=>{
      // Run outside the SDK auth callback lock.
      if(event==='PASSWORD_RECOVERY') recovery=true;
      if(['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','PASSWORD_RECOVERY'].includes(event)) setTimeout(()=>{if(!busy) void account(session);},0);
    });
    const {error}=await client.auth.getSession();if(error) throw error;
    // The SDK consumes the PKCE callback. Remove auth callback parameters afterward.
    const url=new URL(location.href);
    if(url.searchParams.has('code')) {url.searchParams.delete('code');history.replaceState(null,'',url);}
    enable(true);
  } catch {status('Sign-in could not connect. Reload to try again. Browser saving still works.');return;}
  $('cloud-send').onclick=async()=>{
    if(busy || !$('cloud-email').reportValidity()) return;busy=true;enable(false);
    try {
      const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
      const {error}=await client.auth.signInWithOtp({email:$('cloud-email').value.trim(),options:{shouldCreateUser:false,emailRedirectTo:redirect.href}});
      if(error) throw error;
      status('If your account is approved, a sign-in link is on its way. Open it in this browser.');
    } catch(error) {
      if(error.status===429 || ['over_email_send_rate_limit','over_request_rate_limit'].includes(error.code)) status('The sign-in email limit has been reached. Wait before requesting another link. Your browser charts are still available.');
      else if(error.code==='email_address_not_authorized') status('Email delivery needs to be configured for this account. Your browser charts are still available.');
      else status('Could not send the sign-in link. Check your email address or try again later.');
    }
    finally {busy=false;enable(true);}
  };
  $('cloud-login-form').onsubmit=async e=>{
    e.preventDefault();if(busy) return;busy=true;enable(false);status('Signing in…');
    try {
      const {data,error}=await client.auth.signInWithPassword({email:$('cloud-email').value.trim(),password:$('cloud-password').value});
      if(error) throw error;
      $('cloud-password').value='';await account(data.session);
    } catch(error) {status(error.status===429 ? 'Too many sign-in attempts. Wait before trying again.' : 'Sign-in failed. Check your email and password. If you have not set a password yet, use an email link first.');}
    finally {$('cloud-password').value='';busy=false;enable(true);}
  };
  $('cloud-set-password').onclick=()=>{if(!store || busy) return;$('cloud-password-form').hidden=false;$('cloud-new-password').focus();};
  $('cloud-password-cancel').onclick=()=>{$('cloud-password-form').reset();$('cloud-password-form').hidden=true;recovery=false;};
  $('cloud-password-form').onsubmit=async e=>{
    e.preventDefault();if(busy || !store) return;
    if($('cloud-new-password').value!==$('cloud-confirm-password').value) {status('The two passwords do not match.');return;}
    busy=true;enable(false);status('Saving your password…');
    try {
      const {error}=await client.auth.updateUser({password:$('cloud-new-password').value});if(error) throw error;
      $('cloud-password-form').reset();$('cloud-password-form').hidden=true;recovery=false;
      status('Password saved. You can now sign in with your email and password in another browser.');
    } catch(error) {status(error.code==='weak_password' ? 'Choose a stronger password with at least 12 characters.' : 'Password could not be changed. Sign in again and retry.');}
    finally {$('cloud-password-form').reset();busy=false;enable(true);}
  };
  $('cloud-forgot').onclick=async()=>{
    if(busy || !$('cloud-email').reportValidity()) return;busy=true;enable(false);
    try {
      const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
      const {error}=await client.auth.resetPasswordForEmail($('cloud-email').value.trim(),{redirectTo:redirect.href});if(error) throw error;
      status('If your account is approved, a password reset link is on its way. Open it in this browser.');
    } catch(error) {status(error.status===429 ? 'The email limit has been reached. Wait before requesting another reset link.' : 'Could not request a password reset. Try again later.');}
    finally {busy=false;enable(true);}
  };
  $('cloud-upload').onclick=async()=>{
    if(busy || !store) return;
    if(!confirm('Save all charts from this browser to your account? This replaces your cloud chart collection.')) return;
    busy=true;enable(false);status('Saving to cloud…');
    try {if(store.revision===null) {const remote=await store.load();if(remote && !confirm('Your account already has saved charts. Replace them with this browser’s charts?')) {status('Cloud charts kept.');return;}}
      await store.save(getState());status('✓ Saved to your account. Open cloud charts on your other browser.');
    } catch(error) {status(error.message || 'Cloud save failed. Your browser copy is still available.');}
    finally {busy=false;enable(true);}
  };
  $('cloud-download').onclick=async()=>{
    if(busy || !store) return;
    if(!confirm('Open the charts saved to your account? This replaces the charts in this browser. Export a backup first if you want to keep local changes. Undo will restore them.')) return;
    busy=true;enable(false);status('Opening cloud charts…');
    try {const remote=await store.load();if(remote) {applyState(remote);status('✓ Cloud charts opened. Future edits save locally until you choose Save to cloud.');}else status('No cloud charts yet. Save your browser’s charts first.');}
    catch {status('Could not open cloud charts. Your browser copy has not changed.');}
    finally {busy=false;enable(true);}
  };
  $('cloud-signout').onclick=async()=>{
    if(busy) return;busy=true;enable(false);
    try {const {error}=await client.auth.signOut({scope:'local'});if(error) throw error;++accountEpoch;store=null;controls(false);status('Signed out. Your charts remain in this browser; clear them before leaving a shared computer.');}
    catch {notify('Sign-out failed. Try again while connected.');}
    finally {busy=false;enable(true);}
  };
}
