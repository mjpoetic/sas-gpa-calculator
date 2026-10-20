// Removed students drop out of a round; newly added students get a turn immediately.
export function pickerRound(students, seen = []) {
  const ids = new Set(students.map(s => s.id));
  const picked = [...new Set(Array.isArray(seen) ? seen.filter(id => ids.has(id)) : [])];
  const remaining = students.filter(s => !picked.includes(s.id));
  return {picked: remaining.length ? picked : [], remaining: remaining.length ? remaining : students};
}
