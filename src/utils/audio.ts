// Minimalist Web Audio Harmonic Synthesizer
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function playSineTone(frequency = 440, durationSeconds = 0.08, gainValue = 0.12) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch {
    // Ignore audio playback errors if user has not interacted yet
  }
}

export function playImpulseTone(frequency = 880) {
  playSineTone(frequency, 0.12, 0.2);
}

export function playSuccessChime() {
  if (!soundEnabled) return;
  playSineTone(523.25, 0.1, 0.08); // C5
  setTimeout(() => playSineTone(659.25, 0.12, 0.08), 70); // E5
  setTimeout(() => playSineTone(783.99, 0.15, 0.1), 140); // G5
}

export function playFailureDrone() {
  if (!soundEnabled) return;
  playSineTone(196.0, 0.18, 0.1); // G3
  setTimeout(() => playSineTone(185.0, 0.22, 0.12), 100); // F#3
}

export function playTileTone(index: number) {
  const frequencies = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
  const freq = frequencies[index % frequencies.length];
  playSineTone(freq, 0.1, 0.09);
}
