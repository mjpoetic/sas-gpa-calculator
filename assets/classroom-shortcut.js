// Retain the original logo-hold shortcut alongside the public Teacher Tools link.
const LOGO = '[data-achievement-logo]';
const HOLD_MS = 1200;
let hold = null;
let suppressClickUntil = 0;

function cancel() {
  if (hold) {clearTimeout(hold.timer);hold.logo.classList.remove('logo-holding');hold.logo.querySelector('.logo-hold-cue')?.remove();}
  hold = null;
}

function start(logo, input) {
  cancel();
  logo.classList.add('logo-holding');
  const cue=document.createElement('span');cue.className='logo-hold-cue';cue.setAttribute('role','status');cue.textContent='Opening Classroom Studio…';
  cue.innerHTML='<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15"/></svg><span>Opening Classroom Studio…</span>';logo.append(cue);
  hold = {...input, logo, timer: setTimeout(() => {
    if (!logo.isConnected || document.hidden) return cancel();
    suppressClickUntil = performance.now() + 1500;
    cancel();
    location.assign(new URL('./classroom/', document.baseURI).href);
  }, HOLD_MS)};
}

document.addEventListener('pointerdown', event => {
  if (hold && hold.pointerId !== event.pointerId) cancel();
  const logo = event.target.closest?.(LOGO);
  if (!logo || !event.isPrimary || event.button !== 0) return;
  start(logo, {pointerId: event.pointerId, x: event.clientX, y: event.clientY});
});
document.addEventListener('pointermove', event => {
  if (hold?.pointerId === event.pointerId && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > 12) cancel();
}, {passive: true});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  document.addEventListener(type, event => {if (hold?.pointerId === event.pointerId) cancel();});
}
document.addEventListener('keydown', event => {
  const logo = event.target.closest?.(LOGO);
  if (!logo || ![' ', 'Enter'].includes(event.key)) return;
  // Prevent repeated native Enter clicks; a short key press still celebrates.
  event.preventDefault();
  if (!event.repeat) start(logo, {key: event.key});
});
document.addEventListener('keyup', event => {
  if (![' ', 'Enter'].includes(event.key) || !event.target.closest?.(LOGO)) return;
  event.preventDefault();
  const shortPress = hold?.key === event.key;
  cancel();
  if (shortPress && performance.now() >= suppressClickUntil) event.target.closest(LOGO).click();
});
document.addEventListener('click', event => {
  if (event.target.closest?.(LOGO) && performance.now() < suppressClickUntil) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);
document.addEventListener('dragstart', event => {if (event.target.closest?.(LOGO)) event.preventDefault();});
document.addEventListener('contextmenu', event => {if (hold && event.target.closest?.(LOGO)) event.preventDefault();});
document.addEventListener('focusout', event => {if (hold?.logo === event.target) cancel();});
window.addEventListener('blur', cancel);
window.addEventListener('scroll', cancel, true);
document.addEventListener('visibilitychange', cancel);
