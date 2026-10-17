export const tipHairstyles=['long','bob','braids','boxbraids','locs','shortlocs','twists','cornrows','ponytail'];
export const supportsHairTips=hair=>tipHairstyles.includes(hair);
// Reuse the actual hair geometry so color never paints the face or the gaps between braids.
export function hairColorDetails(a,front,back,id){
 if(a.hair==='bald'||(a.hairHighlights!=='on'&&!(a.hairTips==='on'&&supportsHairTips(a.hair))))return {defs:'',front:'',back:''};
 const silhouette=markup=>markup.replace(/(fill|stroke)="([^"]*)"/g,(_,attr,color)=>`${attr}="${color==='none'?'none':(color===a.skin&&color!==a.hairColor)||color==='#d994b0'?'#000':'#fff'}"`);
 const threshold={long:70,braids:73,bob:61,shortlocs:58,cornrows:64,ponytail:55}[a.hair]??85;
 let defs=`<defs><linearGradient id="${id}-tips" gradientUnits="userSpaceOnUse" x1="0" y1="${threshold}" x2="0" y2="${threshold+10}"><stop stop-color="${a.hairTipColor}" stop-opacity="0"/><stop offset=".4" stop-color="${a.hairTipColor}" stop-opacity=".75"/><stop offset="1" stop-color="${a.hairTipColor}"/></linearGradient>`;
 function layer(markup,part){if(!markup)return '';const mask=id+'-'+part;defs+=`<mask id="${mask}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="180" height="180" style="mask-type:luminance"><g fill="#fff">${silhouette(markup)}</g></mask>`;
 const highlights=a.hairHighlights==='on'?`<g data-hair-color="highlights" fill="none" stroke="${a.hairHighlightColor}" stroke-width="3.5" stroke-linecap="round" opacity=".78"><path d="M42 1Q28 28 24 56L21 115M54 0Q40 20 38 40L34 115M72 0Q84 22 88 48L99 115M85 7Q99 33 102 69L104 115"/></g>`:'';
 const tips=a.hairTips==='on'&&supportsHairTips(a.hair)?`<rect data-hair-color="tips" x="-20" y="${threshold}" width="160" height="${140-threshold}" fill="url(#${id}-tips)" opacity=".92"/>`:'';
 return `<g mask="url(#${mask})">${highlights}${tips}</g>`;
 }
 const rear=layer(back,'rear'),fore=layer(front,'front');defs+='</defs>';return {defs,front:fore,back:rear};
}
export function hairOrnamentSVG(a){
 if(a.hair==='bald'||a.hairAccessory==='none')return '';
 const bulky=['afro','coils','spongeafro'].includes(a.hair),hat=['baseball','frog'].includes(a.extra),x=bulky?23:33,y=hat?43:bulky?25:a.hair==='puffs'?19:30;
 const bow=(cx,cy)=>`<g transform="translate(${cx} ${cy}) rotate(${cx<60?-15:15})"><path d="M-1 0Q-15-13-13-3Q-15 8-1 3Q15 11 13-2Q15-12 1 0Z" fill="${a.hairAccessoryColor}" stroke="#00000028" stroke-width=".8"/><path d="m-4 3-3 10 6-3 2-7m3 0 4 10 3-4-4-7" fill="${a.hairAccessoryColor}"/><path d="m-10-2 7 3m6 0 7-3" stroke="#ffffff66" stroke-width=".8"/><rect x="-3" y="-2" width="6" height="7" rx="2" fill="${a.hairAccessoryAccentColor}"/></g>`;
 const ornament=a.hairAccessory==='bow'?bow(a.hair==='bun'?60:x,a.hair==='bun'?16:y):a.hairAccessory==='bows'?bow(x,y)+bow(120-x,y):a.hairAccessory==='clip'?`<g transform="translate(${x} ${y}) rotate(-30)"><rect x="-3" y="-9" width="7" height="20" rx="3" fill="${a.hairAccessoryColor}" stroke="${a.hairAccessoryAccentColor}" stroke-width="1.2"/><path d="M.5-5V7" stroke="${a.hairAccessoryAccentColor}" stroke-width="1.1" stroke-linecap="round"/></g>`:`<g transform="translate(${x} ${y}) rotate(-15)"><path d="M0-9 3-3 10-2 5 3 6 10 0 6-6 10-5 3-10-2-3-3Z" fill="${a.hairAccessoryColor}" stroke="${a.hairAccessoryAccentColor}" stroke-width="1.3"/><path d="m-3 0 2-3" stroke="#ffffff99" stroke-width="1" stroke-linecap="round"/></g>`;
 return `<g data-avatar-accessory="hair-${a.hairAccessory}">${ornament}</g>`;
}
