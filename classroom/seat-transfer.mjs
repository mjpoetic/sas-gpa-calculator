const appearanceKeys=['color','textColor','font','fontWeight','fontSize'];
// Seat geometry and shuffle locks stay in place; student presentation moves.
export function transferStudent(source,target,sourceAppearance,targetAppearance){
 const student=source.student,displaced=target.student;
 for(const key of appearanceKeys){delete source[key];delete target[key];if(sourceAppearance[key]!==undefined)target[key]=structuredClone(sourceAppearance[key]);if(displaced&&targetAppearance[key]!==undefined)source[key]=structuredClone(targetAppearance[key]);}
 source.student=displaced;target.student=student;
}
