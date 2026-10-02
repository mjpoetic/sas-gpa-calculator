// A short, locally synthesized award chime: no downloads or autoplay.
let audioContext;
let lastCelebration = -Infinity;

async function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext ||= new AudioContext();
    if (audioContext.state === 'suspended') await audioContext.resume();
    const start = audioContext.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const time = start + index * 0.09;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.045, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.38);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(time);
      oscillator.stop(time + 0.4);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch {
    // Visual feedback remains available when browser audio is unavailable.
  }
}

document.addEventListener('click', (event) => {
  const logo = event.target.closest?.('[data-achievement-logo]');
  if (!logo || performance.now() - lastCelebration < 800) return;
  lastCelebration = performance.now();
  void playChime();
  const bounds = logo.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = 'achievement-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.style.left = `${bounds.left + bounds.width / 2}px`;
  burst.style.top = `${bounds.top + bounds.height / 2}px`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (let index = 0; index < 10; index++) {
    const star = document.createElement('span');
    star.textContent = '✦';
    const angle = (index / 10) * Math.PI * 2;
    const distance = reducedMotion ? 25 : 35 + (index % 3) * 11;
    star.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    star.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    star.style.setProperty('--turn', `${index % 2 ? 80 : -80}deg`);
    burst.append(star);
  }
  document.body.append(burst);
  window.setTimeout(() => burst.remove(), 750);
});
