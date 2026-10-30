import {readFile,writeFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFile(root+path,'utf8');
const pages=['index.html','classroom/index.html','teacher-tools/index.html'];
const token=version=>version.replaceAll('.','').slice(0,8)+'-release'+version.split('.').at(-1);
async function sources(dir=''){
 const files=[];
 for(const entry of await readdir(root+dir,{withFileTypes:true})){
  if(entry.name.startsWith('.')||['backup','node_modules','tests','scripts','supabase'].includes(entry.name))continue;
  const path=dir+entry.name;
  if(entry.isDirectory())files.push(...await sources(path+'/'));
  else if(/\.(html|js|mjs|css)$/.test(path))files.push(path);
 }
 return files;
}
async function sourceHash(){
 const hash=createHash('sha256');
 for(const path of (await sources()).sort()){
  if(path==='assets/changelog.mjs')continue;
  const content=(await read(path)).replace(/\?v=\d{8}-release\d+/g,'?v=RELEASE').replace(/(<meta name="site-(?:version|updated)" content=")[^"]+/g,'$1RELEASE');
  hash.update(path+'\0'+content+'\0');
 }
 return hash.digest('hex');
}
const manifest=JSON.parse(await read('site-version.json'));
if(process.argv[2]!=='--check'){
 const [version,...changes]=process.argv.slice(2);
 assert.match(version||'',/^\d{4}\.\d{2}\.\d{2}\.[1-9]\d*$/,'Provide YYYY.MM.DD.iteration and release notes');
 assert.ok(changes.length,'Provide at least one user-facing release note');
 assert.ok(version.localeCompare(manifest.version,undefined,{numeric:true})>0,'Version must advance');
 const updatedAt=new Date().toISOString().replace(/\.\d{3}Z$/,'Z');
 for(const path of await sources()){
  const before=await read(path);
  let after=before.replace(/\?v=\d{8}-release\d+/g,'?v='+token(version));
  if(pages.includes(path))after=after.replace(/(<meta name="site-version" content=")[^"]+/,`$1${version}`).replace(/(<meta name="site-updated" content=")[^"]+/,`$1${updatedAt}`);
  if(path==='assets/changelog.mjs')after=after.replace('export const releases=[','export const releases=[\n '+JSON.stringify({version,changes})+',');
  if(after!==before)await writeFile(root+path,after);
 }
 Object.assign(manifest,{version,updatedAt,sourceHash:await sourceHash()});
 await writeFile(root+'site-version.json',JSON.stringify(manifest,null,2)+'\n');
}
assert.equal(manifest.sourceHash,await sourceHash(),'Site files changed since the last release. Run node scripts/site-release.mjs with a new version and release notes.');
const home=await read('index.html');
assert.match(home,/assets\/index-[^"?]+\.js\?v=\d{8}-release\d+/, 'Main application script must use a release cache tag');
for(const path of pages){
 const html=await read(path);
 assert.equal(html.match(/name="site-version" content="([^"]+)"/)?.[1],manifest.version,path+' version');
 assert.equal(html.match(/name="site-updated" content="([^"]+)"/)?.[1],manifest.updatedAt,path+' timestamp');
}
const {releases}=await import(new URL('../assets/changelog.mjs?'+Date.now(),import.meta.url));
assert.equal(releases[0].version,manifest.version,'Newest changelog entry');
for(const path of await sources()){
 for(const match of (await read(path)).matchAll(/\?v=(\d{8}-release\d+)/g))assert.equal(match[1],token(manifest.version),path+' cache version');
}
console.log('Release metadata, changelog, and cache versions agree: '+manifest.version);
