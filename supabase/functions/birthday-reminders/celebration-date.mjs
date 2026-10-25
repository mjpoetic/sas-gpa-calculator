// Month/day only: no birth year or age is needed for classroom celebrations.
export function validateBirthday(value){if(typeof value!=='string'||!/^\d{2}-\d{2}$/.test(value))throw new Error('Invalid birthday.');const [m,d]=value.split('-').map(Number);if(m<1||m>12||d<1||d>new Date(2000,m,0).getDate())throw new Error('Invalid birthday.');return value;}
export function birthdayToday(value,date=new Date()){return value===`${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}

export function localDateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function actualBirthday(value,year){if(!value)return null;try{validateBirthday(value);}catch{return null;}const [month,day]=value.split('-').map(Number),date=new Date(year,month-1,day,12);return date.getMonth()===month-1&&date.getDate()===day?date:null;}
export function birthdayOccasion(value,today=new Date(),weekendEarly=true){
 const date=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
 for(const offset of [0,1,2]){if(offset&&(!weekendEarly||date.getDay()!==5))continue;const candidate=new Date(date);candidate.setDate(candidate.getDate()+offset);if(!birthdayToday(value,candidate)||!actualBirthday(value,candidate.getFullYear()))continue;return {actual:candidate,early:offset>0,key:localDateKey(candidate)};}return null;
}
export function nextBirthday(value,today=new Date(),weekendEarly=true){
 const start=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12);
 for(let year=start.getFullYear();year<=start.getFullYear()+8;year++){const actual=actualBirthday(value,year);if(!actual||actual<start)continue;const weekend=[0,6].includes(actual.getDay()),celebration=new Date(actual);if(weekend&&weekendEarly)celebration.setDate(actual.getDate()-(actual.getDay()===6?1:2));return {actual,celebration,weekend};}return null;
}
// One summary per student birthday, even when the same student is in many lists.
export function birthdaySummary(document,today,weekendEarly=true){
 const seen=new Set(),names=[];let count=0,early=0;const people=[...(document.charts||[]).flatMap(c=>c.students||[]),...(document.studentLists||[]).flatMap(l=>l.names.map((name,i)=>({name,birthday:l.birthdays?.[i]})))];
 for(const person of people){const occasion=birthdayOccasion(person.birthday,today,weekendEarly);if(!occasion)continue;let name=String(person.name).normalize('NFC').trim().toLowerCase().replace(/\s+/g,' ');if(name.includes(',')){const [last,first]=name.split(',');name=`${first.trim()} ${last.trim()}`;}const key=name+'|'+occasion.key;if(seen.has(key))continue;seen.add(key);names.push(person.name);count++;if(occasion.early)early++;}return {count,early,names};
}
