import {validateBackup} from './model.mjs?v=20261031-release4';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function mergeDocuments(base,local,remote){
 const conflicts=[];
 function merge(b,l,r,path){if(path==='classrooms.active')return l;if(equal(l,r))return l;if(equal(l,b))return r;if(equal(r,b))return l;
 if(b===undefined&&Array.isArray(l)&&Array.isArray(r)&&[...l,...r].every(v=>v&&typeof v.id==='string'))b=[];
 if(Array.isArray(l)&&Array.isArray(r)&&Array.isArray(b)){const keyed=[...b,...l,...r].every(v=>v&&typeof v==='object'&&typeof v.id==='string');if(keyed){const ids=[...new Set([...r,...l,...b].map(v=>v.id))];return ids.map(id=>merge(b.find(v=>v.id===id),l.find(v=>v.id===id),r.find(v=>v.id===id),path+'.'+id)).filter(v=>v!==undefined);}if(l.length===r.length&&b.length===l.length)return l.map((v,i)=>merge(b[i],v,r[i],path+'.'+i));}
 if(b&&l&&r&&!Array.isArray(l)&&typeof l==='object'&&typeof r==='object'){for(const keys of [['x','y','rotation'],['width','height']]){if(keys.every(k=>Object.hasOwn(b,k)&&Object.hasOwn(l,k)&&Object.hasOwn(r,k))){const pick=v=>keys.map(k=>v[k]);if(!equal(pick(l),pick(b))&&!equal(pick(r),pick(b))&&!equal(pick(l),pick(r))){conflicts.push(path+'.'+keys.join('/'));return l;}}}const result={};for(const key of new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])){const value=merge(b[key],l[key],r[key],path+'.'+key);if(value!==undefined)result[key]=value;}return result;}
 conflicts.push(path);return l;}
 const document=merge(base,local,remote,'classrooms');if(conflicts.length)return {conflicts};try{return {document:validateBackup(document),conflicts:[]};}catch(error){return {conflicts:['Seat assignments or classroom data require review: '+error.message]};}
}
