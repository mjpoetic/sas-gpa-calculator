export function validateStudentExclusions(value){
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid student exclusions.');
 const result={};for(const kind of ['cleaners','picker']){const ids=value[kind]||[];if(!Array.isArray(ids)||ids.length>500||new Set(ids).size!==ids.length||ids.some(id=>typeof id!=='string'||!id||id.length>100))throw new Error('Invalid student exclusions.');result[kind]=[...ids];}return result;
}
export function eligibleStudents(chart,kind){const excluded=new Set(chart.studentExclusions?.[kind]||[]);return chart.students.filter(s=>!excluded.has(s.id));}
