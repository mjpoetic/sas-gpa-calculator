// Month/day only: no birth year or age is needed for classroom celebrations.
export function validateBirthday(value){if(typeof value!=='string'||!/^\d{2}-\d{2}$/.test(value))throw new Error('Invalid birthday.');const [m,d]=value.split('-').map(Number);if(m<1||m>12||d<1||d>new Date(2000,m,0).getDate())throw new Error('Invalid birthday.');return value;}
export function birthdayToday(value,date=new Date()){return value===`${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
