export const tipHairstyles=['fauxhawk','spikyhightop','spikyafro','long','longcurly','bob','braids','boxbraids','locs','shortlocs','twists','cornrows','ponytail','curlyponytail'];
export const supportsHairTips=hair=>tipHairstyles.includes(hair);
// Reuse the actual hair geometry so color never paints the face or the gaps between braids.
export function hairColorDetails(a,front,back,id){
 if(a.hair==='bald'||(a.hairHighlights!=='on'&&!(a.hairTips==='on'&&supportsHairTips(a.hair))))return {defs:'',front:'',back:''};
 const silhouette=markup=>markup.replace(/(fill|stroke)="([^"]*)"/g,(_,attr,color)=>`${attr}="${color==='none'?'none':(color===a.skin&&color!==a.hairColor)||color==='#d994b0'?'#000':'#fff'}"`);
 const upward=['fauxhawk','spikyhightop'].includes(a.hair),radial=a.hair==='spikyafro';
 const threshold={long:70,longcurly:77,braids:73,bob:61,shortlocs:58,cornrows:64,ponytail:55,curlyponytail:55}[a.hair]??85;
 let defs=`<defs><linearGradient id="${id}-tips" gradientUnits="userSpaceOnUse" x1="0" y1="${threshold}" x2="0" y2="${threshold+10}"><stop stop-color="${a.hairTipColor}" stop-opacity="0"/><stop offset=".4" stop-color="${a.hairTipColor}" stop-opacity=".75"/><stop offset="1" stop-color="${a.hairTipColor}"/></linearGradient>`;
 if(upward)defs=`<defs><linearGradient id="${id}-tips" gradientUnits="userSpaceOnUse" x1="0" y1="26" x2="0" y2="8"><stop stop-color="${a.hairTipColor}" stop-opacity="0"/><stop offset=".55" stop-color="${a.hairTipColor}" stop-opacity=".7"/><stop offset="1" stop-color="${a.hairTipColor}"/></linearGradient>`;
 if(radial)defs=`<defs><radialGradient id="${id}-tips" gradientUnits="userSpaceOnUse" cx="60" cy="37" r="49" gradientTransform="translate(0 5.18) scale(1 .86)"><stop offset=".58" stop-color="${a.hairTipColor}" stop-opacity="0"/><stop offset=".8" stop-color="${a.hairTipColor}" stop-opacity=".7"/><stop offset="1" stop-color="${a.hairTipColor}"/></radialGradient>`;
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
 const tips=a.hairTips==='on'&&supportsHairTips(a.hair)?`<rect data-hair-color="tips" x="-20" y="${upward||radial?-20:threshold}" width="160" height="${upward||radial?160:140-threshold}" fill="url(#${id}-tips)" opacity="${a.hair==='longcurly'?.78:.92}"/>`:'';
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

// Follow the exposed hairline; use the selected hair color for gelled baby hairs.
export function hairEdgesSVG(a){
 if(a.hair==='bald'||a.hairEdges==='none')return '';
 const curls=a.hairEdges==='curls';
 return `<g data-hair-detail="edges-${a.hairEdges}" fill="none" stroke="${a.hairColor}" stroke-width="1.5" stroke-linecap="round"><path d="M36 34C37 40 44 40 46 36M74 36C76 40 83 40 84 34"/>${curls?'<path d="M49 34c-2 6 7 9 8 4s-5-4-4-1M71 34c2 6-7 9-8 4s5-4 4-1M34 39c-4 3-2 8 1 6M86 39c4 3 2 8-1 6"/>':'<path d="M48 33Q52 40 58 35M62 35Q68 40 72 33M34 39q-3 3 0 6M86 39q3 3 0 6"/>'}</g>`;
}
export function braidDecorationSVG(a){
 if(!['braids','boxbraids'].includes(a.hair)||a.braidDecoration==='none')return '';
 // Sit on the visible outer strands, clear of the face and above the shoulders.
 const positions=a.hair==='braids'?[[27,63],[93,63],[27,77],[93,77]]:[[28,63],[92,67],[27,81],[93,85]];
 return `<g data-avatar-accessory="braid-${a.braidDecoration}">${positions.map(([x,y])=>a.braidDecoration==='beads'?`<g fill="${a.braidDecorationColor}" stroke="#00000038" stroke-width=".5">${[0,4,8].map(d=>`<rect x="${x-2.8}" y="${y+d}" width="5.6" height="3.7" rx="1.4"/><path d="M${x-1} ${y+d+1}v1" stroke="#ffffff90"/>`).join('')}</g>`:`<g><rect x="${x-2.7}" y="${y}" width="5.4" height="7" rx="1" fill="${a.braidDecorationColor}" stroke="#00000038" stroke-width=".6"/><path d="M${x-2} ${y+2}h4m-4 3h4" stroke="#ffffff90" stroke-width=".7"/></g>`).join('')}</g>`;
}
