// Web Audio API for generating sound effects

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// Pleasant "ding" for correct answer
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1); // Higher pitch
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Silently fail if audio not available
  }
}

// Soft "boop" for close answer
export function playCloseSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Silently fail if audio not available
  }
}

// Gentle "bunk" for wrong answer
export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(220, ctx.currentTime); // A3
    oscillator.frequency.setValueAtTime(180, ctx.currentTime + 0.1); // Slides down
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Silently fail if audio not available
  }
}

// Celebration fanfare for completing a batch
export function playCelebrationSound() {
  try {
    const ctx = getAudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const duration = 0.15;

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * duration);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.25, ctx.currentTime + i * duration);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * duration + duration * 2);

      oscillator.start(ctx.currentTime + i * duration);
      oscillator.stop(ctx.currentTime + i * duration + duration * 2);
    });
  } catch (e) {
    // Silently fail if audio not available
  }
}

// Streak milestone sound (5, 10, etc.)
export function playStreakSound() {
  try {
    const ctx = getAudioContext();

    const notes = [659.25, 783.99]; // E5, G5 - quick double ding
    const duration = 0.08;

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * duration);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * duration);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * duration + 0.15);

      oscillator.start(ctx.currentTime + i * duration);
      oscillator.stop(ctx.currentTime + i * duration + 0.15);
    });
  } catch (e) {
    // Silently fail if audio not available
  }
}
