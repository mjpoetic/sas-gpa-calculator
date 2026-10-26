export const tipHairstyles=['fauxhawk','spikyhightop','spikyafro','long','longcurly','bob','braids','boxbraids','locs','shortlocs','twists','cornrows','ponytail','curlyponytail'];
export const supportsHairTips=hair=>tipHairstyles.includes(hair);
// Reuse the actual hair geometry so color never paints the face or the gaps between braids.
export function hairColorDetails(a,front,back,id){
 // Highlights are paused; keep saved choices for a future redesign.
 a={...a,hairHighlights:'none'};
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
 const curls=a.hairEdges==='curls',braided=['braids','boxbraids'].includes(a.hair);
 // Filled, tapered waves return a little of the hairline to the forehead.
 // Mirror the temple styling while keeping the center of the forehead open.
 const side=`<path d="M60 21C57 22 56 25 52 25C49 25 47 23 48 22C45 25 47 29 51 29C56 29 59 25 60 21Z"/><path d="M49 22C45 22 41 24 40 28C39 32 44 33 48 29C44 31 42 29 43 27C44 24 47 24 49 22Z"/><path d="M40 26C35 29 32 34 32 39C32 43 36 45 39 41C35 43 34 40 35 37C36 34 41 33 41 30C41 28 40 27 40 26Z"/><path d="M33 39C31 42 31 46 34 48C37 49 39 46 37 44C38 47 34 48 34 45C33 43 34 41 33 39Z"/>`;
 const curl=curls?'<path d="M48 23C46 25 48 28 51 27C54 26 52 23 50 24C49 25 50 26 51 25" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>':'';
 const detail='<path d="M58 23C54 29 48 27 48 25M56 23C53 27 50 26 49 24M46 24C42 25 40 29 43 30M38 29C34 33 33 38 35 40" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width=".45" stroke-linecap="round"/>';
 return `<g data-hair-detail="edges-${a.hairEdges}" data-edge-style="full-tapered-waves" transform="translate(0 ${braided?0:6})" fill="${a.hairColor}" color="${a.hairColor}"><g>${side}${curl}${detail}</g><g transform="translate(120 0) scale(-1 1)">${side}${curl}${detail}</g></g>`;
}
export function braidDecorationSVG(a){
 if(!['braids','boxbraids'].includes(a.hair)||a.braidDecoration==='none')return '';
 // Follow the outer rear strands. Render with rear hair so clothing naturally
 // hides any beads or cuffs on strands passing behind the shoulders.
 const box=a.hair==='boxbraids',count=box?19:21,dense=a.braidDecorationCoverage!=='few';
 const positions=dense?Array.from({length:count},(_,i)=>{
  // Match the rear strand's cubic curve at the decoration's height.
  const x=(box?20:25)+i*(box?80:70)/(count-1),root=37+(x-20)*.57,y=67+i%3*4,end=102+i%3*2;
  let low=0,high=1;for(let n=0;n<18;n++){const t=(low+high)/2,u=1-t,cy=u*u*u*25+3*u*u*t*39+3*u*t*t*55+t*t*t*end;if(cy<y)low=t;else high=t;}
  const t=(low+high)/2;return [x+(root-x)*(1-t)**3,y,i];
 }).filter(([, ,i])=>a.braidDecorationCoverage==='all'||i%2===0):box?[[20.5,63,0],[99.5,63,18],[20,77,0],[100,77,18]]:[[25.5,63,0],[94.5,63,20],[25,77,0],[95,77,20]];
 const ornament=a.braidDecoration==='beads'?`<g fill="${a.braidDecorationColor}" stroke="#00000038" stroke-width=".5">${[0,4,8].map(d=>`<rect x="-2.8" y="${d}" width="5.6" height="3.7" rx="1.4"/><path d="M-1 ${d+1}v1" stroke="#ffffff90"/>`).join('')}</g>`:`<rect x="-2.7" width="5.4" height="7" rx="1" fill="${a.braidDecorationColor}" stroke="#00000038" stroke-width=".6"/><path d="M-2 2h4m-4 3h4" stroke="#ffffff90" stroke-width=".7"/>`;
 return `<g data-avatar-accessory="braid-${a.braidDecoration}" data-braid-coverage="${a.braidDecorationCoverage}">${positions.map(([x,y,i])=>`<g data-decorated-strand="${i}" transform="translate(${x} ${y}) scale(${dense?.52:1} 1)">${ornament}</g>`).join('')}</g>`;
}
