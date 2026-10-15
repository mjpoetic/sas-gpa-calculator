export function normalizeStudentName(name){return String(name).trim().replace(/\s+/gu,' ').normalize('NFC');}
export function validateNickname(value){if(typeof value!=='string')throw new Error('Invalid student nickname.');const name=normalizeStudentName(value);if(name.length>80)throw new Error('Use a nickname up to 80 characters.');return name;}
export function nameParts(name){const parts=normalizeStudentName(name).split(' ');return {first:parts[0],initial:parts.length>1?Array.from(parts.at(-1))[0]:''};}
export function preferredName(student){return student.nickname?normalizeStudentName(student.nickname):nameParts(student.name).first;}
export function rosterName(student){const first=preferredName(student),{initial}=nameParts(student.name);return first+(initial?' '+initial+'.':'');}
export function seatName(student,students){const first=preferredName(student),key=first.toLowerCase();return students.filter(s=>preferredName(s).toLowerCase()===key).length>1?rosterName(student):first;}
