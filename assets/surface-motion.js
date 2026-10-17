// Shared motion for native popovers and small surfaces; keep their native focus behavior.
const style=document.createElement('style');style.textContent=`
dialog[open]::backdrop{animation:surface-backdrop-enter 220ms ease-out both}
dialog.dialog-motion-closing::backdrop{animation:surface-backdrop-exit 150ms ease-in both}
@keyframes surface-backdrop-enter{from{opacity:0}to{opacity:1}}
@keyframes surface-backdrop-exit{from{opacity:1}to{opacity:0}}
.site-select-menu[popover],.color-palette[popover]{opacity:0;transform:translateY(-6px) scale(.98);transform-origin:top center;transition:opacity 180ms ease,transform 180ms cubic-bezier(.22,1,.36,1),display 180ms allow-discrete,overlay 180ms allow-discrete}
.site-select-menu:popover-open,.color-palette:popover-open{opacity:1;transform:none}
@starting-style{.site-select-menu:popover-open,.color-palette:popover-open{opacity:0;transform:translateY(-6px) scale(.98)}}
.site-update-toast,.workspace-tooltip,.color-palette-detail{opacity:1;transition:opacity 180ms ease,translate 180ms ease,display 180ms allow-discrete;translate:0 0}
.site-update-toast[hidden],.workspace-tooltip[hidden],.color-palette-detail[hidden]{opacity:0;translate:0 6px;display:none}
@starting-style{.site-update-toast:not([hidden]),.workspace-tooltip:not([hidden]),.color-palette-detail:not([hidden]){opacity:0;translate:0 6px}}
#refresh-status{animation:surface-notice-enter 200ms ease-out both}
@keyframes surface-notice-enter{from{opacity:0;translate:0 8px}to{opacity:1;translate:0 0}}
@media(prefers-reduced-motion:reduce){dialog::backdrop{animation:none!important}.site-select-menu[popover],.color-palette[popover],.site-update-toast,.workspace-tooltip,.color-palette-detail{transition:none!important}#refresh-status{animation:none!important}}
@media print{.site-select-menu[popover],.color-palette[popover],#refresh-status{display:none!important}}
`;document.head.append(style);
export function dismissNotice(node){if(!node)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){node.remove();return;}if(node.dataset.motionClosing)return;node.dataset.motionClosing='true';node.inert=true;node.style.pointerEvents='none';const motion=node.animate([{opacity:1,translate:'0 0'},{opacity:0,translate:'0 8px'}],{duration:140,easing:'ease-in',fill:'forwards'});motion.finished.then(()=>node.remove()).catch(()=>node.remove());}
