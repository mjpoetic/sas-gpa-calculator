import {footprint,uid} from './model.mjs?v=20261020-names1';

const identity=item=>item.syncKey||item.id;
const visualFields=['type','label','showLabel','width','height','x','y','rotation','flipX','flipY','color','rugStyle','calendarStyle','clockStyle','clockFormat','globeStyle','font','fontWeight','labelFont'];

// Match each destination item at most once. Saved relationships take priority;
// older rooms fall back to matching names/types and closest room positions.
export function planFurnitureSync(source,target,items=source.items){
 const sources=items.filter(item=>item.type!=='label'),available=new Set(target.items.filter(item=>item.type!=='label')),pairs=[];
 for(const item of sources){const match=[...available].find(other=>other.type===item.type&&identity(other)===identity(item));if(match){pairs.push({source:item,target:match});available.delete(match);}}
 const pending=sources.filter(item=>!pairs.some(pair=>pair.source===item));
 const edges=pending.flatMap(item=>[...available].filter(other=>other.type===item.type).map(other=>({source:item,target:other,named:item.label.trim().toLowerCase()===other.label.trim().toLowerCase(),distance:Math.hypot(item.x-other.x,item.y-other.y)}))).sort((a,b)=>Number(b.named)-Number(a.named)||a.distance-b.distance);
 const used=new Set();for(const edge of edges)if(!used.has(edge.source)&&available.has(edge.target)){pairs.push({source:edge.source,target:edge.target});used.add(edge.source);available.delete(edge.target);}
 const additions=sources.filter(item=>!pairs.some(pair=>pair.source===item));
 const overLimit=target.items.length+additions.length>500;
 const room=target.room||{width:960,height:680};
 const outside=sources.some(item=>{const b=footprint(item);return b.x<-.001||b.y<-.001||b.x+b.width>room.width+.001||b.y+b.height>room.height+.001;});
 return {source,target,pairs,additions,outside,overLimit};
}

export function applyFurnitureSync(plan){
 if(plan.overLimit)throw new Error('The destination room would exceed the 500 furniture limit.');
 if(plan.outside)throw new Error('Enlarge the destination room to fit the exact furniture positions.');
 const additions=plan.additions.map(source=>{const copy=structuredClone(source);copy.id=uid();copy.syncKey=identity(source);copy.seats.forEach(seat=>{seat.student=null;seat.locked=false;});if(!source.color&&plan.source.appearance?.color)copy.color=plan.source.appearance.color;return copy;});
 for(const {source,target} of plan.pairs){
  // Keep destination IDs and complete seat objects, including assignments,
  // locks, name colors and fonts. Teachers continue to reference the same IDs.
  for(const key of visualFields){if(Object.hasOwn(source,key))target[key]=structuredClone(source[key]);else delete target[key];}
  if(!source.color&&plan.source.appearance?.color)target.color=plan.source.appearance.color;
  target.syncKey=identity(source);
 }
 plan.target.items.push(...additions);
}
