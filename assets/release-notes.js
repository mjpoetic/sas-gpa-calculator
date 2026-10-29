import {releases} from './changelog.mjs?v=20261029-release1';
import './dialog-motion.js?v=20261029-release1';
import './disclosure-preferences.js?v=20261029-release1';
const style=document.createElement('style');style.textContent=`
button.site-version,.release-notes-trigger{background:transparent!important;border:0!important;box-shadow:none!important;color:inherit;font:inherit;cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;white-space:nowrap}
button.site-version{font:10px/1.4 Arial,sans-serif!important;min-height:24px;padding:4px 3px!important;border-radius:4px!important}
button.site-version-main{margin-inline:auto}
.release-notes-trigger{padding:0!important;min-height:24px!important;border-radius:4px!important}
button.site-version:focus-visible,.release-notes-trigger:focus-visible{outline:2px solid #65afe0;outline-offset:2px}
.release-notes-dialog{box-sizing:border-box;width:min(520px,calc(100vw - 24px));max-height:85dvh;overflow:auto;padding:20px;border:1px solid #adc3d4;border-radius:18px;background:#f2f8fc;color:#25445a;box-shadow:0 18px 75px #0005;font:14px/1.5 var(--site-font,Arial,sans-serif)}
.release-notes-dialog::backdrop{background:#122b4466;backdrop-filter:blur(7px)}
.dark .release-notes-dialog{background:#1d3347;color:#e0edf6;border-color:#536f85}
.release-notes-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px}
.release-notes-heading h2{font-size:20px;margin:0}
.release-notes-dialog .release-notes-close{width:36px;min-height:36px;padding:0;border-radius:10px;cursor:pointer;font:20px Arial;color:inherit;background:#809ab51c;border:1px solid #809ab555}
.release-notes-dialog h3{font-size:12px;opacity:.75;margin:0 0 6px}.release-notes-dialog ul{padding-left:20px;margin:0 0 16px}.release-notes-dialog li{margin:5px 0}.release-notes-dialog summary{cursor:pointer;font-weight:600;padding:8px 0}.release-notes-dialog article{margin-top:12px}.release-notes-dialog details{border-top:1px solid #809ab544}
@media print{.release-notes-dialog,.release-notes-trigger{display:none!important}}
`;document.head.append(style);
const node=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
export function openReleaseNotes(version){
 const existing=document.querySelector('.release-notes-dialog');if(existing?.open)return;
 existing?.remove();const d=node('dialog');d.className='release-notes-dialog';d.setAttribute('aria-labelledby','release-notes-title');
 const heading=node('form');heading.method='dialog';heading.className='release-notes-heading';const title=node('h2','What’s new');title.id='release-notes-title';const close=node('button','×');close.type='submit';close.className='release-notes-close';close.setAttribute('aria-label','Close release notes');heading.append(title,close);d.append(heading);
 const current=releases.find(r=>r.version===version),index=releases.indexOf(current);
 function entry(release){const article=node('article'),h=node('h3','Version '+release.version),list=node('ul');for(const change of release.changes)list.append(node('li',change));article.append(h,list);return article;}
 d.append(entry(current||{version,changes:['Release notes aren’t available for this version yet.']}));
 const earlier=index>=0?releases.slice(index+1):[];if(earlier.length){const history=node('details');history.setAttribute('data-default-collapsed','');history.append(node('summary','Earlier updates'),...earlier.map(entry));d.append(history);}
 d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});d.addEventListener('close',()=>d.remove(),{once:true});document.body.append(d);d.showModal();
}
document.addEventListener('click',e=>{const trigger=e.target.closest?.('[data-changelog-open]');if(trigger)openReleaseNotes(document.querySelector('meta[name="site-version"]')?.content||'Unknown');});
