// Move legacy per-tab sessions to browser storage once. Supabase's default
// storage and cross-tab lock then coordinate refresh tokens across tabs.
export function migrateTabSession(persistent,tab,key='sas-classroom-auth') {
  try {
    const existing=persistent.getItem(key),legacy=tab.getItem(key);
    const migrated=key+'-storage-migrated';
    if(!existing&&legacy&&!persistent.getItem(migrated))persistent.setItem(key,legacy);
    persistent.setItem(migrated,'1');
    // Never allow a stale duplicated tab to resurrect a signed-out session.
    tab.removeItem(key);
    return true;
  } catch {return false;}
}
