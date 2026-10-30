// Coordinated light/dark colors keep headings readable over subtle tinted cards.
export const CALENDAR_COLORS=Object.freeze({
 blue:{name:'Ocean blue',accent:'#367e9f',heading:'#286a88',dark:'#a9dcf2'},
 rose:{name:'Birthday rose',accent:'#b44561',heading:'#96374f',dark:'#ffb2c8'},
 purple:{name:'Lavender',accent:'#8054ac',heading:'#69408f',dark:'#dac0fa'},
 green:{name:'Forest green',accent:'#31836b',heading:'#246b55',dark:'#a6e2ca'},
 amber:{name:'Warm amber',accent:'#a86f25',heading:'#85541a',dark:'#f4d09a'},
 slate:{name:'Soft slate',accent:'#677b8c',heading:'#485e70',dark:'#c2d6e8'},
});
export function calendarColor(value='blue'){if(!Object.hasOwn(CALENDAR_COLORS,value))throw new Error('Choose a calendar color scheme.');return value;}
export function applyCalendarColor(node,value='blue'){
 const colors=CALENDAR_COLORS[calendarColor(value)];
 for(const [key,color] of Object.entries({accent:colors.accent,heading:colors.heading,'heading-dark':colors.dark,tint:colors.accent+'12',edge:colors.accent+'40'}))node.style.setProperty('--calendar-'+key,color);
}
