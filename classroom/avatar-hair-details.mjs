export const tipHairstyles=['long','longcurly','bob','braids','boxbraids','locs','shortlocs','twists','cornrows','ponytail','curlyponytail'];
export const supportsHairTips=hair=>tipHairstyles.includes(hair);
// Reuse the actual hair geometry so color never paints the face or the gaps between braids.
export function hairColorDetails(a,front,back,id){
 if(a.hair==='bald'||(a.hairHighlights!=='on'&&!(a.hairTips==='on'&&supportsHairTips(a.hair))))return {defs:'',front:'',back:''};
 const silhouette=markup=>markup.replace(/(fill|stroke)="([^"]*)"/g,(_,attr,color)=>`${attr}="${color==='none'?'none':(color===a.skin&&color!==a.hairColor)||color==='#d994b0'?'#000':'#fff'}"`);
 const threshold={long:70,longcurly:77,braids:73,bob:61,shortlocs:58,cornrows:64,ponytail:55,curlyponytail:55}[a.hair]??85;
 let defs=`<defs><linearGradient id="${id}-tips" gradientUnits="userSpaceOnUse" x1="0" y1="${threshold}" x2="0" y2="${threshold+10}"><stop stop-color="${a.hairTipColor}" stop-opacity="0"/><stop offset=".4" stop-color="${a.hairTipColor}" stop-opacity=".75"/><stop offset="1" stop-color="${a.hairTipColor}"/></linearGradient>`;
 // Overlapping, feathered color ribbons blend with the base hair. Their gradients
 // stay in hair coordinates, then the real front/rear silhouettes clip them.
 const flowing=['long','longcurly','bob','braids','boxbraids','locs','shortlocs','twists','cornrows','ponytail','curlyponytail'].includes(a.hair);
 const full=['afro','coils','spongeafro','puffs'].includes(a.hair);
 const ribbons=flowing?[[34,60,9,64,-11,.76],[45,55,7,57,-3,.58],[77,58,9,65,10,.72],[94,64,8,56,4,.68],[62,19,16,22,5,.40]]:
 full?[[30,41,15,33,-5,.62],[52,21,14,23,-3,.48],[79,35,15,33,5,.68],[96,59,11,30,3,.58]]:
 [[38,29,11,24,-5,.66],[58,16,12,16,0,.36],[77,28,11,25,5,.70]];
 let highlightPaint='';
 if(a.hairHighlights==='on')for(const [index,[x,y,width,height,lean,opacity]] of ribbons.entries()){
  const gradient=id+'-highlight-'+index;
  defs+=`<radialGradient id="${gradient}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(${width} 0 ${lean} ${height} ${x} ${y})"><stop stop-color="${a.hairHighlightColor}" stop-opacity="${opacity}"/><stop offset=".35" stop-color="${a.hairHighlightColor}" stop-opacity="${opacity*.82}"/><stop offset=".72" stop-color="${a.hairHighlightColor}" stop-opacity="${opacity*.32}"/><stop offset="1" stop-color="${a.hairHighlightColor}" stop-opacity="0"/></radialGradient>`;
  highlightPaint+=`<rect x="-30" y="-30" width="180" height="180" fill="url(#${gradient})"/>`;
 }
 function layer(markup,part){if(!markup)return '';const mask=id+'-'+part;defs+=`<mask id="${mask}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="180" height="180" style="mask-type:luminance"><g fill="#fff">${silhouette(markup)}</g></mask>`;
 const highlights=a.hairHighlights==='on'?`<g data-hair-color="highlights" data-highlight-style="blended-gradient">${highlightPaint}</g>`:'';
 const tips=a.hairTips==='on'&&supportsHairTips(a.hair)?`<rect data-hair-color="tips" x="-20" y="${threshold}" width="160" height="${140-threshold}" fill="url(#${id}-tips)" opacity="${a.hair==='longcurly'?.78:.92}"/>`:'';
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
