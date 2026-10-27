import {parseBirthdayRows} from './birthday-import.mjs?v=20261027-release2';
import {validateBirthday} from './celebration-date.mjs?v=20261027-release2';

export function reportNameKey(value){
 let name=String(value).normalize('NFC').trim().replace(/\s+/gu,' ');
 if(name.includes(',')){const parts=name.split(',');if(parts.length===2)name=parts[1].trim()+' '+parts[0].trim();}
 return name.toLocaleLowerCase('en');
}
const header=value=>String(value).toLowerCase().replace(/[^a-z]/g,'');
export function reportBirthday(value){
 const text=String(value).trim(),parts=text.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{4}))?$/);
 if(!parts)throw new Error('Use MM/DD or MM-DD-YYYY for birthdates.');
 const birthday=validateBirthday(`${parts[1].padStart(2,'0')}-${parts[2].padStart(2,'0')}`);
 if(parts[3]&&birthday==='02-29'){const year=Number(parts[3]);if(year%4!==0||(year%100===0&&year%400!==0))throw new Error('Invalid leap-day birthdate.');}
 return birthday;
}
export function parseSISBirthdayReport(text){
 if(typeof text!=='string'||text.length>200000)throw new Error('Use a report under 200,000 characters.');
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(line=>line.trim());
 // Printed reports have repeated Student / Grade / Birthdate groups. PDF
 // extraction supplies one visual row per line, preserving the group order.
 const pattern=/([\p{L}][\p{L}\p{M} .,'’()\-]*?)\s+(\d{1,2}|PK|KG|K)\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4})(?=\s|$)/gu;
 if(!text.includes('\t')){
  const records=[];for(const line of lines){for(const m of line.matchAll(pattern))records.push({name:m[1].trim(),grade:m[2],rawDate:m[3]});}
  if(records.length)return finish(records);
 }
 const rows=parseBirthdayRows(text,{keepHeader:true});if(!rows.length)return [];
 const headers=rows[0].map(header),groups=[];
 const isName=h=>['student','studentname','name','fullname'].includes(h),isDate=h=>['birthday','birthdaymmdd','birthdate','dateofbirth','dob'].includes(h);
 for(let i=0;i<headers.length;i++)if(isName(headers[i])||['firstname','givenname'].includes(headers[i])){
  const end=headers.findIndex((h,j)=>j>i&&(isName(h)||['firstname','givenname'].includes(h))),stop=end<0?headers.length:end;
  const date=headers.findIndex((h,j)=>j>=i&&j<stop&&isDate(h)),grade=headers.findIndex((h,j)=>j>=i&&j<stop&&['grade','gradelevel'].includes(h));
  if(date>=0)groups.push({name:i,date,grade,first:['firstname','givenname'].includes(headers[i])?i:-1,last:headers.findIndex(h=>['lastname','surname','familyname'].includes(h))});
 }
 // Also support Last Name, First Name with the date later in the row.
 if(!groups.length){const first=headers.findIndex(h=>h==='firstname'),last=headers.findIndex(h=>h==='lastname'),date=headers.findIndex(isDate);if(first>=0&&last>=0&&date>=0)groups.push({first,last,date,grade:headers.findIndex(h=>h==='grade')});}
 const records=[];
 if(groups.length){for(const cells of rows.slice(1)){if(cells.map(header).join('|')===headers.join('|'))continue;for(const g of groups){const name=g.first>=0?`${cells[g.first]||''} ${cells[g.last]||''}`.trim():cells[g.name]||'',rawDate=cells[g.date]||'';if(!name&&!rawDate)continue;records.push({name,grade:g.grade>=0?cells[g.grade]||'':'',rawDate});}}}
 else for(const cells of rows){if(cells.length===2)records.push({name:cells[0],rawDate:cells[1],grade:''});else if(cells.length===3)records.push({name:cells[0],grade:cells[1],rawDate:cells[2]});else throw new Error('Use Student, Grade, Birthdate columns, or paste the text from the birthday report.');}
 return finish(records);
}
function finish(records){
 if(records.length>1000)throw new Error('Import up to 1,000 students at a time.');
 return records.map((record,index)=>{const row={name:record.name,grade:record.grade||'',line:index+1,birthday:'',error:''};if(!row.name){row.error='Student name is missing.';return row;}if(!record.rawDate){row.empty=true;return row;}try{row.birthday=reportBirthday(record.rawDate);}catch(error){row.error=error.message;}return row;});
}
export function birthdayTargets(state){
 return [...(state.charts||[]).flatMap(chart=>chart.students.map(student=>({key:JSON.stringify(['chart',chart.id,student.id]),kind:'chart',containerId:chart.id,studentId:student.id,name:student.name,label:`Classroom: ${chart.name}`,birthday:student.birthday||''}))),...(state.studentLists||[]).flatMap(list=>list.names.map((name,index)=>({key:JSON.stringify(['list',list.id,index]),kind:'list',containerId:list.id,index,name,label:`Saved list: ${list.name}`,birthday:list.birthdays?.[index]||''})))];
}
export function previewSISBirthdays(text,state){
 const targets=birthdayTargets(state),records=parseSISBirthdayReport(text),counts=new Map();
 for(const row of records){const key=reportNameKey(row.name);counts.set(key,(counts.get(key)||0)+1);}
 return records.map(row=>{const matches=targets.filter(target=>reportNameKey(target.name)===reportNameKey(row.name));const destinations=new Map();for(const match of matches){const key=JSON.stringify([match.kind,match.containerId]);destinations.set(key,(destinations.get(key)||0)+1);}
  const ambiguous=matches.some(match=>destinations.get(JSON.stringify([match.kind,match.containerId]))>1);
  return {...row,error:row.error,duplicate:counts.get(reportNameKey(row.name))>1,ambiguous,matches:matches.map(match=>({...match,selected:!ambiguous,changed:!!row.birthday&&row.birthday!==match.birthday,replacement:!!row.birthday&&!!match.birthday&&row.birthday!==match.birthday}))};
 });
}
export function sisBirthdayStamp(state){return JSON.stringify(birthdayTargets(state));}
export function applySISBirthdays(state,rows){
 for(const row of rows){if(row.skip||row.error||!row.birthday)continue;for(const match of row.matches){if(!match.selected||!match.changed)continue;if(match.kind==='chart'){const student=state.charts.find(c=>c.id===match.containerId)?.students.find(s=>s.id===match.studentId);if(!student)throw new Error('Roster changed. Preview again.');student.birthday=row.birthday;}else{const list=state.studentLists?.find(l=>l.id===match.containerId);if(!list||list.names[match.index]!==match.name)throw new Error('Saved list changed. Preview again.');list.birthdays||=list.names.map(()=>null);list.birthdays[match.index]=row.birthday;}}}
}
