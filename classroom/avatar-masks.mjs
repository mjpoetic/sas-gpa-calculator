// Eye openings are part of each silhouette so expressions remain visible.
export function avatarMaskSVG(a){
 const c=a.maskColor,d=a.maskAccentColor;
 const holes='M40 49a7 8 0 1 0 14 0a7 8 0 1 0-14 0ZM66 49a7 8 0 1 0 14 0a7 8 0 1 0-14 0Z';
 let art='';
 if(a.mask==='hero')art=`<path d="M32 40Q46 35 60 41Q74 35 88 40L85 55Q74 62 60 53Q46 62 35 55Z${holes}" fill="${c}" fill-rule="evenodd"/><path d="m57 43 3-3 3 3-3 4Z" fill="${d}"/>`;
 if(a.mask==='butterfly')art=`<path d="M60 42Q46 25 32 35L35 55Q44 65 58 54H62Q76 65 85 55L88 35Q74 25 60 42Z${holes}" fill="${c}" fill-rule="evenodd"/><path d="M60 42v13M38 37l5 4m39-4-5 4M39 57l4-2m38 2-4-2" stroke="${d}" stroke-width="2" stroke-linecap="round"/>`;
 if(a.mask==='clown')art=`<path d="M33 40Q60 26 87 40L84 65Q60 82 36 65Z${holes}" fill="${c}" fill-rule="evenodd"/><path d="m43 38 4-6 4 6m18 0 4-6 4 6" fill="${d}"/><ellipse cx="60" cy="57" rx="5" ry="4" fill="${d}"/><path d="M48 65q12 12 24 0q-12 4-24 0Z" fill="#ffffff" stroke="${d}" stroke-width="2"/>`;
 if(a.mask==='robot')art=`<path d="M33 35H87V66L77 72H43L33 66Z${holes}" fill="${c}" fill-rule="evenodd"/><path d="M54 39h12M41 63h38" stroke="${d}" stroke-width="2"/><rect x="48" y="61" width="24" height="7" rx="2" fill="${d}"/><path d="M54 62v5m6-5v5m6-5v5" stroke="#263445"/><circle cx="37" cy="39" r="2" fill="${d}"/><circle cx="83" cy="39" r="2" fill="${d}"/>`;
 if(a.mask==='medical')art=`<path d="M37 55Q25 48 29 59L38 65M83 55Q95 48 91 59L82 65" fill="none" stroke="${d}" stroke-width="1.5"/><path d="M37 54Q60 49 83 54L81 68Q60 81 39 68Z" fill="${c}" stroke="${d}" stroke-width="1"/><path d="M42 57q18-4 36 0M42 61q18 2 36 0M43 65q17 5 34 0" fill="none" stroke="${d}" stroke-width="1"/>`;
 return art?`<g data-avatar-mask="${a.mask}">${art}</g>`:'';
}
