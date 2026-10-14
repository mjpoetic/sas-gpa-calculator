export function normalizeStudentName(name){return String(name).trim().replace(/\s+/gu,' ').normalize('NFC');}
export function nameParts(name){const parts=normalizeStudentName(name).split(' ');return {first:parts[0],initial:parts.length>1?Array.from(parts.at(-1))[0]:''};}
export function rosterName(student){const {first,initial}=nameParts(student.name);return first+(initial?' '+initial+'.':'');}
export function seatName(student,students){const {first}=nameParts(student.name);const key=first.toLowerCase();return students.filter(s=>nameParts(s.name).first.toLowerCase()===key).length>1?rosterName(student):first;}
