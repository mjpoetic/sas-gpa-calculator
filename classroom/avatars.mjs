import {avatarMaskSVG} from './avatar-masks.mjs?v=20261024-release4';
import {hairColorDetails,hairOrnamentSVG,supportsHairTips} from './avatar-hair-details.mjs?v=20261024-release4';
export {supportsHairTips};
import {teacherClothing,layeredClothingSVG,shortSleevesSVG,backpackSVG,facialHairSVG,teacherPropsSVG,positionGlassesSVG,glassesStrapSVG} from './avatar-props.mjs?v=20261024-release4';
export {teacherClothing};
export const accessoryColorDefaults={"sunglassLensColor":"#25333e","frogEyeWhiteColor":"#ffffff","headphoneBandColor":"#3b526a","headphoneCupColor":"#8596c7","headphonePadColor":"#263445","starColor":"#f8d264","starEdgeColor":"#ba8c3f","flowerColor":"#f3c565","flowerCenterColor":"#9b673f","flowerLeafColor":"#6c9b69","flowerBandColor":"#6c8252","catBandColor":"#65517d","catEarColor":"#8a79a8","catInnerColor":"#e1a4b6","antennaStemColor":"#536c87","antennaLeftColor":"#dc8cb6","antennaRightColor":"#7baed6","crownColor":"#f4cd5d","crownEdgeColor":"#c79a3d","crownGemColor":"#d77a9e","frogColor":"#71af73","frogBrimColor":"#86c06f","frogBumpColor":"#92c783","frogEyeColor":"#334039"};
const accessoryPalette=[['#302420','Espresso'],['#ffffff','White'],['#34445f','Navy'],['#f4ce70','Gold'],['#f09fbc','Pink'],['#438aaf','Blue'],['#228b22','Forest green']];
const propPalette=color=>[[color,'Original'],...accessoryPalette.filter(([value])=>value!==color)];
export const teacherAvatarParts=['beardGraying','mustache','mustacheColor','facialHair','facialHairColor','wrinkles','lipstick','lipstickColor','drink','drinkColor','undershirtColor','neckwear','lanyardColor','badgeColor','teachingTool','toolColor','glassesPosition','glassesStrap','glassesStrapColor'];
const propDefaults={bracesColor:'#438aaf',bodyBuild:'medium',bodyHeight:'medium',earSize:'medium',sunglassTint:'dark',mask:'none',maskColor:'#438aaf',maskAccentColor:'#f4ce70',hairHighlights:'none',hairHighlightColor:'#e7c366',hairTips:'none',hairTipColor:'#b16b32',hairAccessory:'none',hairAccessoryColor:'#da7b99',hairAccessoryAccentColor:'#f4ce70',eyeColor:'#332d35',glassesPosition:'eyes',glassesStrap:'none',glassesStrapColor:'#34445f',backpack:'none',backpackColor:'#537ea3',backpackPocketColor:'#3b5d80',backpackStrapColor:'#34445f',undershirtColor:'#f4eee3',neckwear:'none',lanyardColor:'#438aaf',badgeColor:'#f4eee3',teachingTool:'none',toolColor:'#638eb2'};
const adultDefaults={...propDefaults,beardGraying:'none',mustache:'auto',mustacheColor:'#302420',facialHair:'none',facialHairColor:'#302420',wrinkles:'none',lipstick:'none',lipstickColor:'#b95068',drink:'none',drinkColor:'#f4eee3'};
export const avatarOptions={
 bodyBuild:[['slim','Slim'],['medium','Medium'],['broad','Broad']],
 bodyHeight:[['short','Short'],['medium','Medium'],['tall','Tall']],
 earSize:[['small','Small'],['medium','Medium'],['big','Big']],
 beardGraying:[['none','Solid color'],['light','A little gray'],['medium','Salt and pepper'],['heavy','Mostly gray']],
 mustache:[['auto','Match beard style'],['none','No mustache'],['classic','Classic'],['handlebar','Handlebar'],['english','English'],['horseshoe','Horseshoe'],['chevron','Chevron'],['walrus','Walrus'],['pencil','Pencil'],['imperial','Imperial'],['toothbrush','Toothbrush'],['dali','Dali'],['fumanchu','Fu Manchu']],
 mustacheColor:[['#302420','Espresso'],['#65402c','Chestnut'],['#b16b32','Copper'],['#e7c366','Golden'],['#d8d7d0','Silver']],

 sunglassTint:[['dark','Opaque'],['medium','Semi-transparent'],['light','Light tint']],
 mask:[['none','No mask'],['hero','Superhero mask'],['clown','Clown mask'],['butterfly','Butterfly mask'],['robot','Robot mask'],['medical','Medical face mask']],
 maskColor:propPalette('#438aaf'),maskAccentColor:propPalette('#f4ce70'),
 facialHair:[['none','No facial hair'],['stubble','Stubble'],['mustache','Mustache'],['classicgoatee','Goatee'],['goatee','Royal beard'],['circle','Circle beard'],['muttonchops','Mutton chops'],['chinstrap','Chin strap beard'],['chevron','Chevron mustache'],['balbo','Balbo beard'],['anchor','Anchor beard'],['shortbeard','Short beard'],['beard','Full beard'],['longbeard','Long beard']],
 facialHairColor:[['#302420','Espresso'],['#65402c','Chestnut'],['#b16b32','Copper'],['#e7c366','Golden'],['#d8d7d0','Silver']],
 wrinkles:[['none','No wrinkles'],['subtle','Soft smile lines'],['defined','Smile and forehead lines']],
 lipstick:[['none','No lipstick'],['soft','Soft lipstick'],['bold','Bold lipstick']],
 lipstickColor:[['#b95068','Rose'],['#982c40','Berry'],['#d34442','Red'],['#a76a60','Nude'],['#85486f','Plum']],
 drink:[['none','No drink'],['coffee','Coffee mug'],['tumbler','Handled water bottle']],
 drinkColor:[['#f4eee3','Cream'],['#34445f','Navy'],['#228b22','Forest green'],['#db8294','Coral'],['#4c95b9','Ocean']],
 undershirtColor:[['#f4eee3','Cream'],['#ffffff','White'],['#34445f','Navy'],['#228b22','Forest green'],['#db8294','Coral']],
 neckwear:[['none','No lanyard'],['whistle',"Coach’s whistle"],['badge','Work badge']],
 lanyardColor:propPalette('#438aaf'),
 badgeColor:propPalette('#f4eee3'),
 teachingTool:[['none','No handheld prop'],['microscope','Microscope'],['walkie','Walkie-talkie'],['clipboard','Clipboard'],['art','Art palette and paintbrush'],['basketball','Basketball'],['football','Football'],['soccer','Soccer ball'],['tennis','Tennis racket'],['calculator','Calculator'],['geometry','Geometry tools'],['bible','Bible'],['flask','Science flask'],['music','Sheet music and baton'],['history','History scroll'],['ela','Book and pencil']],
 toolColor:propPalette('#638eb2'),
 backpack:[['none','No bag'],['on','Backpack'],['purse','Purse'],['crossbody','Crossbody bag']],
 glassesPosition:[['eyes','Over my eyes'],['head','On my head'],['neck','Around my neck']],
 glassesStrap:[['none','No glasses strap'],['on','Glasses strap']],
 glassesStrapColor:propPalette('#34445f'),
 eyeColor:[['#332d35','Dark brown'],['#81552e','Light brown'],['#9a853e','Hazel'],['#5790bf','Blue'],['#658663','Green'],['#82949b','Gray']],
 backpackColor:propPalette('#537ea3'),backpackPocketColor:propPalette('#3b5d80'),backpackStrapColor:propPalette('#34445f'),
 style:[['junior','Round'],['middle','Oval'],['senior','Narrow oval']],
 skin:[['#f6d7b0','Light warm'],['#edc6a4','Light tan'],['#dca878','Golden tan'],['#c78e64','Warm brown'],['#a86d49','Medium brown'],['#855337','Deep brown'],['#603d2c','Dark brown'],['#ecc5bd','Light rose']],
 hair:[['fauxhawk','Fauxhawk'],['spikyhightop','Spiky high top'],['mohawk','Mohawk'],['spikyafro','Spiky afro'],['crop','Short crop'],['swoop','Side sweep'],['curls','Soft curls'],['afro','Rounded afro'],['sponge','Sponge curl high top'],['spongeafro','Sponge curl afro'],['coils','Coils'],['bob','Bob'],['long','Long hair'],['longcurly','Long curly hair'],['braids','Braids'],['ponytail','Ponytail'],['curlyponytail','Curly Ponytail'],['bun','High bun'],['curlybun','Braided curly bun'],['evencut','Even low cut'],['shortafro','Short curly afro'],['lowtaper','Low taper fade'],['fade','Fade'],['curlytop','Curly top'],['waves','Waves'],['cornrows','Cornrows'],['boxbraids','Box braids'],['locs','Long locs'],['shortlocs','Short locs'],['twists','Two-strand twists'],['puffs','Afro puffs'],['bald','No hair']],
 hairHighlights:[['none','No highlights'],['on','Highlights']],
 hairHighlightColor:[['#e7c366','Golden'],['#b16b32','Copper'],['#d8d7d0','Platinum'],['#da7b99','Pink'],['#9a69bc','Purple'],['#438aaf','Blue'],['#800020','Burgundy'],['#228b22','Forest green']],
 hairTips:[['none','Natural tips'],['on','Dyed tips']],
 hairTipColor:[['#b16b32','Copper'],['#e7c366','Golden'],['#d8d7d0','Platinum'],['#da7b99','Pink'],['#9a69bc','Purple'],['#438aaf','Blue'],['#800020','Burgundy'],['#228b22','Forest green']],
 hairAccessory:[['none','No hair accessory'],['bow','Hair bow'],['bows','Twin bows'],['clip','Hair clip'],['starclip','Star clip']],
 hairAccessoryColor:propPalette('#da7b99'),hairAccessoryAccentColor:propPalette('#f4ce70'),
 hairColor:[['#302420','Espresso'],['#65402c','Chestnut'],['#b16b32','Copper'],['#e7c366','Golden'],['#d8d7d0','Silver'],['#9a69bc','Purple'],['#438aaf','Blue'],['#da7b99','Pink'],['#800020','Burgundy'],['#228b22','Forest green']],
 eyes:[['classic','Classic dots'],['bright','Bright eyes'],['round','Round eyes'],['happy','Happy eyes'],['sleepy','Sleepy eyes'],['squinted','Squinted eyes']],
 glassesColor:[['#34445c','Navy'],['#ffffff','White'],['#f4ce70','Gold'],['#bce8ef','Ice blue'],['#f09fbc','Pink'],['#800020','Burgundy'],['#228b22','Forest green']],
 expression:[['smile','Smile'],['grin','Big grin'],['wink','Wink'],['calm','Calm'],['smirk','Smirk'],['surprised','Surprised'],['angry','Angry'],['annoyed','Annoyed'],['nervous','Nervous'],['tired','Tired'],['hungry','Hungry'],['satisfied','Satisfied'],['laughing','Laughing'],['silly','Silly'],['confused','Confused'],['excited','Excited'],['thinking','Thinking'],['embarrassed','Embarrassed']],
 clothing:[['tee','T-shirt'],['hoodie','Hoodie'],['cardigan','Cardigan'],['sweater','Sweater'],['polo','Polo shirt'],['denim','Jeans jacket'],['labcoat','Science coat'],['dress','Dress'],['blouse','Blouse'],['suit','Suit'],['blazer','Blazer'],['dressshirt','Dress shirt'],['vest','Sweater vest'],['turtleneck','Turtleneck']],
 clothingColor:[['#4c95b9','Ocean'],['#7e73bd','Lavender'],['#6da68b','Sage'],['#dfb052','Golden'],['#db8294','Coral'],['#d47957','Terracotta'],['#34445f','Navy'],['#deddd5','Cloud'],['#800020','Burgundy'],['#228b22','Forest green']],
 accessory:[['none','None'],['glasses','Glasses'],['round','Round glasses'],['sun','Sunglasses']],
 headphones:[['none','No headphones'],['on','Headphones'],['neck','Around the neck']],
 ...Object.fromEntries(Object.entries(accessoryColorDefaults).map(([key,color])=>[key,[[color,'Original'],...accessoryPalette.filter(([value])=>value!==color)]])),
 extra:[['none','None'],['star','Star pin'],['singleflower','Flower'],['flower','Flower crown'],['crown','Crown'],['frog','Frog cap'],['cat','Cat ears'],['antenna','Space antennae'],['baseball','Baseball cap']],
 capColor:[['#34445f','Navy'],['#800020','Burgundy'],['#228b22','Forest green'],['#4c95b9','Ocean'],['#db8294','Coral'],['#deddd5','Cloud'],['#302420','Black']],
 capBrimColor:[['#34445f','Navy'],['#800020','Burgundy'],['#228b22','Forest green'],['#4c95b9','Ocean'],['#db8294','Coral'],['#deddd5','Cloud'],['#302420','Black']],
 bracesColor:propPalette('#438aaf'),
 mouthAccessory:[['none','None'],['braces','Braces']],
 backdrop:[['#dcebf6','Sky'],['#e6def2','Lilac'],['#dceee1','Mint'],['#f4e7c9','Sunshine'],['#f4dfe5','Blush'],['#e4e8ed','Silver'],['#800020','Burgundy'],['#228b22','Forest green']]
};
export const defaultAvatar=()=>({...adultDefaults,enabled:true,style:'middle',skin:'#dca878',hair:'swoop',hairColor:'#302420',expression:'smile',eyes:'bright',glassesColor:'#34445c',clothing:'hoodie',clothingColor:'#4c95b9',accessory:'none',headphones:'none',...accessoryColorDefaults,mouthAccessory:'none',capColor:'#800020',capBrimColor:'#34445f',extra:'none',backdrop:'#dcebf6'});
export function validateAvatar(value){if(!value||typeof value!=='object'||typeof value.enabled!=='boolean')throw new Error('Invalid student avatar.');value={...value,headphones:value.headphones??(value.accessory==='headphones'?'on':'none'),accessory:value.accessory==='headphones'?'none':value.accessory,drink:value.drink==='tea'?'tumbler':value.drink};const result={enabled:value.enabled};for(const [key,choices] of Object.entries(avatarOptions)){const legacy={...adultDefaults,...accessoryColorDefaults,headphones:'none',capColor:'#800020',capBrimColor:'#34445f',mouthAccessory:'none',eyes:'classic',glassesColor:value.accessory==='round'?'#835832':'#34445c'};const candidate=value[key]===undefined?legacy[key]:value[key];if(!(choices[0][0].startsWith('#')?typeof candidate==='string'&&/^#[\da-f]{6}$/i.test(candidate):choices.some(([v])=>v===candidate)))throw new Error('Invalid avatar '+key+'.');result[key]=typeof candidate==='string'&&candidate.startsWith('#')?candidate.toLowerCase():candidate;}return result;}
export function randomAvatar(random=Math.random){const a=defaultAvatar();for(const [key,choices] of Object.entries(avatarOptions).filter(([key])=>!teacherAvatarParts.includes(key))){const available=key==='clothing'?choices.filter(([id])=>!teacherClothing.includes(id)):choices;a[key]=available[Math.min(available.length-1,Math.floor(random()*available.length))][0];}return a;}
let avatarClipSequence=0;
export function avatarSVG(value){const a=validateAvatar(value),hair=a.hairColor,shirt=a.clothingColor,skin=a.skin,headY=a.style==='junior'?46:a.style==='senior'?49:47,rx=a.style==='junior'?30:a.style==='senior'?26:28;
 // Head shape is independent of body size; legacy style IDs retain saved selections.
 const earScale={small:.75,medium:1,big:1.25}[a.earSize];
 const bodyWidth={slim:.82,medium:1,broad:1.16}[a.bodyBuild],bodyLength={short:.82,medium:1,tall:1.12}[a.bodyHeight];
 const bodyTransform=`translate(60 120) scale(${bodyWidth} ${bodyLength}) translate(-60 -120)`;
 // In a portrait, torso length and head/body proportions convey height. Keep the
 // neck joined to the shoulders and leave room for tall hair and hats.
 const headScale=a.bodyHeight==='tall'?.9:1,shoulderShift=Number((41*(1-bodyLength)).toFixed(2));
 const headTransform=`translate(60 ${79+shoulderShift}) scale(${headScale}) translate(-60 -79)`;
 // Hair and headwear follow the chosen head geometry.
 const hairTransform=`translate(60 ${headY}) scale(${rx/28} 1) translate(-60 -47)`;
 let scalp=a.hair==='bald'?'':'<path d="M32 47A28 32 0 0 1 88 47L85 36Q60 26 35 36Z"/>';
 // Hair detail uses nearby hair tones, never white construction lines.
 const tone=(amount)=>{const rgb=hair.slice(1).match(/../g).map(v=>parseInt(v,16));return '#'+rgb.map(v=>Math.round(amount<0?v*(1+amount):v+(255-v)*amount).toString(16).padStart(2,'0')).join('');},strand=tone(-.22),ridge=tone(.08);
 let back={long:`<path d="M27 40Q25 12 59 14Q96 14 93 57L99 100H20Z" fill="${hair}"/>`,braids:`<path d="M30 45Q25 18 59 16Q94 17 91 49" fill="${hair}"/><g fill="${hair}">${[61,72,83,94].map(y=>`<ellipse cx="29" cy="${y}" rx="10" ry="8"/><ellipse cx="91" cy="${y}" rx="10" ry="8"/>`).join('')}</g>`,ponytail:`<ellipse cx="93" cy="42" rx="16" ry="27" fill="${hair}"/><path d="M88 31l8 3" stroke="#d994b0" stroke-width="6"/>`,bob:`<path d="M26 45Q22 15 59 14Q96 15 95 49L94 80H25Z" fill="${hair}"/>`,afro:`<path d="M23 69Q5 47 24 28Q23 10 44 9Q62-2 79 12Q104 10 102 34Q119 53 95 73Z" fill="${hair}"/>`}[a.hair]||'';
 let front={crop:`<path d="M31 41Q29 16 59 17Q91 18 89 42L78 30 66 34 52 29 39 36Z"/>`,swoop:`<path d="M30 43Q26 14 60 14Q91 16 91 41L81 35 78 26Q60 46 31 46Z"/>`,curls:`<path d="M29 43Q16 28 33 23Q30 10 46 15Q54 1 66 14Q84 8 86 23Q104 25 91 44L80 36Q69 45 60 34Q47 44 39 34Z"/>`,coils:`${[29,40,52,64,76,88].map((x,i)=>`<circle cx="${x}" cy="${i===0||i===5?34:24}" r="12"/>`).join('')}`,afro:'<path d="M31 43Q29 23 60 22Q88 21 90 43L76 33 61 38 44 32Z"/>',bob:'<path d="M29 45Q27 14 60 15Q95 17 92 45L77 29 70 40 43 34 36 46Z"/>',long:'<path d="M29 46Q24 16 59 14Q96 15 92 47L79 31Q62 20 45 35L32 53Z"/>',braids:'<path d="M30 40Q28 14 60 16Q94 15 91 42Q74 33 60 25Q43 37 30 40Z"/>',ponytail:'<path d="M30 43Q26 16 60 15Q93 16 91 43L80 30 65 35 49 28 35 44Z"/>',bald:''}[a.hair];

 let hairFadeDefs='';
 // Faded temples stay translucent over skin; the raised center remains textured.
 if(['fauxhawk','mohawk','spikyhightop'].includes(a.hair)){
  scalp='';
  const fadeId='avatar-temple-fade-'+(++avatarClipSequence);
  if(a.hair!=='mohawk')hairFadeDefs=`<defs><clipPath id="${fadeId}-scalp"><ellipse cx="60" cy="47" rx="28" ry="32"/></clipPath><linearGradient id="${fadeId}" gradientUnits="userSpaceOnUse" x1="0" y1="21" x2="0" y2="44"><stop stop-color="${hair}" stop-opacity=".85"/><stop offset=".35" stop-color="${hair}" stop-opacity=".5"/><stop offset=".7" stop-color="${hair}" stop-opacity=".14"/><stop offset="1" stop-color="${hair}" stop-opacity="0"/></linearGradient></defs>`;
  const fade=a.hair==='mohawk'?'':`<g data-hair-detail="side-fade" clip-path="url(#${fadeId}-scalp)"><path d="M32 45Q29 26 43 19L48 20L44 31Q36 34 34 45Zm56 0Q91 26 77 19L72 20L76 31Q84 34 86 45Z" fill="url(#${fadeId})"/></g>`;
  front=`<g data-hairstyle="${a.hair}">${fade}`;
  if(a.hair==='fauxhawk')front+='<path d="M39 33Q33 28 38 23Q33 16 42 15Q40 7 49 10Q52 1 58 8Q65 0 69 9Q78 5 78 15Q87 14 82 23Q88 29 80 34Q61 26 39 33Z"/>'+[[44,21],[51,16],[60,13],[69,17],[76,23],[53,26],[65,24]].map(([x,y])=>`<path d="M${x-2} ${y+2}q-3-5 2-5t1 5" fill="none" stroke="${ridge}" stroke-width="1.5"/>`).join('');
  else if(a.hair==='spikyhightop')front+='<path d="M34 34Q29 31 33 25Q27 20 34 18Q30 11 39 13Q38 5 46 10Q49 3 54 8Q59 0 64 8Q72 1 74 10Q83 5 82 14Q92 10 87 21Q94 24 87 31L85 34Q60 27 34 34Z"/>'+[[36,24],[43,17],[53,13],[64,12],[75,16],[82,24],[48,26],[61,23],[72,27]].map(([x,y])=>`<path d="M${x-2} ${y+4}q-4-5 1-7q5-2 3 2" fill="none" stroke="${ridge}" stroke-width="1.3" stroke-linecap="round"/>`).join('');
  else front+='<path d="M49 34L48 24L51 22L48 12L54 15L56 3L61 10L66 2L67 15L73 10L70 24L73 34Q61 29 49 34Z"/>'+`<path d="M56 28L59 15M64 27L65 16" stroke="${ridge}" stroke-width="1.2"/>`;
  front+='</g>';
 }
 if(a.hair==='spikyafro'){
  scalp='';
  const spikes=Array.from({length:16},(_,i)=>{const angle=(151+i*16+(i%3-1)*2)*Math.PI/180,point=(r,offset=0)=>`${(60+Math.cos(angle+offset)*r).toFixed(2)} ${(37+Math.sin(angle+offset)*r*.86).toFixed(2)}`;return `<path d="M${point(30,-.18)}Q${point(42,-.16)} ${point(43+(i*7)%6,.035*(i%3-1))}Q${point(42,.14)} ${point(30,.19)}Z"/><path d="M${point(31)}L${point(36+(i*7)%9)}" fill="none" stroke="${ridge}" stroke-width=".8"/>`;}).join('');
  back=`<g data-hairstyle="spikyafro-rear" fill="${hair}">${spikes}<ellipse cx="60" cy="33" rx="36" ry="29"/></g>`;
  front=`<g data-hairstyle="spikyafro"><path d="M29 43Q25 12 60 12Q95 12 91 43L84 32Q60 23 36 33L32 46Z"/>${[[36,26],[46,20],[58,18],[70,20],[81,26]].map(([x,y])=>`<path d="M${x} ${y+5}q-5-7 2-9" fill="none" stroke="${ridge}" stroke-width="1.2"/>`).join('')}</g>`;
 }
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
 if(['cornrows','curlybun'].includes(a.hair)){
  front=closeCap;
  // Scalp channels separate five raised braids running back from the hairline.
  front+=`<g fill="none" stroke="${skin}" stroke-width="1.5" stroke-linecap="round">${[40.5,53.5,66.5,79.5].map(x=>`<path d="M${60+(x-60)*.63} ${12+Math.abs(x-60)*.12}Q${x} 23 ${x} ${33+Math.abs(x-60)*.16}"/>`).join('')}</g>`;
  for(const x of [34,47,60,73,86]){const topX=60+(x-60)*.65,topY=12+Math.abs(x-60)*.16,endY=32+Math.abs(x-60)*.22;
   front+=`<path d="M${topX} ${topY}Q${x} 22 ${x} ${endY}" fill="none" stroke="${strand}" stroke-width="6" stroke-linecap="round"/><path d="M${topX} ${topY}Q${x} 22 ${x} ${endY}" fill="none" stroke="${hair}" stroke-width="4.5" stroke-linecap="round"/>`;
   for(let i=0;i<5;i++){const t=(i+.6)/5,u=1-t,px=u*u*topX+2*u*t*x+t*t*x,py=u*u*topY+2*u*t*22+t*t*endY;front+=`<path d="m${px-1.6} ${py-1} 3.2 1.4-1.6 1.1" fill="none" stroke="${ridge}" stroke-width=".8" stroke-linecap="round"/>`;}
  }
  // Rear braids follow the neck; even the lowest tip clears the shoulders.
  back=`<g data-hairstyle="cornrow-tails" fill="none" stroke-linecap="round">${[0,1,2].map(i=>{
   const start=35+i*5,end=35+i*4,y=74+i%2,left=`M${start} 34C${29+i*4} 50 ${30+i*4} 64 ${end} ${y}`,right=`M${120-start} 34C${91-i*4} 50 ${90-i*4} 64 ${120-end} ${y}`;
   return `<path d="${left}" stroke="${strand}" stroke-width="3.4"/><path d="${right}" stroke="${strand}" stroke-width="3.4"/><path d="${left}" stroke="${hair}" stroke-width="2.5"/><path d="${right}" stroke="${hair}" stroke-width="2.5"/><path d="M${end-2.5} ${y-6}l1.6 1.4-1.2 1.2M${120-end+2.5} ${y-6}l-1.6 1.4 1.2 1.2" stroke="${ridge}" stroke-width=".65"/>`;
  }).join('')}</g>`;
  if(a.hair==='curlybun'){
   back='';
   const curls=[[43,14,6.5],[48,7,6.5],[59,7,7],[70,7,6.5],[77,14,7],[71,21,7],[59,19,8],[48,21,7],[60,13,6]];
   front+=`<g data-hairstyle="curlybun">${curls.map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x-3} ${y+1}q-2-5 2-5q6-1 5 4q-1 4-5 2q-2-1 0-3" fill="none" stroke="${i%2?ridge:strand}" stroke-width="1.3" stroke-linecap="round"/>`).join('')}</g>`;
  }
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
  // The braids drop vertically behind the head and torso.
  back=`<g data-hairstyle="straight-braids" fill="none" stroke-linecap="round">${[0,1,2,3].map(i=>{
   const root=34+i*4,x=27+i*3.7,end=104+i%2*3;
   const left=`M${root} 29Q${x} 37 ${x} 47V${end}`;
   const right=`M${120-root} 29Q${120-x} 37 ${120-x} 47V${end}`;
   let detail='';for(let y=50;y<end-2;y+=4.7)detail+=`<path d="M${x-.8} ${y}l1.5 1.2-1 1M${120-x+.8} ${y}l-1.5 1.2 1 1" stroke="${strand}" stroke-width=".65"/>`;
   return `<path d="${left}" stroke="${hair}" stroke-width="2.8"/><path d="${right}" stroke="${hair}" stroke-width="2.8"/>${detail}`;
  }).join('')}</g>`;
  front='<path d="M30 42Q27 11 60 12Q93 11 90 42L83 33Q70 28 60 35Q50 28 37 33Z"/>';
  front+=`<g fill="none" stroke="${skin}" stroke-width=".75" stroke-linecap="round"><path d="M60 13v20"/>${[17,22,27].map((y,i)=>`<path d="M58 ${y+3}Q${43-i*3} ${y-1} ${34-i} ${y+12}M62 ${y+3}Q${77+i*3} ${y-1} ${86+i} ${y+12}"/>`).join('')}</g>`;

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
  front+=[ [42,22,30,43],[78,22,90,43],[32,35,26,96],[88,35,94,100] ].map(p=>braid(...p)).join('');
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
 // The gathered curls stay behind the head; the swept crown leaves the face clear.
 if(a.hair==='longcurly'){
  scalp='';
  // Loose ringlets fall past the shoulders, with a swept crown and uneven ends.
  const ringlet=(x,y,length,width)=>{
   const turns=Math.ceil(length/13);let d=`M${x} ${y}`;
   for(let i=0;i<turns;i++){const top=y+i*13,end=Math.min(y+length,top+13),reach=width*(1-i/turns*.3);d+=`C${x-reach*1.5} ${top+3} ${x+reach*1.5} ${end-3} ${x} ${end}`;}
   return `<path d="${d}" fill="none" stroke="${strand}" stroke-width="${width+2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${hair}" stroke-width="${width}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ridge}" stroke-width=".85" stroke-linecap="round"/>`;
  };
  back=`<g data-hairstyle="longcurly-rear" fill="${hair}"><path d="M23 40Q15 23 34 14Q45 2 61 9Q85 3 96 26Q107 40 101 60L108 95Q111 113 96 114L86 106H34L24 115Q9 112 13 96L19 63Z"/>${[[21,35,73,6.4],[29,28,80,6.2],[92,30,80,6.5],[101,42,68,5.8]].map(args=>ringlet(...args)).join('')}</g>`;
  front=`<g data-hairstyle="longcurly"><path d="M29 45Q22 28 33 18Q45 5 62 10Q82 5 91 23Q98 34 90 46L83 35Q77 24 68 25Q56 28 47 33Q38 36 33 49Z"/>`;
  for(const [x,y,r] of [[32,28,7],[37,20,7],[46,15,7],[57,13,7],[69,14,7],[80,18,7],[88,27,7],[37,31,6],[48,25,6],[60,22,6],[76,27,6]]){
   front+=`<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x-3} ${y+2}q-3-5 1-6q6-2 6 3q0 4-4 3q-2-1 0-3" fill="none" stroke="${ridge}" stroke-width="1" stroke-linecap="round"/>`;
  }
  front+=[[28,38,69,6],[21,54,58,5],[33,64,43,4.5],[92,37,72,6],[99,55,58,5],[86,67,42,4.5]].map(args=>ringlet(...args)).join('')+'</g>';
 }
 if(a.hair==='curlyponytail'){
  scalp='';
  const curls=[];
  for(let row=0;row<7;row++)for(let col=0;col<5;col++){
   const x=80+col*6+(row%2)*2,y=20+row*7;
   if(((x-94)/17)**2+((y-42)/29)**2>1)continue;
   curls.push([x,y,4.5+(row+col)%3*.55]);
  }
  back=`<g data-hairstyle="curlyponytail" fill="${hair}"><ellipse cx="94" cy="42" rx="16" ry="28"/>${curls.map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x-2} ${y+1}q-2-4 2-4q4 0 3 3q-1 3-3 1" fill="none" stroke="${i%2?ridge:strand}" stroke-width="1" stroke-linecap="round"/>`).join('')}</g>`;
  front=`<g data-hairstyle="curlyponytail-crown"><path d="M32 46Q27 16 60 14Q93 16 88 46L83 35Q60 24 37 35Z"/><g fill="none" stroke="${ridge}" stroke-width=".85" stroke-linecap="round"><path d="M35 31Q51 17 79 24M40 27Q57 17 78 20M47 22Q62 16 74 18M35 37Q58 23 83 30"/></g></g>`;
 }
 const iris=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${a.eyeColor}"/><ellipse cx="${x}" cy="${y}" rx="${rx*.48}" ry="${ry*.7}" fill="#27252b"/>`;
 const baseEye=x=>a.expression==='hungry'?`<path d="M${x-4} 49q4-2.5 8 0" fill="none" stroke="#332d35" stroke-width="2.5" stroke-linecap="round"/>`:(a.eyes==='squinted')?`<path d="M${x-5} 49q5-3 10 0q-5 5-10 0Z" fill="#fffaf4" stroke="#332d35" stroke-width="1"/>${iris(x,49.5,2,1.6)}`:['satisfied','laughing'].includes(a.expression)?`<path d="M${x-4} 49q4 ${a.expression==='laughing'?-5:4} 8 0" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>`:(a.eyes==='sleepy'||['tired','annoyed'].includes(a.expression))?`<path d="M${x-5} 49q5 1 10 0q0 6-5 6t-5-6Z" fill="#fffaf4"/>${iris(x,51.5,2.4,2.5)}<path d="M${x-5} 49q5 1 10 0" fill="none" stroke="#332d35" stroke-width="1.5" stroke-linecap="round"/>`:a.eyes==='happy'?`<path d="M${x-5} 50q5-7 10 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M${x-5} 50q5-7 10 0" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>`:a.eyes==='classic'?`<ellipse cx="${x}" cy="49" rx="3" ry="5"/>`:`<ellipse cx="${x}" cy="49" rx="${a.eyes==='round'?6:5}" ry="6.5" fill="#fffaf4"/>${iris(x,49.5,3,4.5)}<circle cx="${x-1}" cy="47.5" r="1.2" fill="#fff"/>`;
 const eye=x=>{
  let markup=baseEye(x);
  if(a.expression==='thinking'){
   markup=markup.replaceAll(`cx="${x}" cy="49.5"`,`cx="${x+1}" cy="${a.eyes==='squinted'?49:46.8}"`).replace('cy="47.5"','cy="45"');
   if(a.eyes==='classic')markup=markup.replace(`cx="${x}" cy="49"`,`cx="${x+1}" cy="47"`);
  }
  if(a.expression==='embarrassed')markup=markup.replaceAll(`cx="${x}" cy="49.5"`,`cx="${x}" cy="${a.eyes==='squinted'?50:51}"`).replace('cy="47.5"','cy="49"');
  return markup;
 };
 const eyes=eye(47)+(['wink','silly'].includes(a.expression)?'<path d="m69 50 7-2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="m69 50 7-2" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>':eye(73));
 // A centered bun overlaps its swept-up base so every head shape stays covered.
 if(a.hair==='bun'){
  scalp='';back='';
  front=`<g data-hairstyle="bun"><path d="M39 16Q37 6 48 3Q60-1 72 3Q83 6 81 16Q81 28 60 29Q39 28 39 16Z"/><g fill="none" stroke="${ridge}" stroke-width="1.25" stroke-linecap="round"><path d="M43 12Q46 4 59 5Q73 4 77 12M43 17Q47 9 60 10Q73 9 77 17M46 22Q52 15 65 16Q72 16 74 20M49 6Q44 13 50 19M61 4Q53 11 58 18M71 6Q63 11 68 19"/></g><path d="M32 46Q29 24 43 19Q60 13 77 19Q91 24 88 46L83 35Q73 28 60 31Q47 28 37 35Z"/><g fill="none" stroke="${ridge}" stroke-width="1" stroke-linecap="round"><path d="M35 34Q39 24 49 22M40 30Q45 23 53 21M85 34Q81 24 71 22M80 30Q75 23 67 21M48 28Q54 24 58 21M72 28Q66 24 62 21"/></g><path d="M39 34q4-3 7-1m28 0q3-2 7 1" fill="none" stroke="${hair}" stroke-width="1.6" stroke-linecap="round"/></g>`;
 }
 let mouth=a.expression==='smirk'?'<path d="M53 64Q65 69 71 59" fill="none" stroke="#633d3c" stroke-width="2.5" stroke-linecap="round"/><path d="M41 40q6-4 12-1" stroke="#332d35" stroke-width="2" stroke-linecap="round"/><path d="m67 38 10 2" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>':a.expression==='grin'?'<path d="M49 61Q60 76 71 61Z" fill="#633d3c"/><path d="M51 61h18l-3 4H54Z" fill="#fff"/>':a.expression==='calm'?'<path d="M55 64h10" stroke="#633d3c" stroke-width="2" stroke-linecap="round"/>':'<path d="M52 61Q60 69 68 61" fill="none" stroke="#633d3c" stroke-width="2.5" stroke-linecap="round"/>';
 const moods={silly:'<path d="M52 61q8 5 16 0v4q-8 8-16 0Z" fill="#633d3c"/><path d="M58 64q4-2 8 0v5q0 5-4 5t-4-5Z" fill="#df8f9d"/><path d="M62 65v5" stroke="#b86579" stroke-width=".8" stroke-linecap="round"/>',confused:'<path d="M53 66q3-4 7-1t7-2" fill="none" stroke="#633d3c" stroke-width="2.3" stroke-linecap="round"/>',excited:'<path d="M49 60q11 4 22 0q-2 14-11 14T49 60Z" fill="#633d3c"/><path d="M52 62q8 2 16 0l-2 4H54Z" fill="#fffaf4"/><path d="M56 71q4-3 8 0q-4 3-8 0" fill="#d78795"/>',thinking:'<ellipse cx="63" cy="64" rx="3" ry="1.8" fill="#633d3c"/>',embarrassed:'<path d="M55 64q5 5 10 0" fill="none" stroke="#633d3c" stroke-width="2" stroke-linecap="round"/>',hungry:'<path d="M48 61Q60 64 72 61Q74 61 73 64Q70 72 60 72Q50 71 47 64Q46 61 48 61Z" fill="#633d3c"/><path d="M51 68q9 4 18-1q-3 5-9 5t-9-4" fill="#a76960"/>',satisfied:'<path d="M53 63q7 6 14 0" fill="none" stroke="#633d3c" stroke-width="2.3" stroke-linecap="round"/>',laughing:'<path d="M49 60q11 5 22 0q-1 15-11 15T49 60Z" fill="#633d3c"/><path d="M52 62q8 3 16 0l-2 4H54Z" fill="#fffaf4"/><path d="M54 72q6-6 12 0q-6 4-12 0" fill="#d78795"/>',surprised:'<ellipse cx="60" cy="64" rx="4" ry="5" fill="#633d3c"/>',angry:'<path d="M53 66q7-7 14 0" fill="none" stroke="#633d3c" stroke-width="2.3" stroke-linecap="round"/>',annoyed:'<path d="m54 65 12-2" stroke="#633d3c" stroke-width="2.3" stroke-linecap="round"/>',nervous:'<path d="M50 61q10-3 20 0v6H50Z" fill="#fffaf4" stroke="#633d3c" stroke-width="1.5"/><path d="M55 61v5m5-5v5m5-5v5" stroke="#a1a7ad" stroke-width=".8"/>',tired:'<ellipse cx="60" cy="65" rx="3.5" ry="4.5" fill="#633d3c"/>'};
 if(moods[a.expression])mouth=moods[a.expression];
 const brows={hungry:'M41 39q6-3 12-2m14-1q6-1 12 3',silly:'M41 38q6-4 12 0m15 1 10 1',confused:'M41 38q6-7 12-2m15 5 10 1',excited:'M41 37q6-5 12 0m14 0q6-5 12 0',thinking:'M41 39q6-5 12-3m14 2 12 2',embarrassed:'M42 40q5 3 10 0m16 0q5 3 10 0',surprised:'M41 38q6-6 12 0m14 0q6-6 12 0',angry:'m41 38 12 5m14 0 12-5',annoyed:'m41 39 12 3m14-5 12 1',nervous:'m41 40 12-4m14 0 12 4',tired:'m41 41 12-1m14 0 12 1'};
 let moodDetails='';if(brows[a.expression])moodDetails+=`<path d="${brows[a.expression]}" fill="none" stroke="#332d35" stroke-width="2" stroke-linecap="round"/>`;
 if(a.expression==='embarrassed')moodDetails+='<g fill="#d97881" opacity=".65"><ellipse cx="40" cy="60" rx="7" ry="3.8"/><ellipse cx="80" cy="60" rx="7" ry="3.8"/></g><path d="m36 59 1 3m3-3 1 3m38-3 1 3m3-3 1 3" stroke="#ba6571" stroke-width=".7" stroke-linecap="round"/>';
 if(a.expression==='excited')moodDetails+='<path d="m35 42 1.1 2.7 2.9 1-2.9 1L35 50l-1.1-3.3-2.9-1 2.9-1Zm50 0 1.1 2.7 2.9 1-2.9 1L85 50l-1.1-3.3-2.9-1 2.9-1Z" fill="#f4ce70" stroke="#c89f43" stroke-width=".5"/>';
 if(a.expression==='hungry')moodDetails+='<g data-avatar-detail="drool"><path d="M72 62q-2 2-6 2q-2 0-2 3v4q0 2 1.5 2t1.5-2v-1q0-1 1-1t1 1v5q0 2-1 4q-1 3 1.5 3t1.5-3q-1-2-1-4v-5q2-3 2-8Z" fill="#8bd2e9" stroke="#5eabc5" stroke-width=".5"/><path d="M66 66q3 0 4-1" fill="none" stroke="#d5f2f7" stroke-width="1" stroke-linecap="round"/></g>';
 if(a.expression==='nervous')moodDetails+='<path d="M87 37q-5 7-1 8q5 0 1-8" fill="#7bc6e9"/>';
 // Brackets follow the existing teeth instead of replacing the expression.
 if(a.mouthAccessory==='braces'&&['grin','excited','laughing','nervous'].includes(a.expression)){
  const y=a.expression==='grin'?62.5:a.expression==='nervous'?63:64;
  mouth+=`<g data-avatar-detail="braces"><path d="M53 ${y}Q60 ${y+1} 67 ${y}" fill="none" stroke="#8d99a5" stroke-width=".55"/>${[54.5,58.2,61.8,65.5].map(x=>`<rect x="${x-.8}" y="${y-.65}" width="1.6" height="1.6" rx=".35" fill="${a.bracesColor}" stroke="#788692" stroke-width=".25"/><path d="M${x-.4} ${y+.1}h.8" stroke="#e1e6eb" stroke-width=".4"/>`).join('')}</g>`;
 }

 const facialHair=facialHairSVG(a,rx);
 const aging=a.wrinkles==='none'?'':`<g data-avatar-detail="wrinkles" fill="none" stroke="#633d3c" stroke-width=".65" opacity=".42" stroke-linecap="round"><path d="M38 55l-3 1m3 1-2 2m46-4 3 1m-3 1 2 2M47 61q-3 3-2 6m28-6q3 3 2 6"/>${a.wrinkles==='defined'?'<path d="M47 31q13-3 26 0M49 34q11-2 22 0M44 72l-2 2m34-2 2 2"/>':''}</g>`;
 if(a.lipstick!=='none')mouth=`<g data-avatar-detail="lipstick"><path d="M52 62Q56 59 60 62Q64 59 68 62Q60 ${a.lipstick==='bold'?73:70} 52 62Z" fill="${a.lipstickColor}" opacity="${a.lipstick==='bold'?1:.7}"/>${mouth.replaceAll('#633d3c',a.lipstickColor)}</g>`;
 const backpack=backpackSVG(a),props=teacherPropsSVG(a);
 let accessory={none:'',glasses:`<g fill="none" stroke="${a.glassesColor}" stroke-width="3"><rect x="35" y="42" width="23" height="17" rx="5"/><rect x="63" y="42" width="23" height="17" rx="5"/><path d="M58 47h5M31 46h4m51 0h4"/></g>`,round:`<g fill="none" stroke="${a.glassesColor}" stroke-width="2.5"><circle cx="47" cy="50" r="12"/><circle cx="74" cy="50" r="12"/><path d="M59 48h3"/></g>`,sun:`<g data-avatar-detail="sunglass-lenses" fill-opacity="${{dark:1,medium:.55,light:.3}[a.sunglassTint]}" fill="${a.sunglassLensColor}" stroke="${a.glassesColor}" stroke-width="2.5" stroke-linejoin="round"><path d="M34 42Q45 40 57 43L55 53Q54 60 45 59Q36 59 35 52Z"/><path d="M86 42Q75 40 63 43L65 53Q66 60 75 59Q84 59 85 52Z"/></g><path d="M57 46q3-2 6 0M31 44h4m50 0h4" fill="none" stroke="${a.glassesColor}" stroke-width="2.5" stroke-linecap="round"/><path d="m39 45 8-1m26 0 8 1" stroke="#b2c9d5" stroke-width="1.4" stroke-linecap="round"/>`}[a.accessory];
 accessory=positionGlassesSVG(a,accessory,hairTransform);
 const bulky=['afro','coils','curls','spongeafro','puffs'].includes(a.hair),headphoneBulky=bulky&&!['baseball','frog'].includes(a.extra),bandProfile=headphoneBulky?({afro:[14,-6],coils:[20,2],curls:[22,-2],spongeafro:[19,-3],puffs:[19,10]}[a.hair]):[26,4],side=bandProfile[0];
 // Draw neck headphones last so straps and props cannot cover them. Mask the
 // band behind the face and nape while its visible side arms stay above clothing.
 const neckBandId=a.headphones==='neck'?'avatar-neck-headphones-'+(++avatarClipSequence):'';
 const neckBandMask=neckBandId?`<defs><mask id="${neckBandId}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120" style="mask-type:luminance"><rect width="120" height="120" fill="#fff"/><ellipse cx="60" cy="${headY}" rx="${rx}" ry="32" fill="#000"/><path d="M51 70h18v13Q60 93 51 83Z" fill="#000"/></mask></defs>`:'';
 const neckHeadphoneBand=a.headphones==='neck'?`<path data-headphone-band="behind-neck" mask="url(#${neckBandId})" d="M44 89C33 78 35 66 46 63Q60 58 74 63C85 66 87 78 76 89" fill="none" stroke="${a.headphoneBandColor}" stroke-width="4.5" stroke-linecap="round"/>`:'';
 const headphones=a.headphones==='neck'?`<g data-avatar-accessory="headphones" data-headphone-position="neck"><g transform="rotate(-12 49 92)"><rect x="42" y="83" width="14" height="19" rx="6" fill="${a.headphonePadColor}"/><rect x="41" y="85" width="11" height="16" rx="5" fill="${a.headphoneCupColor}"/><path d="M44 89v7" stroke="#ffffff35" stroke-width="1.3"/></g><g transform="rotate(12 71 92)"><rect x="64" y="83" width="14" height="19" rx="6" fill="${a.headphonePadColor}"/><rect x="68" y="85" width="11" height="16" rx="5" fill="${a.headphoneCupColor}"/><path d="M76 89v7" stroke="#ffffff35" stroke-width="1.3"/></g></g>`:a.headphones==='on'?`<g data-avatar-accessory="headphones" data-headphone-position="ears"><path d="M27 46L${side} 34C${side} ${bandProfile[1]} ${120-side} ${bandProfile[1]} ${120-side} 34L93 46" fill="none" stroke="${a.headphoneBandColor}" stroke-width="5" stroke-linecap="round"/><path d="M27 43v4M93 43v4" stroke="${a.headphonePadColor}" stroke-width="6"/><rect data-headphone-cup="left" x="21" y="42" width="12" height="21" rx="5" fill="${a.headphoneCupColor}"/><rect data-headphone-cup="right" x="87" y="42" width="12" height="21" rx="5" fill="${a.headphoneCupColor}"/><path d="M32 46v12M88 46v12" stroke="${a.headphonePadColor}" stroke-width="3" stroke-linecap="round"/></g>`:'';
 const glassesStrap=glassesStrapSVG(a,hairTransform);
 const extra={baseball:`<path d="M30 34L33 19C35 11 47 7 60 7S85 11 87 19L90 34Q60 29 30 34Z" fill="${a.capColor}"/><path d="M48 9Q41 18 42 31M72 9Q79 18 78 31M60 8v6" fill="none" stroke="#00000022" stroke-width=".8"/><ellipse cx="60" cy="7.5" rx="2" ry="1.2" fill="${a.capColor}"/><path d="M32 32Q60 28 88 32L92 38Q60 34 28 38Z" fill="${a.capBrimColor}"/><path d="M31 36Q60 32 89 36" fill="none" stroke="#00000030" stroke-width=".7"/><path d="M33 32Q60 28 87 32" fill="none" stroke="#00000025" stroke-width=".8"/>`,none:'', star:`<path d="m85 85 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="${a.starColor}" stroke="${a.starEdgeColor}"/>`,singleflower:`<g data-avatar-accessory="single-flower"><g fill="${a.flowerColor}"><circle cx="84" cy="25" r="7"/><circle cx="94" cy="30" r="7"/><circle cx="91" cy="40" r="7"/><circle cx="80" cy="40" r="7"/><circle cx="77" cy="30" r="7"/></g><circle cx="86" cy="33" r="6" fill="${a.flowerCenterColor}"/></g>`,flower:`<path d="M29 31Q60 13 91 31" fill="none" stroke="${a.flowerBandColor}" stroke-width="3"/><g fill="${a.flowerLeafColor}"><path d="M33 27q-12-12-13-3q5 8 13 3M87 27q12-12 13-3q-5 8-13 3"/></g>${[[37,25],[60,20],[83,25]].map(([x,y])=>`<g fill="${a.flowerColor}">${[[0,-5],[5,-1],[3,5],[-3,5],[-5,-1]].map(([dx,dy])=>`<circle cx="${x+dx}" cy="${y+dy}" r="4.2"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="3.4" fill="${a.flowerCenterColor}"/>`).join('')}`,crown:`<path d="m33 25-3-18 17 10L60 3l12 14L90 7l-4 18Z" fill="${a.crownColor}" stroke="${a.crownEdgeColor}" stroke-width="2"/><circle cx="60" cy="18" r="3" fill="${a.crownGemColor}"/>`,frog:`<path d="M25 35Q25 14 60 13Q95 14 95 35Z" fill="${a.frogColor}"/><ellipse cx="60" cy="35" rx="39" ry="6" fill="${a.frogBrimColor}"/><circle cx="40" cy="16" r="10" fill="${a.frogBumpColor}"/><circle cx="79" cy="16" r="10" fill="${a.frogBumpColor}"/><circle cx="40" cy="14" r="5" fill="${a.frogEyeWhiteColor}"/><circle cx="79" cy="14" r="5" fill="${a.frogEyeWhiteColor}"/><circle cx="40" cy="14" r="2.5" fill="${a.frogEyeColor}"/><circle cx="79" cy="14" r="2.5" fill="${a.frogEyeColor}"/>`,cat:`<g data-avatar-accessory="cat-ears"><path d="M33 31C34 7 86 7 87 31" fill="none" stroke="${a.catBandColor}" stroke-width="3" stroke-linecap="round"/><path d="M34 25Q32 16 34 4Q44 10 49 20Q41 20 34 25ZM86 25Q88 16 86 4Q76 10 71 20Q79 20 86 25Z" fill="${a.catEarColor}" stroke="${a.catBandColor}" stroke-width="2" stroke-linejoin="round"/><path d="M37 19L36 9L44 17ZM83 19L84 9L76 17Z" fill="${a.catInnerColor}"/></g>`,antenna:`<path d="m42 24-5-13m41 13 5-13" stroke="${a.antennaStemColor}" stroke-width="3"/><circle cx="35" cy="9" r="6" fill="${a.antennaLeftColor}"/><circle cx="85" cy="9" r="6" fill="${a.antennaRightColor}"/>`}[a.extra];
 let cutDefs='';
 // Close cuts share one smooth silhouette; only their texture and fade height differ.
 if(['evencut','lowtaper','fade','waves'].includes(a.hair)){
  scalp='';back='';const id='avatar-close-cut-'+(++avatarClipSequence),pattern=id+'-texture',gradient=id+'-fade',clip=id+'-shape';
  const shape='M32 48C29 30 32 13 60 13S91 30 88 48L84 46L82 34H38L36 46Z';
  const tapered=a.hair==='lowtaper',faded=a.hair!=='evencut';
  cutDefs=`<defs><pattern id="${pattern}" patternUnits="userSpaceOnUse" width="2.4" height="2.4"><rect width="2.4" height="2.4" fill="${hair}"/><circle cx=".6" cy=".6" r=".26" fill="${ridge}"/><circle cx="1.8" cy="1.8" r=".26" fill="${strand}"/></pattern>${faded?`<linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="0" y1="${tapered?38:30}" x2="0" y2="48"><stop stop-color="${skin}" stop-opacity="0"/><stop offset=".45" stop-color="${skin}" stop-opacity=".35"/><stop offset="1" stop-color="${skin}" stop-opacity=".95"/></linearGradient><clipPath id="${clip}"><path d="${shape}"/></clipPath>`:''}</defs>`;
  front=`<g data-hairstyle="${a.hair}"><path d="${shape}" fill="url(#${pattern})"/>${faded?`<g clip-path="url(#${clip})"><path d="M30 29H39V49H30ZM81 29H90V49H81Z" fill="url(#${gradient})"/></g>`:''}<path d="M36 46L38 34H82L84 46" fill="none" stroke="${strand}" stroke-width=".65" stroke-linejoin="round" ${faded?'opacity=".35"':''}/>`;
  if(a.hair==='waves'){
   const rows=[[44,76,18],[39,81,22],[36,84,26],[36,84,30]];
   front+=rows.map(([left,right,y])=>{const step=(right-left)/4;let d=`M${left} ${y}`;for(let i=0;i<4;i++){const x=left+i*step;d+=`C${x+step/3} ${y-1.6} ${x+2*step/3} ${y+1.6} ${x+step} ${y}`;}return `<path d="${d}" fill="none" stroke="${strand}" stroke-width="1.2" stroke-linecap="round"/><path d="${d}" transform="translate(0 1)" fill="none" stroke="${ridge}" stroke-width=".6" stroke-linecap="round"/>`;}).join('');
  }
  front+='</g>';
 }
 if(a.hair==='shortafro'){
  // A compact, uniformly curly crown, only slightly taller than the even low cut.
  scalp='';back='';
  const edge=Array.from({length:25},(_,i)=>{const angle=Math.PI+i*Math.PI/24;return `<circle cx="${60+29*Math.cos(angle)}" cy="${39+29*Math.sin(angle)}" r="2.1"/>`;}).join('');
  front=`<g data-hairstyle="shortafro"><path d="M30 40C28 22 39 10 60 10S92 22 90 40L86 47L82 34Q60 30 38 34L34 47Z"/>${edge}`;
  for(let row=0;row<7;row++)for(let col=0;col<12;col++){
   const x=30+col*5.4+(row%2)*2.4,y=12+row*4.7+Math.sin(col*2+row)*.7;
   if(((x-60)/29)**2+((y-39)/28)**2>1||(y>31&&x>37&&x<83))continue;
   front+=`<path d="M${x-1.2} ${y+.7}q-1.5-2.6 1.1-2.8q2.9 0 1.4 2.7q-1.2 1.3-2 .1" fill="none" stroke="${(row+col)%3?ridge:strand}" stroke-width=".9" stroke-linecap="round"/>`;
  }
  front+='</g>';
 }
 const colorDetails=hairColorDetails(a,scalp+front.replace(/<g data-hair-detail="side-fade"[^>]*>.*?<\/g>/g,''),back,'avatar-hair-color-'+(++avatarClipSequence));front+=colorDetails.front;back+=colorDetails.back;
 let hairClip=cutDefs+colorDetails.defs;
 if(['baseball','frog'].includes(a.extra)){
  const clipId='avatar-hair-'+(++avatarClipSequence);
  // Only tuck hair beneath the cap itself. A shared rectangular crop used to
  // shear off ponytails, curls and side hair well beyond the edge of the brim.
  const crown=a.extra==='baseball'
   ?'M30 34L33 19C35 11 47 7 60 7S85 11 87 19L90 34Q60 29 30 34Z'
   :'M25 35Q25 14 60 13Q95 14 95 35Z';
  hairClip+=`<defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><path clip-rule="evenodd" d="M-60-60H180V180H-60Z ${crown}"/></clipPath></defs>`;
  const underHat=markup=>`<g clip-path="url(#${clipId})">${markup}</g>`;
  back=underHat(back);front=underHat(scalp+front);scalp='';
 }
 const clothing=teacherClothing.includes(a.clothing)?layeredClothingSVG(a):a.clothing==='polo'?`<g data-avatar-clothing="polo"><path d="M49 80Q60 89 71 80L67 87L60 94L53 87Z" fill="#00000028"/><path d="M58 90h4v16h-4Z" fill="#ffffff20"/><path d="M62 92v14h-4" fill="none" stroke="#00000025" stroke-width=".7"/><path d="M48 79L51 80Q54 86 60 89L54 96L44 85ZM72 79L69 80Q66 86 60 89L66 96L76 85Z" fill="${shirt}"/><path d="M48 79L51 80Q54 86 60 89L54 96L44 85ZM72 79L69 80Q66 86 60 89L66 96L76 85Z" fill="#ffffff20" stroke="#00000024" stroke-width=".65" stroke-linejoin="round"/><path d="M47 83l7 10 4-4M73 83l-7 10-4-4" fill="none" stroke="#ffffff1c" stroke-width=".6"/><g fill="#f4f0e7" stroke="#00000035" stroke-width=".45"><circle cx="60" cy="96" r="1"/><circle cx="60" cy="102" r="1"/></g><path d="M35 86Q30 97 33 111M85 86Q90 97 87 111" fill="none" stroke="#0000001d" stroke-width=".8"/></g>`:a.clothing==='hoodie'?'<path d="M42 79Q60 99 78 79L71 101H49Z" fill="#ffffff28"/><path d="m50 90-1 19m21-19 1 19" stroke="#f4f1e5" stroke-width="2"/><path d="M43 113h34" stroke="#0002" stroke-width="2"/>':a.clothing==='cardigan'?'<path d="m45 79 15 16 15-16-8 41H53Z" fill="#f6eee0"/><path d="M60 94v26" stroke="#8a8279" stroke-width="2"/>':a.clothing==='sweater'?'<path d="M43 81Q60 96 77 81M25 115h70" fill="none" stroke="#ffffff66" stroke-width="4"/>':'<path d="M46 80Q60 93 74 80" fill="none" stroke="#ffffff66" stroke-width="4"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" data-body-build="${a.bodyBuild}" data-avatar-height="${a.bodyHeight}" aria-hidden="true" focusable="false">${hairClip}${hairFadeDefs}${neckBandMask}<rect width="120" height="120" rx="28" fill="${a.backdrop}"/><g data-avatar-layer="bag" transform="${bodyTransform}">${backpack.rear}</g><g transform="${headTransform}"><g data-avatar-layer="rear-hair" transform="${hairTransform}">${back}</g>${glassesStrap.rear}</g><g data-avatar-layer="body" transform="${bodyTransform}"><path d="M18 126v-19Q18 83 45 79h30q27 4 27 28v19Z" fill="${a.clothing==='vest'?a.undershirtColor:shirt}"/><path d="M51 70h18v13Q60 93 51 83Z" fill="${skin}"/><path d="M51 73h18v7q-9 5-18 0Z" fill="#00000012"/>${shortSleevesSVG(a)}${clothing}${backpack.straps}${props.neckwear}</g><g data-avatar-layer="head" transform="${headTransform}"><g data-avatar-detail="ears" data-ear-size="${a.earSize}"><ellipse cx="31" cy="51" rx="${6*earScale}" ry="${9*earScale}" fill="${skin}"/><ellipse cx="89" cy="51" rx="${6*earScale}" ry="${9*earScale}" fill="${skin}"/></g><ellipse cx="60" cy="${headY}" rx="${rx}" ry="32" fill="${skin}"/><ellipse cx="41" cy="60" rx="6" ry="3" fill="#df8e8645"/><ellipse cx="79" cy="60" rx="6" ry="3" fill="#df8e8645"/><g data-avatar-layer="front-hair" transform="${hairTransform}" fill="${hair}">${scalp}${front}${hairOrnamentSVG(a)}</g><g fill="#332d35">${eyes}</g>${aging}<g data-avatar-detail="facial-hair" fill="${a.facialHairColor}">${facialHair}</g>${mouth}${moodDetails}${avatarMaskSVG(a)}${a.extra==='star'?'':`<g transform="${hairTransform}">${extra}</g>`}${glassesStrap.front}${accessory}${a.headphones==='neck'?'':headphones}</g><g data-avatar-layer="body-props" transform="${bodyTransform}">${a.extra==='star'?extra:''}${props.tool}${props.drink}</g>${a.headphones==='neck'?`<g data-avatar-layer="neck-headphones" transform="${headTransform}">${neckHeadphoneBand}${headphones}</g>`:''}</svg>`;
}
