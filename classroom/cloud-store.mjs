import {validateBackup} from './model.mjs?v=20261016-release8';

// Compare-and-swap prevents another browser's edits from being overwritten silently.
export class CloudStore {
  constructor(client, userId) {this.client=client;this.userId=userId;this.revision=null;this.savedAt=null;}
  async load() {
    const {data,error}=await this.client.from('classroom_documents').select('document,revision').eq('user_id',this.userId).maybeSingle();
    if(error) throw error;
    const document=data ? validateBackup(data.document) : null;
    this.revision=data?.revision ?? null;this.savedAt=data?.document?.cloudSavedAt||null;
    return document;
  }
  async save(document) {
    document=validateBackup(document);
    const savedAt=new Date().toISOString();document={...document,cloudSavedAt:savedAt};
    let query;
    if(this.revision === null) {
      query=this.client.from('classroom_documents').insert({user_id:this.userId,document,revision:1});
    } else {
      query=this.client.from('classroom_documents').update({document,revision:this.revision+1}).eq('user_id',this.userId).eq('revision',this.revision);
    }
    const {data,error}=await query.select('revision').maybeSingle();
    if(error?.code==='23505' || (!error && !data)) throw new Error('Another browser changed your cloud charts. Load the cloud copy before saving again. Your local work is still saved; export it first if needed.');
    if(error) throw error;
    this.revision=data.revision;this.savedAt=savedAt;
  }
}
