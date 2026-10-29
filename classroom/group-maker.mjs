export function makeGroups(students,{mode='count',value=4,excluded=[]}={},random=Math.random){
 const skip=new Set(excluded),pool=students.filter(s=>!skip.has(s.id)).map(s=>s.id);if(pool.length<2)throw new Error('Include at least two students to make groups.');
 if(!['count','size'].includes(mode)||!Number.isInteger(value)||value<1||value>500)throw new Error('Choose a whole number from 1 to 500.');
 const count=Math.min(pool.length,mode==='size'?Math.ceil(pool.length/value):value);
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const groups=Array.from({length:count},()=>[]);pool.forEach((id,i)=>groups[i%count].push(id));return groups;
}
export function validateGroupMaker(data,students){
 if(!data||!['count','size'].includes(data.mode)||!Number.isInteger(data.value)||data.value<1||data.value>500||!Array.isArray(data.excluded)||data.excluded.length>500||!Array.isArray(data.groups)||data.groups.length>500)throw new Error('Invalid group maker settings.');
 const ids=new Set(students.map(s=>s.id)),seen=new Set();const refs=(list,unique)=>{if(!Array.isArray(list)||list.length>500||list.some(id=>typeof id!=='string'||id.length>100))throw new Error('Invalid group members.');return list.filter(id=>{if(unique&&seen.has(id))throw new Error('Duplicate group member.');if(unique)seen.add(id);return ids.has(id);});};
 return {mode:data.mode,value:data.value,excluded:[...new Set(refs(data.excluded,false))],groups:data.groups.map(g=>refs(g,true)).filter(g=>g.length)};
}
