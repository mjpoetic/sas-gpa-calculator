export const avatarOptions={
 style:[['junior','Round'],['middle','Oval'],['senior','Narrow oval']],
 skin:[['#f6d7b0','Light warm'],['#edc6a4','Light tan'],['#dca878','Golden tan'],['#c78e64','Warm brown'],['#a86d49','Medium brown'],['#855337','Deep brown'],['#603d2c','Dark brown'],['#ecc5bd','Light rose']],
 hair:[['crop','Short crop'],['swoop','Side sweep'],['curls','Soft curls'],['afro','Rounded afro'],['sponge','Sponge curl high top'],['spongeafro','Sponge curl afro'],['coils','Coils'],['bob','Bob'],['long','Long hair'],['braids','Braids'],['ponytail','Ponytail'],['fade','Fade'],['curlytop','Curly top'],['waves','Waves'],['cornrows','Cornrows'],['boxbraids','Box braids'],['locs','Long locs'],['shortlocs','Short locs'],['twists','Two-strand twists'],['puffs','Afro puffs'],['bald','No hair']],
 hairColor:[['#302420','Espresso'],['#65402c','Chestnut'],['#b16b32','Copper'],['#e7c366','Golden'],['#d8d7d0','Silver'],['#9a69bc','Purple'],['#438aaf','Blue'],['#da7b99','Pink'],['#800020','Burgundy'],['#228b22','Forest green']],
 eyes:[['classic','Classic dots'],['bright','Bright eyes'],['round','Round eyes'],['happy','Happy eyes'],['sleepy','Sleepy eyes']],
 glassesColor:[['#34445c','Navy'],['#ffffff','White'],['#f4ce70','Gold'],['#bce8ef','Ice blue'],['#f09fbc','Pink'],['#800020','Burgundy'],['#228b22','Forest green']],
 expression:[['smile','Smile'],['grin','Big grin'],['wink','Wink'],['calm','Calm'],['smirk','Smirk'],['surprised','Surprised'],['angry','Angry'],['annoyed','Annoyed'],['nervous','Nervous'],['tired','Tired']],
 clothing:[['tee','T-shirt'],['hoodie','Hoodie'],['cardigan','Cardigan'],['sweater','Sweater'],['polo','Polo shirt']],
 clothingColor:[['#4c95b9','Ocean'],['#7e73bd','Lavender'],['#6da68b','Sage'],['#dfb052','Golden'],['#db8294','Coral'],['#d47957','Terracotta'],['#34445f','Navy'],['#deddd5','Cloud'],['#800020','Burgundy'],['#228b22','Forest green']],
 accessory:[['none','None'],['glasses','Glasses'],['round','Round glasses'],['sun','Sunglasses'],['headphones','Headphones']],
 extra:[['none','None'],['star','Star pin'],['flower','Flower'],['crown','Crown'],['frog','Frog cap'],['cat','Cat ears'],['antenna','Space antennae'],['baseball','Baseball cap']],
 capColor:[['#34445f','Navy'],['#800020','Burgundy'],['#228b22','Forest green'],['#4c95b9','Ocean'],['#db8294','Coral'],['#deddd5','Cloud'],['#302420','Black']],
 capBrimColor:[['#34445f','Navy'],['#800020','Burgundy'],['#228b22','Forest green'],['#4c95b9','Ocean'],['#db8294','Coral'],['#deddd5','Cloud'],['#302420','Black']],
 mouthAccessory:[['none','None'],['braces','Braces']],
 backdrop:[['#dcebf6','Sky'],['#e6def2','Lilac'],['#dceee1','Mint'],['#f4e7c9','Sunshine'],['#f4dfe5','Blush'],['#e4e8ed','Silver'],['#800020','Burgundy'],['#228b22','Forest green']]
};
export const defaultAvatar=()=>({enabled:true,style:'middle',skin:'#dca878',hair:'swoop',hairColor:'#302420',expression:'smile',eyes:'bright',glassesColor:'#34445c',clothing:'hoodie',clothingColor:'#4c95b9',accessory:'none',mouthAccessory:'none',capColor:'#800020',capBrimColor:'#34445f',extra:'none',backdrop:'#dcebf6'});
export function validateAvatar(value){if(!value||typeof value!=='object'||typeof value.enabled!=='boolean')throw new Error('Invalid student avatar.');const result={enabled:value.enabled};for(const [key,choices] of Object.entries(avatarOptions)){const legacy={capColor:'#800020',capBrimColor:'#34445f',mouthAccessory:'none',eyes:'classic',glassesColor:value.accessory==='round'?'#835832':'#34445c'};const candidate=value[key]===undefined?legacy[key]:value[key];if(!(choices[0][0].startsWith('#')?typeof candidate==='string'&&/^#[\da-f]{6}$/i.test(candidate):choices.some(([v])=>v===candidate)))throw new Error('Invalid avatar '+key+'.');result[key]=typeof candidate==='string'&&candidate.startsWith('#')?candidate.toLowerCase():candidate;}return result;}
export function randomAvatar(random=Math.random){const a=defaultAvatar();for(const [key,choices] of Object.entries(avatarOptions))a[key]=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))][0];return a;}
export function avatarSVG(value){const a=validateAvatar(value),hair=a.hairColor,shirt=a.clothingColor,skin=a.skin,headY=a.style==='junior'?46:a.style==='senior'?49:47,rx=a.style==='junior'?30:a.style==='senior'?26:28;
 // Head shape is independent of body size; legacy style IDs retain saved selections.
 const bodyTransform='translate(60 120) scale(1 1) translate(-60 -120)';
 // Hair and headwear follow the chosen head geometry.
 const hairTransform=`translate(60 ${headY}) scale(${rx/28} 1) translate(-60 -47)`;
 let scalp=a.hair==='bald'?'':'<path d="M32 47A28 32 0 0 1 88 47L85 36Q60 26 35 36Z"/>';
 // Hair detail uses nearby hair tones, never white construction lines.
 const tone=(amount)=>{const rgb=hair.slice(1).match(/../g).map(v=>parseInt(v,16));return '#'+rgb.map(v=>Math.round(amount<0?v*(1+amount):v+(255-v)*amount).toString(16).padStart(2,'0')).join('');},strand=tone(-.22),ridge=tone(.08);
 let back={long:`<path d="M27 40Q25 12 59 14Q96 14 93 57L99 100H20Z" fill="${hair}"/>`,braids:`<path d="M30 45Q25 18 59 16Q94 17 91 49" fill="${hair}"/><g fill="${hair}">${[61,72,83,94].map(y=>`<ellipse cx="29" cy="${y}" rx="10" ry="8"/><ellipse cx="91" cy="${y}" rx="10" ry="8"/>`).join('')}</g>`,ponytail:`<ellipse cx="93" cy="42" rx="16" ry="27" fill="${hair}"/><path d="M88 31l8 3" stroke="#d994b0" stroke-width="6"/>`,bob:`<path d="M26 45Q22 15 59 14Q96 15 95 49L94 80H25Z" fill="${hair}"/>`,afro:`<path d="M23 69Q5 47 24 28Q23 10 44 9Q62-2 79 12Q104 10 102 34Q119 53 95 73Z" fill="${hair}"/>`}[a.hair]||'';
 let front={crop:`<path d="M31 41Q29 16 59 17Q91 18 89 42L78 30 66 34 52 29 39 36Z"/>`,swoop:`<path d="M30 43Q26 14 60 14Q91 16 91 41L81 35 78 26Q60 46 31 46Z"/>`,curls:`<path d="M29 43Q16 28 33 23Q30 10 46 15Q54 1 66 14Q84 8 86 23Q104 25 91 44L80 36Q69 45 60 34Q47 44 39 34Z"/>`,coils:`${[29,40,52,64,76,88].map((x,i)=>`<circle cx="${x}" cy="${i===0||i===5?34:24}" r="12"/>`).join('')}`,afro:'<path d="M31 43Q29 23 60 22Q88 21 90 43L76 33 61 38 44 32Z"/>',bob:'<path d="M29 45Q27 14 60 15Q95 17 92 45L77 29 70 40 43 34 36 46Z"/>',long:'<path d="M29 46Q24 16 59 14Q96 15 92 47L79 31Q62 20 45 35L32 53Z"/>',braids:'<path d="M30 40Q28 14 60 16Q94 15 91 42Q74 33 60 25Q43 37 30 40Z"/>',ponytail:'<path d="M30 43Q26 16 60 15Q93 16 91 43L80 30 65 35 49 28 35 44Z"/>',bald:''}[a.hair];

 const cap=`<path d="M30 43Q28 15 60 15Q92 15 90 43L82 35Q60 25 38 35Z"/>`;
 if(['boxbraids','locs','twists'].includes(a.hair)){back=`<g fill="none" stroke="${hair}" stroke-width="9" stroke-linecap="round">${[23,32,41,79,88,97].map((x,i)=>`<path d="M${x} 35q${i%2?5:-5} 19 0 35t${i%2?3:-3} ${23+i%3*4}"/>`).join('')}</g>`;front=cap;}
 if(a.hair==='shortlocs')front=cap+`<g stroke="${hair}" stroke-width="8" stroke-linecap="round">${[33,44,55,66,77,87].map((x,i)=>`<path d="M${x} 24q${i%2?7:-4} 8 0 ${13+i%3*4}"/>`).join('')}</g>`;
 // Opaque, continuous caps keep the crown covered at every character age.
 const closeCap='<path d="M30 43Q25 9 60 10Q95 9 90 43L85 36Q60 23 35 36Z"/>';
 if(['fade','waves','sponge','curlytop'].includes(a.hair)){
  front=closeCap;
  if(a.hair==='fade')front+=`<path d="M31 39Q30 25 37 23L38 34Zm58 0Q90 25 83 23L82 34Z" fill="${ridge}"/><path d="M34 28Q35 9 60 10Q85 9 86 28L77 25H43Z"/>`;
  if(a.hair==='waves')front+=`<g stroke="${strand}" stroke-width="1.3" fill="none"><path d="M39 19q21-7 42 0M35 24q25-8 50 0M33 29q27-8 54 0M33 34q27-8 54 0"/></g>`;
  if(a.hair==='sponge')front+=Array.from({length:15},(_,i)=>{const x=34+(i%5)*13,y=18+Math.floor(i/5)*7;return `<circle cx="${x}" cy="${y}" r="6"/><path d="M${x-2} ${y}q0-3 3-2" fill="none" stroke="${strand}" stroke-width="1.2"/>`;}).join('');
  if(a.hair==='curlytop')front+=[ [32,23],[39,14],[49,11],[61,10],[73,12],[83,16],[89,25],[48,24],[64,22],[77,26] ].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9"/><path d="M${x-3} ${y+1}q-2-6 4-5" fill="none" stroke="${strand}" stroke-width="1.5"/>`).join('');
 }
 // A solid crown sits in front of the face; rear silhouettes alone leave scalp gaps.
 if(['afro','coils','curls','braids','boxbraids','locs','twists','shortlocs','cornrows','puffs','crop','swoop','bob','long','ponytail'].includes(a.hair))front=closeCap+front;
 if(a.hair==='braids')back=`<g fill="${hair}"><path d="M29 36Q22 41 24 57L23 85Q24 96 31 99Q38 95 36 84L36 53Zm62 0Q98 41 96 57L97 85Q96 96 89 99Q82 95 84 84L84 53Z"/></g><g fill="none" stroke="${strand}" stroke-width="1.6">${[51,60,69,78,87].map(y=>`<path d="m25 ${y} 9 5-9 5m70-10-9 5 9 5"/>`).join('')}</g>`;
 if(a.hair==='boxbraids')back=`<g fill="none" stroke="${hair}" stroke-width="5" stroke-linecap="round">${[23,30,37,83,90,97].map((x,i)=>`<path d="M${x} 32v${63+i%3*3}"/>`).join('')}</g><g stroke="${strand}" stroke-width="1">${[23,30,37,83,90,97].map(x=>`<path d="M${x-1} 48v42"/>`).join('')}</g>`;
 if(a.hair==='twists')back=`<g fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round">${[24,34,86,96].map(x=>`<path d="M${x} 34q-6 10 0 20t0 20t0 20"/>`).join('')}</g><g fill="none" stroke="${strand}" stroke-width="1.5">${[24,34,86,96].map(x=>`<path d="M${x-1} 38q5 5 0 10t0 10t0 10t0 10t0 10"/>`).join('')}</g>`;
 if(a.hair==='puffs'){back=`<circle cx="24" cy="30" r="19" fill="${hair}"/><circle cx="96" cy="30" r="19" fill="${hair}"/>`;front=closeCap;}
 if(['locs','shortlocs'].includes(a.hair)){
  const long=a.hair==='locs';
  // Separate, slightly irregular ropes replace the smooth cap and broad curls.
  const locks=[ [31,24,28,44],[39,18,35,39],[47,14,44,42],[55,13,53,37],[64,13,63,41],[73,15,75,38],[81,20,84,44],[88,28,91,47] ];
  front=closeCap+locks.map(([x,y,endX,endY],i)=>`<path d="M${x} ${y}C${x-3} ${y+7} ${endX+3} ${endY-9} ${endX} ${endY}" fill="none" stroke="${strand}" stroke-width="7.4" stroke-linecap="round"/><path d="M${x} ${y}C${x-3} ${y+7} ${endX+3} ${endY-9} ${endX} ${endY}" fill="none" stroke="${hair}" stroke-width="5.5" stroke-linecap="round"/>`).join('');
  back=long?`<g fill="none" stroke-linecap="round">${[20,27,34,41,79,86,93,100].map((x,i)=>{const end=88+(i%3)*7,d=`M${x+(x<60?5:-5)} 27C${x-3} 46 ${x+3} 65 ${x+(i%2?2:-2)} ${end}`;return `<path d="${d}" stroke="${strand}" stroke-width="7.5"/><path d="${d}" stroke="${hair}" stroke-width="5.8"/>`;}).join('')}</g>`:`<g fill="${hair}"><ellipse cx="29" cy="43" rx="4" ry="8"/><ellipse cx="91" cy="43" rx="4" ry="8"/></g>`;
 }
 if(a.hair==='cornrows'){
  front=closeCap;
  // Scalp channels separate five raised braids running back from the hairline.
  front+=`<g fill="none" stroke="${skin}" stroke-width="1.5" stroke-linecap="round">${[40.5,53.5,66.5,79.5].map(x=>`<path d="M${60+(x-60)*.63} ${12+Math.abs(x-60)*.12}Q${x} 23 ${x} ${33+Math.abs(x-60)*.16}"/>`).join('')}</g>`;
  for(const x of [34,47,60,73,86]){const topX=60+(x-60)*.65,topY=12+Math.abs(x-60)*.16,endY=32+Math.abs(x-60)*.22;
   front+=`<path d="M${topX} ${topY}Q${x} 22 ${x} ${endY}" fill="none" stroke="${strand}" stroke-width="6" stroke-linecap="round"/><path d="M${topX} ${topY}Q${x} 22 ${x} ${endY}" fill="none" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>`;
   for(let i=0;i<5;i++){const t=(i+.6)/5,u=1-t,px=u*u*topX+2*u*t*x+t*t*x,py=u*u*topY+2*u*t*22+t*t*endY;front+=`<path d="m${px-1.6} ${py-1} 3.2 1.4-1.6 1.1" fill="none" stroke="${ridge}" stroke-width=".8" stroke-linecap="round"/>`;}
  }
  back=`<g fill="none" stroke="${hair}" stroke-width="3.2" stroke-linecap="round"><path d="M36 33Q32 57 37 76L39 84M84 33Q88 57 83 76L81 84"/></g>`;
 }
 if(a.hair==='afro'){
  // A rounded halo of tightly packed hair, rather than large curl lobes.
  const silhouette='<ellipse cx="60" cy="39" rx="47" ry="37"/>';
  const edge=Array.from({length:38},(_,i)=>{const t=i*Math.PI*2/38;return `<circle cx="${60+45*Math.cos(t)}" cy="${39+35*Math.sin(t)}" r="2.5"/>`;}).join('');
  back=`<g fill="${hair}">${silhouette}${edge}</g>`;
  front='<path d="M13 40C11 17 32 2 60 2S109 17 107 40L94 53 87 38 83 32Q60 26 37 32L33 38 26 53Z"/>';
  const texture=[];for(let row=0;row<8;row++)for(let col=0;col<13;col++){const x=17+col*7+(row%2)*3+Math.sin(row*7+col)*1.2,y=9+row*8+Math.cos(col*5+row)*1.6;if(((x-60)/43)**2+((y-39)/32)**2>1||(y>27&&x>29&&x<91))continue;texture.push(`<path d="M${x-1} ${y+1}q-2-3 1-3q3 0 1 3" fill="none" stroke="${tone(.045)}" stroke-width=".7"/>`);}front+=texture.join('');
 }
 if(a.hair==='twists'){
  // Two alternating strands form each rope; roots sit in visible scalp sections.
  const twist=(x,y,endX,endY,width=5)=>{
   const length=endY-y,steps=Math.max(3,Math.round(length/4)),point=t=>({x:x+(endX-x)*t+Math.sin(t*Math.PI)*1.2,y:y+length*t});
   let out=`<path d="M${x} ${y}Q${(x+endX)/2+2} ${(y+endY)/2} ${endX} ${endY}" fill="none" stroke="${strand}" stroke-width="${width+1}" stroke-linecap="round"/>`;
   for(let i=0;i<steps;i++){const a=point(i/steps),b=point((i+1)/steps),r=width*.27*(1-i/steps*.3);for(const side of [i%2?1:-1,i%2?-1:1])out+=`<path d="M${a.x+side*r} ${a.y}Q${(a.x+b.x)/2-side*r*1.5} ${(a.y+b.y)/2} ${b.x-side*r} ${b.y}" fill="none" stroke="${side===1?hair:tone(.075)}" stroke-width="${width*.52}" stroke-linecap="round"/>`;}
   return out;
  };
  back=[ [32,29,18,90],[37,24,25,98],[42,21,33,93],[46,23,39,87],[74,23,81,89],[78,21,88,96],[83,25,96,99],[88,30,102,90] ].map(p=>twist(...p)).join('');
  front=closeCap+`<g fill="none" stroke="${skin}" stroke-width="1.2" stroke-linecap="round"><path d="M60 12v18M40 20q20-7 40 0M33 29q27-8 54 0M48 15l-7 18m30-18 8 18"/></g>`;
  front+=[ [42,16,30,39],[51,14,41,33],[57,15,53,30],[64,15,66,31],[70,14,78,34],[79,17,90,41] ].map(p=>twist(...p,4.4)).join('');
  front+=twist(31,36,26,88,4.5)+twist(89,36,94,92,4.5);
 }
 if(a.hair==='braids'){
  const braid=(x,start,end,side)=>{
   const tip=x+side*3,root=x<60?Math.max(33,x+9):Math.min(87,x-9);
   const point=t=>{const u=1-t;return {x:u*u*u*root+3*u*u*t*x+3*u*t*t*(x+side*2)+t*t*t*tip,y:u*u*u*start+3*u*u*t*(start+10)+3*u*t*t*61+t*t*t*end};};
   return `<path d="M${root} ${start}C${x} ${start+10} ${x+side*2} 61 ${tip} ${end}" fill="none" stroke="${hair}" stroke-width="4.2" stroke-linecap="round"/>`+Array.from({length:Math.floor((end-start)/5)},(_,i)=>{const p=point((i+.5)/Math.floor((end-start)/5));return `<path d="m${p.x-.8} ${p.y-1} 1.6 1-.1 1" fill="none" stroke="${strand}" stroke-width=".7"/>`;}).join('')+`<path d="M${tip} ${end}q${side*5} 4 0 8t0 8t${side*2} 8" fill="none" stroke="${hair}" stroke-width="3.5" stroke-linecap="round"/>`;
  };
  back=[20,25,30,35,40,80,85,90,95,100].map((x,i)=>braid(x,29,77+i%3*4,x<60?-1:1)).join('');
  front='<path d="M30 42Q27 11 60 12Q93 11 90 42L83 33Q70 28 60 35Q50 28 37 33Z"/>';
  front+=`<g fill="none" stroke="${skin}" stroke-width=".75" stroke-linecap="round"><path d="M60 13v20"/>${[17,22,27].map((y,i)=>`<path d="M58 ${y+3}Q${43-i*3} ${y-1} ${34-i} ${y+12}M62 ${y+3}Q${77+i*3} ${y-1} ${86+i} ${y+12}"/>`).join('')}</g>`;
  front+=braid(31,36,78,-1)+braid(89,36,80,1);
 }
 if(['fade','waves','curlytop','sponge'].includes(a.hair)){
  scalp='';back='';
  const blend=t=>{const h=hair.slice(1).match(/../g).map(v=>parseInt(v,16)),s=skin.slice(1).match(/../g).map(v=>parseInt(v,16));return '#'+h.map((v,i)=>Math.round(s[i]+(v-s[i])*t).toString(16).padStart(2,'0')).join('');};
  const croppedTop='<path d="M35 35C31 20 39 8 60 8S89 20 85 35H82V31Q60 29 38 31V35Z"/>';front='';
  const edge=y=>60-28*Math.sqrt(1-((y-47)/32)**2);
  for(let i=0;i<9;i++){const y=28+i*2.2,next=y+2.4,left=edge(y),bottom=edge(next),w=5.6-i*.45;front+=`<path d="M${left} ${y}H${left+w}L${bottom+w-.4} ${next}H${bottom}ZM${120-left} ${y}H${120-left-w}L${120-bottom-w+.4} ${next}H${120-bottom}Z" fill="${blend(.85-i*.09)}"/>`;}
  front+=croppedTop;
  front+=Array.from({length:32},(_,i)=>{const x=42+i%8*5,y=19+Math.floor(i/8)*2.5;return `<circle cx="${x}" cy="${y}" r=".55" fill="${ridge}"/>`;}).join('');
  if(a.hair==='waves'){
   front+='<path d="M32 35C29 20 37 7 60 7S91 20 88 35L84 38 81 32Q60 29 39 32L36 38Z"/>';
   const rows=[[45,75,12],[39,81,16.5],[35,85,21],[34,86,25.5],[37,83,30]];
   front+=rows.map(([left,right,y])=>{const step=(right-left)/4;let d=`M${left} ${y}`;for(let i=0;i<4;i++){const x=left+i*step;d+=`C${x+step/3} ${y-2.1} ${x+2*step/3} ${y+2.1} ${x+step} ${y}`;}return `<path d="${d}" fill="none" stroke="${strand}" stroke-width="1.5" stroke-linecap="round"/><path d="${d}" transform="translate(0 1.1)" fill="none" stroke="${ridge}" stroke-width=".6" stroke-linecap="round"/>`;}).join('');
  }
  if(a.hair==='curlytop')front+=[ [33,25],[38,18],[46,14],[55,13],[65,12],[75,15],[83,20],[87,27],[44,25],[55,24],[67,24],[77,28] ].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%3===0?6.8:7.5}"/><path d="M${x-3} ${y+1}q-2-6 3-5q5 1 1 5q-2 2-3-.5" fill="none" stroke="${strand}" stroke-width="1.3" stroke-linecap="round"/>`).join('');

 }
 if(a.hair==='boxbraids'){
  const braid=(x,y,endX,endY)=>{const steps=Math.round((endY-y)/4),point=t=>({x:x+(endX-x)*t,y:y+(endY-y)*t});return `<path d="M${x} ${y}L${endX} ${endY}" fill="none" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>`+Array.from({length:steps},(_,i)=>{const p=point((i+.5)/steps);return `<path d="m${p.x-1.2} ${p.y-1.2} 2.4 1.2-2.4 1.2" fill="none" stroke="${strand}" stroke-width="1" stroke-linecap="round"/>`;}).join('');};
  back=[ [35,25,19,99],[39,22,26,105],[44,24,33,100],[48,25,40,95],[72,25,80,96],[76,24,87,103],[81,22,94,106],[85,25,101,99] ].map(p=>braid(...p)).join('');
  front=closeCap+`<g fill="none" stroke="${skin}" stroke-width="1.2" stroke-linecap="round"><path d="M60 12v20M46 15l-4 19m32-19 4 19M35 24q25-10 50 0M32 34q28-10 56 0"/></g>`;
  front+=[ [42,22,30,43],[52,28,43,39],[68,28,77,39],[78,22,90,43],[32,35,26,96],[88,35,94,100] ].map(p=>braid(...p)).join('');
 }
 if(['locs','shortlocs'].includes(a.hair)){
  const long=a.hair==='locs',end=long?105:72;
  const lock=(x,y,toX,toY,width=4.4)=>`<path d="M${x} ${y}C${x-3} ${y+14} ${toX+2} ${toY-17} ${toX} ${toY}" fill="none" stroke="${strand}" stroke-width="${width+1}" stroke-linecap="round"/><path d="M${x} ${y}C${x-3} ${y+14} ${toX+2} ${toY-17} ${toX} ${toY}" fill="none" stroke="${hair}" stroke-width="${width}" stroke-linecap="round"/>`;
  back=Array.from({length:16},(_,i)=>{const left=i<8,k=i%8;return lock(left?36+k*2.8:84-k*2.8,22+k%3*2,left?(long?16:23)+k*(long?3.6:2.8):(long?104:97)-k*(long?3.6:2.8),end+(k%3-1)*5,4.5);}).join('');
  front='<path d="M29 45Q24 13 59 12Q91 10 92 43L85 39Q83 27 75 24Q52 25 33 45Z"/>';
  // Swept locs fall from an off-center part, leaving the face readable.
  front+=Array.from({length:8},(_,i)=>{const x=72-i*5;return `<path d="M${75-i*2.5} ${14+i*.8}Q${x-13} ${10+i*1.8} ${29+i*1.8} ${39+i*.5}" fill="none" stroke="${strand}" stroke-width="5.5" stroke-linecap="round"/><path d="M${75-i*2.5} ${14+i*.8}Q${x-13} ${10+i*1.8} ${29+i*1.8} ${39+i*.5}" fill="none" stroke="${hair}" stroke-width="3.8" stroke-linecap="round"/>`;}).join('');
  front+=lock(31,37,24,long?100:71,4.1)+lock(35,40,32,long?96:68,3.8)+lock(85,32,94,long?103:73,4.1)+lock(89,37,88,long?98:69,3.8);
 }
 if(a.hair==='coils'){
  back=`<g fill="${hair}"><ellipse cx="60" cy="39" rx="40" ry="33"/>${Array.from({length:32},(_,i)=>{const t=i*Math.PI/16;return `<circle cx="${60+38*Math.cos(t)}" cy="${39+31*Math.sin(t)}" r="3.2"/>`;}).join('')}</g>`;
  front='<path d="M23 43Q18 8 59 8Q101 8 97 44L88 51 80 35Q60 28 39 35L31 51Z"/>';
  for(let row=0;row<7;row++)for(let col=0;col<12;col++){const x=24+col*6.4+(row%2)*2.6,y=10+row*7+Math.sin(col*3+row)*1.1;if(((x-60)/38)**2+((y-38)/31)**2>1||(y>31&&x>34&&x<86))continue;front+=`<circle cx="${x}" cy="${y}" r="4.7"/><path d="M${x-2} ${y+1}q-2-4 2-4q4 1 1 4q-2 1-2-1" fill="none" stroke="${strand}" stroke-width="1.1" stroke-linecap="round"/>`;}
 }
 if(['sponge','spongeafro'].includes(a.hair)){
  const afro=a.hair==='spongeafro';
  if(afro){back='';front='<path d="M24 43C17 24 28 3 60 3S103 24 96 43L88 44 84 33Q60 29 36 33L32 44Z"/>';}
  else front+='<path d="M35 35C35 25 30 16 35 8Q60-1 85 8C90 16 85 25 85 35L80 32Q60 29 40 32Z"/>';
  // Dense small sponge coils follow each silhouette rather than forming a grid.
  for(let row=0;row<6;row++)for(let col=0;col<12;col++){
   const x=(afro?25:32)+col*(afro?6.3:5.1)+(row%2)*2.2,y=7+row*5.5+Math.sin(col*2.7+row)*1.1;
   if(afro?(((x-60)/36)**2+((y-26)/24)**2>1||(y>30&&x>35&&x<85)):(Math.abs(x-60)>28-(y-7)*.23||y>29||((x-60)/30)**2+((y-22)/20)**2>1))continue;
   front+=`<circle cx="${x}" cy="${y}" r="${afro?3.6:3.3}"/><path d="M${x-1.3} ${y+.7}q-1.4-2.6 1.2-2.6q2.5.5.8 2.5" fill="none" stroke="${strand}" stroke-width=".9" stroke-linecap="round"/>`;
  }
 }
 const eye=x=>(a.eyes==='sleepy'||['tired','annoyed'].includes(a.expression))?`<path d="M${x-5} 49q5 1 10 0q0 6-5 6t-5-6Z" fill="#fffaf4"/><ellipse cx="${x}" cy="51.5" rx="2.4" ry="2.5"/><path d="M${x-5} 49q5 1 10 0" fill="none" stroke="#332d35" stroke-width="1.5" stroke-linecap="round"/>`:a.eyes==='happy'?`<path d="M${x-5} 50q5-7 10 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M${x-5} 50q5-7 10 0" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>`:a.eyes==='classic'?`<ellipse cx="${x}" cy="49" rx="3" ry="5"/>`:`<ellipse cx="${x}" cy="49" rx="${a.eyes==='round'?6:5}" ry="6.5" fill="#fffaf4"/><ellipse cx="${x}" cy="49.5" rx="3" ry="4.5"/><circle cx="${x-1}" cy="47.5" r="1.2" fill="#fff"/>`;
 const eyes=eye(47)+(a.expression==='wink'?'<path d="m69 50 7-2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="m69 50 7-2" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>':eye(73));
 let mouth=a.expression==='smirk'?'<path d="M53 64Q65 69 71 59" fill="none" stroke="#633d3c" stroke-width="2.5" stroke-linecap="round"/><path d="m67 38 10 2" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>':a.expression==='grin'?'<path d="M49 61Q60 76 71 61Z" fill="#633d3c"/><path d="M51 61h18l-3 4H54Z" fill="#fff"/>':a.expression==='calm'?'<path d="M55 64h10" stroke="#633d3c" stroke-width="2" stroke-linecap="round"/>':'<path d="M52 61Q60 69 68 61" fill="none" stroke="#633d3c" stroke-width="2.5" stroke-linecap="round"/>';
 const moods={surprised:'<ellipse cx="60" cy="64" rx="4" ry="5" fill="#633d3c"/>',angry:'<path d="M53 66q7-7 14 0" fill="none" stroke="#633d3c" stroke-width="2.3" stroke-linecap="round"/>',annoyed:'<path d="m54 65 12-2" stroke="#633d3c" stroke-width="2.3" stroke-linecap="round"/>',nervous:'<path d="M50 61q10-3 20 0v6H50Z" fill="#fffaf4" stroke="#633d3c" stroke-width="1.5"/><path d="M55 61v5m5-5v5m5-5v5" stroke="#a1a7ad" stroke-width=".8"/>',tired:'<ellipse cx="60" cy="65" rx="3.5" ry="4.5" fill="#633d3c"/>'};
 if(moods[a.expression])mouth=moods[a.expression];
 const brows={surprised:'M41 38q6-6 12 0m14 0q6-6 12 0',angry:'m41 38 12 5m14 0 12-5',annoyed:'m41 39 12 3m14-5 12 1',nervous:'m41 40 12-4m14 0 12 4',tired:'m41 41 12-1m14 0 12 1'};
 let moodDetails='';if(brows[a.expression])moodDetails+=`<path d="${brows[a.expression]}" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>`;
 if(a.expression==='nervous')moodDetails+='<path d="M87 37q-5 7-1 8q5 0 1-8" fill="#7bc6e9"/>';
 if(a.mouthAccessory==='braces')mouth='<path d="M48 60Q60 77 72 60Z" fill="#693e43"/><path d="M50 61h20l-3 7H53Z" fill="#fff"/><path d="M51 64h18" stroke="#7d8b98" stroke-width="1.4"/>'+[54,58,62,66].map(x=>`<rect x="${x-1}" y="62" width="2.5" height="4" rx=".5" fill="#aab7c4" stroke="#697989" stroke-width=".4"/>`).join('');
 const accessory={none:'',glasses:`<g fill="none" stroke="${a.glassesColor}" stroke-width="3"><rect x="35" y="42" width="23" height="17" rx="5"/><rect x="63" y="42" width="23" height="17" rx="5"/><path d="M58 47h5M31 46h4m51 0h4"/></g>`,round:`<g fill="none" stroke="${a.glassesColor}" stroke-width="2.5"><circle cx="47" cy="50" r="12"/><circle cx="74" cy="50" r="12"/><path d="M59 48h3"/></g>`,sun:`<g fill="#25333e" stroke="${a.glassesColor}" stroke-width="2.5" stroke-linejoin="round"><path d="M34 42Q45 40 57 43L55 53Q54 60 45 59Q36 59 35 52Z"/><path d="M86 42Q75 40 63 43L65 53Q66 60 75 59Q84 59 85 52Z"/></g><path d="M57 46q3-2 6 0M31 44h4m50 0h4" fill="none" stroke="${a.glassesColor}" stroke-width="2.5" stroke-linecap="round"/><path d="m39 45 8-1m26 0 8 1" stroke="#b2c9d5" stroke-width="1.4" stroke-linecap="round"/>`,headphones:'<path d="M25 46Q23 12 60 12Q97 12 95 46" fill="none" stroke="#3b526a" stroke-width="7"/><rect x="21" y="40" width="12" height="23" rx="6" fill="#8596c7"/><rect x="87" y="40" width="12" height="23" rx="6" fill="#8596c7"/>'}[a.accessory];
 const extra={baseball:`<path d="M30 34L33 19C35 11 47 7 60 7S85 11 87 19L90 34Q60 29 30 34Z" fill="${a.capColor}"/><path d="M48 9Q41 18 42 31M72 9Q79 18 78 31M60 8v6" fill="none" stroke="#00000022" stroke-width=".8"/><ellipse cx="60" cy="7.5" rx="2" ry="1.2" fill="${a.capColor}"/><path d="M32 32Q60 28 88 32L92 38Q60 34 28 38Z" fill="${a.capBrimColor}"/><path d="M31 36Q60 32 89 36" fill="none" stroke="#00000030" stroke-width=".7"/><path d="M33 32Q60 28 87 32" fill="none" stroke="#00000025" stroke-width=".8"/>`,none:'', star:'<path d="m85 85 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#f8d264" stroke="#ba8c3f"/>',flower:'<g fill="#f3c565"><circle cx="84" cy="25" r="7"/><circle cx="94" cy="30" r="7"/><circle cx="91" cy="40" r="7"/><circle cx="80" cy="40" r="7"/><circle cx="77" cy="30" r="7"/></g><circle cx="86" cy="33" r="6" fill="#9b673f"/>',crown:'<path d="m33 25-3-18 17 10L60 3l12 14L90 7l-4 18Z" fill="#f4cd5d" stroke="#c79a3d" stroke-width="2"/><circle cx="60" cy="18" r="3" fill="#d77a9e"/>',frog:'<path d="M25 35Q25 14 60 13Q95 14 95 35Z" fill="#71af73"/><ellipse cx="60" cy="35" rx="39" ry="6" fill="#86c06f"/><circle cx="40" cy="16" r="10" fill="#92c783"/><circle cx="79" cy="16" r="10" fill="#92c783"/><circle cx="40" cy="14" r="5" fill="#fff"/><circle cx="79" cy="14" r="5" fill="#fff"/><circle cx="40" cy="14" r="2.5" fill="#334039"/><circle cx="79" cy="14" r="2.5" fill="#334039"/>',cat:'<path d="m30 29-4-24 23 14m23 0L95 5l-4 25" fill="#8a79a8" stroke="#65517d" stroke-width="3"/><path d="m33 19-2-7 9 5m40 0 9-5-2 8" stroke="#e1a4b6" stroke-width="4"/>',antenna:'<path d="m42 24-5-13m41 13 5-13" stroke="#536c87" stroke-width="3"/><circle cx="35" cy="9" r="6" fill="#dc8cb6"/><circle cx="85" cy="9" r="6" fill="#7baed6"/>'}[a.extra];
 const clothing=a.clothing==='polo'?'<path d="m44 80 16 9 16-9-5 16-11-7-11 7Z" fill="#ffffffaa"/><path d="M60 89v20" stroke="#ffffff66" stroke-width="3"/><circle cx="60" cy="96" r="1.3" fill="#fff"/><circle cx="60" cy="103" r="1.3" fill="#fff"/>':a.clothing==='hoodie'?'<path d="M42 79Q60 99 78 79L71 101H49Z" fill="#ffffff28"/><path d="m50 90-1 19m21-19 1 19" stroke="#f4f1e5" stroke-width="2"/><path d="M43 113h34" stroke="#0002" stroke-width="2"/>':a.clothing==='cardigan'?'<path d="m45 79 15 16 15-16-8 41H53Z" fill="#f6eee0"/><path d="M60 94v26" stroke="#8a8279" stroke-width="2"/>':a.clothing==='sweater'?'<path d="M43 81Q60 96 77 81M25 115h70" fill="none" stroke="#ffffff66" stroke-width="4"/>':'<path d="M46 80Q60 93 74 80" fill="none" stroke="#ffffff66" stroke-width="4"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><rect width="120" height="120" rx="28" fill="${a.backdrop}"/><g data-avatar-layer="rear-hair" transform="${hairTransform}">${back}</g><g data-avatar-layer="body" transform="${bodyTransform}"><path d="M18 126v-19Q18 83 45 79h30q27 4 27 28v19Z" fill="${shirt}"/><path d="M51 70h18v13Q60 93 51 83Z" fill="${skin}"/><path d="M51 73h18v7q-9 5-18 0Z" fill="#00000012"/>${clothing}</g><ellipse cx="31" cy="51" rx="6" ry="9" fill="${skin}"/><ellipse cx="89" cy="51" rx="6" ry="9" fill="${skin}"/><ellipse cx="60" cy="${headY}" rx="${rx}" ry="32" fill="${skin}"/><ellipse cx="41" cy="60" rx="6" ry="3" fill="#df8e8645"/><ellipse cx="79" cy="60" rx="6" ry="3" fill="#df8e8645"/><g data-avatar-layer="front-hair" transform="${hairTransform}" fill="${hair}">${scalp}${front}</g><g fill="#332d35">${eyes}</g>${mouth}${moodDetails}${accessory}<g transform="${a.extra==='star'?bodyTransform:hairTransform}">${extra}</g></svg>`;
}
