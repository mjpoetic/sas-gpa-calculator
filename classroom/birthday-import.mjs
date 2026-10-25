import {validateBirthday} from './celebration-date.mjs?v=20261025-release3';

const nameKey=value=>String(value).normalize('NFC').trim().replace(/\s+/gu,' ').toLocaleLowerCase('en');
export function parseBirthdayRows(text,{keepHeader=false}={}){
 if(typeof text!=='string'||text.length>200000)throw new Error('Use a birthday list under 200,000 characters.');
 text=text.replace(/^\uFEFF/,'');
 // Excel/Sheets paste tabs; CSV files use commas. Ignore separators inside quotes.
 let quoted=false,delimiter=',';for(let i=0;i<text.length;i++){const c=text[i];if(c==='"')quoted=!quoted;if(!quoted&&c==='\t'){delimiter='\t';break;}if(!quoted&&(c==='\n'||c==='\r'))break;}
 const rows=[];let row=[],field='',inQuotes=false,closed=false;
 const cell=()=>{row.push(field.trim());field='';closed=false;};
 const record=()=>{cell();if(row.some(Boolean))rows.push(row);row=[];if(rows.length>1001)throw new Error('Import up to 1,000 birthday rows at a time.');};
 for(let i=0;i<text.length;i++){const c=text[i];if(inQuotes){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{inQuotes=false;closed=true;}}else field+=c;continue;}
 if(c===delimiter){cell();continue;}if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;record();continue;}
 if(c==='"'&&!field.trim()&&!closed){inQuotes=true;field='';continue;}if(c==='"'||(closed&&!/\s/.test(c)))throw new Error('Check the quotation marks in your birthday list.');if(!closed)field+=c;
 }
 if(inQuotes)throw new Error('Check the quotation marks in your birthday list.');if(field||row.length)record();
 if(!keepHeader&&rows.length&&/^(student(?: name)?|name)$/i.test(rows[0][0])&&/^birthday\b/i.test(rows[0][1]||''))rows.shift();if(rows.length>1000)throw new Error('Import up to 1,000 birthday rows at a time.');return rows;
}
export function previewBirthdays(text,students){
 const rows=parseBirthdayRows(text),index=new Map();for(const student of students){const key=nameKey(student.name);if(!index.has(key))index.set(key,[]);index.get(key).push(student);}
 const result=rows.map((cells,i)=>{
  const [name='',date='']=cells,row={line:i+1,name,date,status:'',error:false};
  if(cells.length!==2){return {...row,error:true,status:'Use exactly two columns: student name and birthday.'};}
  let matches=index.get(nameKey(name))||[];if(!matches.length&&name.startsWith("'"))matches=index.get(nameKey(name.slice(1)))||[];
  if(matches.length!==1)return {...row,error:true,status:matches.length?'More than one roster student has this name. Give them distinct names first.':'No matching student. Use the full name from the roster.'};
  const student=matches[0];row.studentId=student.id;row.previous=student.birthday||'';
  if(!date)return {...row,status:'No date entered — skipped.'};
  const parts=date.match(/^(\d{1,2})[\/-](\d{1,2})$/);if(!parts)return {...row,error:true,status:'Use month/day, for example 10/24. No year needed.'};
  try{row.birthday=validateBirthday(`${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`);}catch{return {...row,error:true,status:'Invalid date. Check the month and day.'};}
  row.changed=row.birthday!==row.previous;row.replacement=!!row.previous&&row.changed;row.status=row.replacement?`Change ${row.previous.replace('-','/')} → ${row.birthday.replace('-','/')}`:row.changed?'Ready to add.':'Already saved — unchanged.';return row;
 });
 const counts=new Map();for(const row of result)if(row.studentId&&row.date)counts.set(row.studentId,(counts.get(row.studentId)||0)+1);
 for(const row of result)if(row.studentId&&row.date&&counts.get(row.studentId)>1){row.error=true;row.status='Student appears more than once. Keep one birthday row.';}
 return result;
}
export function birthdayTemplate(students){
 const csv=value=>'"'+String(value).replaceAll('"','""')+'"';
 return '\uFEFFStudent name,Birthday (MM/DD)\r\n'+students.map(student=>{let name=student.name;if(/^[=+\-@\t\r]/.test(name))name="'"+name;return `${csv(name)},${csv((student.birthday||'').replace('-','/'))}`;}).join('\r\n')+'\r\n';
}
export function birthdayRosterStamp(chart){return JSON.stringify([chart.id,chart.students.map(s=>[s.id,s.name,s.birthday||''])]);}
