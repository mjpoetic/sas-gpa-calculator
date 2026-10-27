import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/index-CzOoK3C1.js', import.meta.url), 'utf8');
function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf('function ', start + 9);
  return source.slice(start, end).replace(/const AWARD_SUBJECTS=[\s\S]*$/, '');
}
const context = vm.createContext({
  GRADE_SCALE: { A: 4, B: 3, C: 2 },
  formatDisplayName: name => name,
  extractGradesFromPageText: text => [[{ course: 'Math', grade: text.includes('lower grade') ? 'C' : 'A' }], [], [], []],
  extractAllSubjectGradesFromPageText: text => [[{ course: 'Math', grade: text.includes('lower grade') ? 'C' : 'A' }], [], [], []],
  isAllAGrades: grades => grades.every(item => item.grade === 'A'),
  isAllAorBGrades: grades => grades.every(item => ['A', 'B'].includes(item.grade)),
});
for (const name of ['parseClassPDF', 'determineHonors', 'groupHonorsByClass']) vm.runInContext(functionSource(name), context);

const card = (name, grade, teacher, extra = '') => [`Student: ${name}  School: SAS  Grade: ${grade}  Teacher: ${teacher}  School Year: 2026-2027  ${extra}`, 'Attendance: Present'];
test('mixed PDF retains each student grade and homeroom and separates certificate rosters', () => {
  const report = context.parseClassPDF([
    ...card('Zulu, Amy', '10', 'Ms. West'),
    ...card('Alpha, Ben', '3', 'Mr. East'),
    ...card('Beta, Cam', '3', 'Ms. North', 'lower grade'),
    ...card('Gamma, Dee', '3', 'Mr. East'),
  ]);
  const groups = context.groupHonorsByClass(report);
  assert.equal(groups.length, 3);
  assert.deepEqual(Array.from(groups, group => [group.grade, group.teacher]), [['3', 'Mr. East'], ['3', 'Ms. North'], ['10', 'Ms. West']]);
  assert.deepEqual(Array.from(groups[0].principalsList, student => student.name), ['Alpha, Ben', 'Gamma, Dee']);
  assert.equal(groups[1].notQualified[0].name, 'Beta, Cam');
  assert.equal(groups[2].principalsList[0].name, 'Zulu, Amy');
});
test('missing metadata stays unassigned instead of using another class teacher', () => {
  const report = context.parseClassPDF([...card('Known, A', '5', 'Ms. Known'), 'Student: Unknown, B  School: SAS  Math: A', 'Attendance: Present']);
  const student = report.students.find(student => student.name === 'Unknown, B');
  assert.equal(student.grade, '');
  assert.equal(student.teacher, '');
  assert.equal(context.groupHonorsByClass(report).length, 2);
});
test('homeroom teacher labels and kindergarten are recognized', () => {
  const report = context.parseClassPDF(['Student: Young, A  School: SAS  Grade: K  Homeroom Teacher: Ms. Green  School Year: 2026-2027', '']);
  assert.equal(report.students[0].grade, 'K');
  assert.equal(report.students[0].teacher, 'Ms. Green');
});
