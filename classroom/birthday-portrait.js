import {avatarSVG,defaultAvatar} from './avatars.mjs?v=20261025-release2';

// Work on a display copy so the student's saved outfit and expression survive.
export function birthdayAvatar(value){const avatar={...defaultAvatar(),...value,enabled:true,expression:'grin',eyes:'happy',hairAccessory:'none'};if(avatar.extra!=='star')avatar.extra='none';if(avatar.headphones==='on'||avatar.accessory==='headphones'){avatar.headphones='none';if(avatar.accessory==='headphones')avatar.accessory='none';}return avatar;}

export function paintBirthdayPortrait(container,value){
 container.innerHTML=avatarSVG(birthdayAvatar(value));
 const svg=container.firstElementChild,head=svg.querySelector('[data-avatar-layer="head"]'),hair=svg.querySelector('[data-avatar-layer="front-hair"]');
 const ns='http://www.w3.org/2000/svg',hat=document.createElementNS(ns,'g');hat.dataset.avatarAccessory='birthday-hat';hat.setAttribute('transform',hair.getAttribute('transform'));head.append(hat);
 // Sample the actual central hair silhouette, rather than a hairstyle-wide box:
 // side puffs and ponytails must not make a hat float above the crown.
 const geometry=[...hair.querySelectorAll('path,circle,ellipse,rect,polygon')];
 const hairMatrix=hair.getCTM();let crown=15;
 search:for(let y=-35;y<=34;y+=.5){for(const x of [54,60,66]){const point=new DOMPoint(x,y).matrixTransform(hairMatrix);for(const shape of geometry){const local=point.matrixTransform(shape.getCTM().inverse()),style=getComputedStyle(shape);if((style.fill!=='none'&&shape.isPointInFill(local))||(style.stroke!=='none'&&shape.isPointInStroke(local))){crown=y;break search;}}}}
 const base=crown+6,tip=base-37;
 hat.dataset.crown=String(crown);hat.innerHTML=`<path d="M40 ${base}L60 ${tip}L80 ${base}Q60 ${base+5} 40 ${base}Z" fill="#aa59cd" stroke="#fff2cc" stroke-width="1.4" stroke-linejoin="round"/><path d="M48 ${base-15}L65 ${tip+10}M43 ${base-5}L72 ${base-19}" stroke="#ffdc72" stroke-width="4"/><ellipse cx="60" cy="${base}" rx="20" ry="3" fill="#ffdc72"/><circle cx="60" cy="${tip}" r="3.5" fill="#ffdc72"/>`;
 const top=new DOMPoint(60,tip-5).matrixTransform(hat.getCTM()).matrixTransform(svg.getCTM().inverse()).y;
 const start=Math.min(0,Math.floor(top)-2);svg.setAttribute('viewBox',`0 ${start} 120 ${126-start}`);
}
