import {createMFA} from './mfa.js?v=20261016-release17';
import {migrateTabSession} from './auth-session.mjs?v=20261016-release17';
import {mergeDocuments} from './sync-merge.mjs?v=20261016-release17';
import {cloudConfig} from './cloud-config.js?v=20261016-release17';
import {CloudStore} from './cloud-store.mjs?v=20261016-release17';

// Pin the browser SDK, including its bundled dependency versions.
const SDK = 'https://esm.sh/@supabase/supabase-js@2.117.3?bundle';
export async function connectCloud({getState,applyState,notify}) {
  const $=id=>document.getElementById(id), status=text=>{$('cloud-status').textContent=text;};
  let baseline=null,applyingRemote=false,pulling=false,conflictOpen=false,deferredRevision=null,interacting=false;
  let backedUpFingerprint=null;
  let autoReady=false,dirty=false,autoTimer,editVersion=0,picker,pendingPicker=false,pickerTimer;
  let mfa,mfaLocked=false,client, store, busy=false, accountRequest=0, accountEpoch=0, recovery=false;
  let passwordSetup=new URL(location.href).searchParams.has('code') || new URLSearchParams(location.hash.slice(1)).has('access_token'),callbackFailed=false;
  const fingerprint=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
  const markerKey=id=>'sas-cloud-baseline-'+id;
  function remember(document){$('cloud-status').dataset.savedAt=store.savedAt||'';baseline=structuredClone(document);try{localStorage.setItem(markerKey(store.userId),JSON.stringify(document));}catch{}}
  function offerCharts(){clearTimeout(pickerTimer);if(!pendingPicker)return;if(recovery||passwordSetup)return;if(busy||!picker||$('cloud-download').disabled){pickerTimer=setTimeout(offerCharts,250);return;}pendingPicker=false;$('cloud-download').click();}
  function schedule(){clearTimeout(autoTimer);if(store&&autoReady&&dirty)autoTimer=setTimeout(flush,900);}
  async function flush(){if(!store||!autoReady||!dirty||picker?.open)return;if(busy||pulling){schedule();return;}const current=store,version=editVersion,document=getState();busy=true;enable(false);status('Saving changes to cloud…');try{await current.save(document);if(store!==current)return;remember(document);dirty=version!==editVersion;refreshReady();status(dirty?'More changes waiting to save…':'✓ All changes saved to cloud.');}catch(error){if(store!==current)return;if(error.message?.includes('Another browser')){autoReady=false;setTimeout(pullRemote,0);}status((error.message||'Cloud save failed. Reconnect to retry.')+' Your browser copy is saved.');}finally{busy=false;enable(true);if(dirty&&autoReady&&version!==editVersion)schedule();}}
  document.addEventListener('sas-chart-edited',()=>{if(applyingRemote)return;dirty=true;editVersion++;if(store&&autoReady)status('Changes saved in this browser. Cloud save pending…');schedule();});
  const hasCurrentBackup=()=>backedUpFingerprint===fingerprint(getState());
  const refreshReady=()=>{if(!dirty)document.dispatchEvent(new Event('sas-refresh-ready'));};
  document.addEventListener('sas-chart-backup',event=>{backedUpFingerprint=fingerprint(event.detail.document);});
  window.addEventListener('online',schedule);
  window.addEventListener('beforeunload',event=>{if(store&&dirty&&autoReady&&!hasCurrentBackup()){event.preventDefault();event.returnValue='';}});
  document.addEventListener('sas-before-refresh',event=>{
    if(!event.detail?.waitUntil){if(busy||(store&&autoReady&&dirty))event.preventDefault();return;}
    event.detail.waitUntil((async()=>{
      await Promise.resolve();clearTimeout(autoTimer);
      const blocked=reason=>{if(hasCurrentBackup())return true;status(reason);event.detail.setReason?.(reason);return false;};
      const deadline=Date.now()+15000;
      while((busy||pulling)&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
      if(busy||pulling)return blocked('Refresh paused. A cloud request is still running. Wait or export a current backup, then retry.');
      if(!store)return true;
      if(dirty&&!autoReady)return blocked('Refresh paused. Resolve cloud synchronization or export a current backup, then retry.');
      if(picker?.open&&dirty)return blocked('Refresh paused. Choose your cloud classroom or export a current backup, then retry.');
      while(dirty&&autoReady&&Date.now()<deadline){await flush();if(dirty)return blocked('Refresh paused. Cloud saving did not finish. Reconnect or export a current backup, then retry.');}
      return !dirty||hasCurrentBackup();
    })());
  });
  $('cloud-login-form').onsubmit=e=>{e.preventDefault();status('Sign-in is connecting. Wait for the Sign in button to become available.');};
  $('cloud-password-form').onsubmit=e=>e.preventDefault();
  $('cloud-signup-form').onsubmit=e=>e.preventDefault();
  const configured=!!cloudConfig.url && !!cloudConfig.publishableKey;
  $('cloud-login-form').hidden=!configured;
  if(!configured) {status('Cloud sign-in is awaiting backend setup. Browser saving and backups are available.');return;}
  status('Connecting to sign-in…');
  function controls(signedIn) {
    $('cloud-login-form').hidden=signedIn;$('cloud-account').hidden=!signedIn;$('cloud-signup-form').hidden=true;$('cloud-signup-form').reset();
    if(!signedIn) {$('cloud-password-form').hidden=true;$('cloud-new-password').value='';$('cloud-confirm-password').value='';}
  }
  function enable(enabled) {for(const id of ['cloud-upload','cloud-download','cloud-signout','cloud-send','cloud-password-signin','cloud-forgot','cloud-set-password','cloud-password-save','cloud-password-cancel','cloud-create','cloud-signup-submit','cloud-signup-cancel']) $(id).disabled=!enabled||(mfaLocked&&['cloud-upload','cloud-download','cloud-set-password'].includes(id));}
  enable(false);
  async function account(session) {
    const attempt=++accountRequest;
    if(session && mfa){
      try {const allowed=await mfa.authorize(session.user);if(attempt!==accountRequest)return;if(!allowed){
        mfaLocked=true;++accountEpoch;store=null;baseline=null;autoReady=false;pendingPicker=false;clearTimeout(autoTimer);clearTimeout(pickerTimer);picker?.close();controls(true);$('cloud-email-display').textContent=session.user.email;enable(true);$('cloud-download').disabled=true;$('cloud-upload').disabled=true;$('cloud-set-password').disabled=true;status('Verify your authenticator code in Account to unlock cloud charts.');return;
      }mfaLocked=false;} catch {if(attempt!==accountRequest)return;mfaLocked=true;store=null;autoReady=false;clearTimeout(autoTimer);status('Could not check two-factor authentication. Reconnect and sign in again.');return;}
    } else {mfaLocked=false;mfa?.reset();}
    // Auth emits SIGNED_IN again on tab focus. Keep the known cloud revision.
    if(store && session?.user?.id===store.userId) {
      if(recovery || passwordSetup) {$('cloud-password-form').hidden=false;status(recovery?'Your reset link is verified. Choose a new password below.':'You are signed in. Choose a password below for easier sign-in on any device, or select Not now to keep using email links.');$('cloud-password-cancel').textContent='Not now';}
      return;
    }
    const epoch=++accountEpoch;
    store=null;baseline=null;deferredRevision=null;autoReady=false;pendingPicker=false;clearTimeout(pickerTimer);clearTimeout(autoTimer);controls(false);
    if(!session) {status(callbackFailed?'This sign-in link could not be used. Request a new email link in this browser and open it here.':'Sign in with your email and password, or create a teacher account.');return;}
    status('Checking your account access…');enable(false);
    try {
      const {data:{user},error}=await client.auth.getUser();if(error) throw error;
      if(epoch!==accountEpoch) return;
      if(!user?.email || user.is_anonymous) {await client.auth.signOut({scope:'local'});status('Sign in with a verified email account to save classrooms.');return;}
      store=new CloudStore(client,user.id);controls(true);$('cloud-email-display').textContent=user.email;
      // Adopt a remote revision only after verifying the local baseline.
      try{const remote=await store.load();if(epoch!==accountEpoch)return;const local=fingerprint(getState());let baseline;try{const saved=localStorage.getItem(markerKey(user.id));baseline=saved?fingerprint(JSON.parse(saved)):null;}catch{}autoReady=!remote||fingerprint(remote)===local||fingerprint(remote)===baseline;pendingPicker=!!remote&&!autoReady;if(pendingPicker)offerCharts();if(autoReady){if(remote)remember(remote);dirty=!remote||fingerprint(remote)!==local;schedule();}else status('Your account has different charts. Open cloud charts to continue automatic saving, or use Save to cloud to keep this browser’s version.');}catch{autoReady=false;status('Could not connect cloud saving. Use Open cloud charts to retry.');}
      if(recovery || passwordSetup) {$('cloud-password-form').hidden=false;status(recovery?'Your reset link is verified. Choose a new password below.':'You are signed in. Choose a password below for easier sign-in on any device, or select Not now to keep using email links.');$('cloud-password-cancel').textContent='Not now';}
      else if(autoReady){refreshReady();status('Signed in. Changes save automatically to cloud.');}
    } catch {status('Could not verify account access. Check your connection and try signing in again.');}
    finally {enable(true);}
  }
  try {
    const {createClient}=await import(SDK);
    // Each browser has an independent persistent session. Within that browser,
    // use SDK storage, broadcasting and locks to coordinate token refreshes.
    migrateTabSession(localStorage,sessionStorage);
    client=createClient(cloudConfig.url,cloudConfig.publishableKey,{auth:{flowType:'pkce',storageKey:'sas-classroom-auth',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    mfa=createMFA(client,{changed:async()=>{const {data,error}=await client.auth.getSession();if(error)throw error;await account(data.session);},locked:()=>document.dispatchEvent(new Event('sas-mfa-required'))});
    client.auth.onAuthStateChange((event,session)=>{
      // Run outside the SDK auth callback lock.
      if(event==='PASSWORD_RECOVERY') recovery=true;
      if(['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','PASSWORD_RECOVERY','TOKEN_REFRESHED','MFA_CHALLENGE_VERIFIED'].includes(event)) setTimeout(()=>{if(event==='SIGNED_OUT'||!busy) void account(session);},0);
    });
    const initialized=await client.auth.initialize?.();if(initialized?.error)throw initialized.error;
    const {error}=await client.auth.getSession();if(error) throw error;
    // The SDK consumes the PKCE callback. Remove auth callback parameters afterward.
    const url=new URL(location.href);
    if(url.searchParams.has('code')) {url.searchParams.delete('code');history.replaceState(null,'',url);}
    enable(true);
  } catch {if(!client){status('Sign-in could not connect. Reload to try again. Browser saving still works.');return;}callbackFailed=true;passwordSetup=false;const failedURL=new URL(location.href);failedURL.searchParams.delete('code');failedURL.hash='';history.replaceState(null,'',failedURL);enable(true);status('This sign-in link could not be used. Request a new email link in this browser and open it here.');}
  $('cloud-create').onclick=()=>{if(busy)return;$('cloud-password').value='';$('cloud-signup-email').value=$('cloud-email').value;$('cloud-login-form').hidden=true;$('cloud-signup-form').hidden=false;status('Create your teacher account. We will email you a confirmation link.');$('cloud-signup-email').focus();};
  $('cloud-signup-cancel').onclick=()=>{if(busy)return;$('cloud-signup-form').reset();$('cloud-signup-form').hidden=true;$('cloud-login-form').hidden=false;$('cloud-email').focus();};
  $('cloud-signup-form').onsubmit=async e=>{
    e.preventDefault();if(busy || !$('cloud-signup-form').reportValidity())return;
    if($('cloud-signup-password').value!==$('cloud-signup-confirm').value){status('The two passwords do not match.');return;}
    busy=true;enable(false);status('Creating your account…');
    const email=$('cloud-signup-email').value.trim();
    try {
      const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
      const {data,error}=await client.auth.signUp({email,password:$('cloud-signup-password').value,options:{emailRedirectTo:redirect.href}});if(error)throw error;
      $('cloud-signup-form').reset();$('cloud-signup-form').hidden=true;$('cloud-login-form').hidden=false;$('cloud-email').value=email;
      if(data.session)await account(data.session);
      else status('Check your email for a confirmation link, then return here and sign in. If you already have an account, sign in or use Forgot password.');
    } catch(error) {status(error.status===429?'Too many requests. Wait before trying again.':error.code==='weak_password'?'Choose a stronger password with at least 12 characters.':error.code==='email_address_not_authorized'?'Registration email delivery needs to be configured. Please try again later.':error.code==='signup_disabled'?'Teacher registration is not available yet. Please try again later.':'Could not create your account. Check your email address and try again later.');}
    finally {$('cloud-signup-password').value='';$('cloud-signup-confirm').value='';busy=false;enable(true);}
  };
  $('cloud-send').onclick=async()=>{
    if(busy || !$('cloud-email').reportValidity()) return;busy=true;enable(false);
    try {
      const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
      const {error}=await client.auth.signInWithOtp({email:$('cloud-email').value.trim(),options:{shouldCreateUser:false,emailRedirectTo:redirect.href}});
      if(error) throw error;
      status('If you have an account, a sign-in link is on its way. Open it in this browser.');
    } catch(error) {
      if(error.status===429 || ['over_email_send_rate_limit','over_request_rate_limit'].includes(error.code)) status('The sign-in email limit has been reached. Wait before requesting another link. Your browser charts are still available.');
      else if(error.code==='email_address_not_authorized') status('Email delivery needs to be configured for this account. Your browser charts are still available.');
      else status('Could not send the sign-in link. Check your email address or try again later.');
    }
    finally {busy=false;enable(true);}
  };
  $('cloud-login-form').onsubmit=async e=>{
    e.preventDefault();if(busy)return;if(!$('cloud-email').value.trim()||!$('cloud-password').value){status('Enter your email and password. If autofill missed a field, enter it manually.');return;}busy=true;enable(false);status('Signing in…');
    try {
      const {data,error}=await client.auth.signInWithPassword({email:$('cloud-email').value.trim(),password:$('cloud-password').value});
      if(error) throw error;
      $('cloud-password').value='';await account(data.session);
    } catch(error) {status(error.status===429?'Too many sign-in attempts. Wait before trying again.':error.code==='email_not_confirmed'?'Confirm your email using the link in your inbox before signing in.':error.code==='invalid_credentials'?'The email and password did not match. Check the saved password entry or type the password manually.':error.name==='AuthRetryableFetchError'||error.message?.includes('fetch')?'Sign-in could not reach the server. Check your connection and try again.':'Sign-in failed. Try entering your email and password manually. If you have not set a password, use an email link first.');}
    finally {$('cloud-password').value='';busy=false;enable(true);}
  };
  $('cloud-set-password').onclick=()=>{if(!store || busy) return;$('cloud-password-form').hidden=false;$('cloud-new-password').focus();};
  $('cloud-password-cancel').onclick=()=>{$('cloud-password-form').reset();$('cloud-password-form').hidden=true;recovery=false;passwordSetup=false;offerCharts();};
  $('cloud-password-form').onsubmit=async e=>{
    e.preventDefault();if(busy || pulling || !store) return;
    if($('cloud-new-password').value!==$('cloud-confirm-password').value) {status('The two passwords do not match.');return;}
    busy=true;enable(false);status('Saving your password…');
    try {
      const {error}=await client.auth.updateUser({password:$('cloud-new-password').value});if(error) throw error;
      $('cloud-password-form').reset();$('cloud-password-form').hidden=true;recovery=false;passwordSetup=false;
      status('Password saved. You can now sign in with your email and password in another browser.');offerCharts();
    } catch(error) {status(error.code==='weak_password' ? 'Choose a stronger password with at least 12 characters.' : 'Password could not be changed. Sign in again and retry.');}
    finally {$('cloud-password-form').reset();busy=false;enable(true);}
  };
  $('cloud-forgot').onclick=async()=>{
    if(busy || !$('cloud-email').reportValidity()) return;busy=true;enable(false);
    try {
      const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
      const {error}=await client.auth.resetPasswordForEmail($('cloud-email').value.trim(),{redirectTo:redirect.href});if(error) throw error;
      status('If you have an account, a password reset link is on its way. Open it in this browser.');
    } catch(error) {status(error.status===429 ? 'The email limit has been reached. Wait before requesting another reset link.' : 'Could not request a password reset. Try again later.');}
    finally {busy=false;enable(true);}
  };
  $('cloud-upload').onclick=async()=>{
    if(busy || pulling || !store) return;
    if(!confirm('Save all charts from this browser to your account? This replaces your cloud chart collection.')) return;
    busy=true;enable(false);status('Saving to cloud…');
    try {if(store.revision===null) {const remote=await store.load();if(remote && !confirm('Your account already has saved charts. Replace them with this browser’s charts?')) {status('Cloud charts kept.');return;}}
      const document=getState();await store.save(document);remember(document);autoReady=true;dirty=JSON.stringify(getState())!==JSON.stringify(document);schedule();refreshReady();status('✓ Saved to your account. Open cloud charts on your other browser.');
    } catch(error) {status(error.message || 'Cloud save failed. Your browser copy is still available.');}
    finally {busy=false;enable(true);}
  };
  picker=document.createElement('dialog');picker.addEventListener('close',schedule);picker.className='cloud-picker';picker.setAttribute('aria-labelledby','cloud-picker-title');picker.innerHTML='<form method="dialog"><h2 id="cloud-picker-title">Open a cloud classroom</h2><button aria-label="Close cloud chart picker">×</button></form><p>Choose a chart to open. Your account’s other charts stay available. The current browser collection is kept in Undo.</p><div class="cloud-chart-list"></div>';document.body.append(picker);
  $('cloud-download').onclick=async()=>{
    if(busy || pulling || !store)return;busy=true;enable(false);status('Loading your cloud chart list…');
    const current=store,reader=new CloudStore(client,current.userId);
    try{const remote=await reader.load();if(store!==current)return;
      if(!remote){status('No cloud charts yet. Your browser charts are still available.');return;}
      const list=picker.querySelector('.cloud-chart-list');list.replaceChildren();
      for(const chart of [...remote.charts].sort((a,b)=>(b.id===remote.active)-(a.id===remote.active))){const button=document.createElement('button');button.type='button';const title=document.createElement('strong');title.textContent=chart.name+(chart.id===remote.active?' · Last viewed':'');const detail=document.createElement('span');detail.textContent=`${chart.students.length} students · ${chart.items.length} furniture items · ${chart.room?.width||960} × ${chart.room?.height||680}`;button.append(title,detail);
        button.onclick=()=>{if(store!==current){picker.close();return;}if(!confirm('Open this chart and your account’s collection in this browser? Local changes remain available in Undo; export a backup first if needed.'))return;const baselineRemote=structuredClone(remote);remote.active=chart.id;autoReady=false;clearTimeout(autoTimer);store=reader;applyState(remote);remember(baselineRemote);dirty=fingerprint(remote)!==fingerprint(baselineRemote);autoReady=true;schedule();refreshReady();picker.close();status('✓ Cloud charts opened. Changes now save automatically.');};list.append(button);}
      document.dispatchEvent(new Event('sas-cloud-picker-open'));picker.showModal();status('Choose a classroom from your cloud charts.');
    }catch(error){status((error.message||'Could not open cloud charts.')+' Your browser copy has not changed.');}
    finally{busy=false;enable(true);}
  };
  function adopt(document){applyingRemote=true;try{applyState(document);}finally{applyingRemote=false;}}
  function resolveConflict(remote,reader){if(conflictOpen)return;conflictOpen=true;autoReady=false;let resolved=false;const local=structuredClone(getState()),d=document.createElement('dialog');d.className='workspace-dialog sync-conflict-dialog';d.setAttribute('aria-label','Resolve simultaneous edits');d.innerHTML='<h2>Two devices changed the same classroom setting</h2><p>Your local changes are kept. Choose which version to continue with, or close this window and export a backup first. Both versions are saved in this browser for recovery.</p>';try{localStorage.setItem('sas-sync-conflict-backup',JSON.stringify({local,remote,savedAt:new Date().toISOString()}));}catch{d.querySelector('p').textContent='Browser storage is unavailable. Export your local charts before choosing a version; both versions remain in memory while this dialog is open.';}for(const [label,chosenDocument] of [['Keep this device’s version',local],['Use the other device’s version',remote]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{resolved=true;deferredRevision=null;store=reader;remember(remote);adopt(chosenDocument);dirty=fingerprint(chosenDocument)!==fingerprint(remote);autoReady=true;d.close();schedule();refreshReady();status(dirty?'Resolved. Saving your chosen version…':'Resolved. Other device’s changes loaded.');};d.append(b);}const close=document.createElement('button');close.textContent='Review later';close.onclick=()=>d.close();d.append(close);for(const [copyLabel,copyDoc] of [['Download this device’s backup',local],['Download other device’s backup',remote]]){const download=document.createElement('button');download.textContent=copyLabel;download.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(copyDoc,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=copyLabel.includes('this')?'classrooms-local-backup.json':'classrooms-other-device-backup.json';link.click();if(fingerprint(copyDoc)===fingerprint(getState())){backedUpFingerprint=fingerprint(copyDoc);document.dispatchEvent(new Event('sas-refresh-ready'));}setTimeout(()=>URL.revokeObjectURL(url),1000);};d.append(download);}d.onclose=()=>{if(!resolved){deferredRevision=reader.revision;status('Sync conflict waiting for review. Your local changes are kept; use Open cloud charts when ready.');}conflictOpen=false;d.remove();};document.body.append(d);d.showModal();}
  async function pullRemote(){if(!store||busy||pulling||conflictOpen||picker?.open||document.hidden||!navigator.onLine||interacting||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;pulling=true;const current=store,reader=new CloudStore(client,current.userId);try{const remote=await reader.load();if(store!==current||busy||!remote||interacting||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;if(reader.revision===deferredRevision)return;if(!baseline){if(dirty)resolveConflict(remote,reader);return;}if(fingerprint(remote)===fingerprint(baseline)){if(dirty&&autoReady)schedule();return;}const local=getState(),result=mergeDocuments(baseline,local,remote);if(result.conflicts.length){resolveConflict(remote,reader);return;}const merged=result.document;merged.active=merged.charts.some(c=>c.id===local.active)?local.active:merged.active;store=reader;remember(remote);if(fingerprint(merged)!==fingerprint(local))adopt(merged);dirty=fingerprint(merged)!==fingerprint(remote);autoReady=true;schedule();refreshReady();status(dirty?'Changes from both devices combined. Saving…':'✓ Changes synchronized from your other device.');}catch(error){status('Sync is waiting for a connection. Your browser changes are saved.');}finally{pulling=false;}}
  setInterval(pullRemote,5000);window.addEventListener('online',pullRemote);document.addEventListener('visibilitychange',()=>{if(!document.hidden)void pullRemote();});document.addEventListener('pointerdown',()=>{interacting=true;},true);for(const name of ['pointerup','pointercancel'])document.addEventListener(name,()=>{interacting=false;},true);
  $('cloud-signout').onclick=async()=>{
    if(busy) return;busy=true;enable(false);
    try {const {error}=await client.auth.signOut({scope:'local'});if(error) throw error;++accountEpoch;mfa?.reset();store=null;baseline=null;deferredRevision=null;autoReady=false;pendingPicker=false;clearTimeout(pickerTimer);clearTimeout(autoTimer);controls(false);status('Signed out. Your charts remain in this browser; clear them before leaving a shared computer.');}
    catch {notify('Sign-out failed. Try again while connected.');}
    finally {busy=false;enable(true);}
  };
}
