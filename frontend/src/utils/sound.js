"use client";

function tone(frequency, duration, gain = 0.035, delay = 0) {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    volume.gain.setValueAtTime(0.0001, context.currentTime + delay);
    volume.gain.exponentialRampToValueAtTime(
      gain,
      context.currentTime + delay + 0.015,
    );
    volume.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + delay + duration,
    );
    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(context.currentTime + delay);
    oscillator.stop(context.currentTime + delay + duration + 0.02);
    oscillator.onended = () => context.close().catch(() => {});
  } catch {
    // Audio feedback is non-critical and should never block commerce actions.
  }
}

export function playCartSound() {
  tone(620, 0.08, 0.028);
  tone(820, 0.1, 0.024, 0.07);
}

export function playOrderSuccessSound() {
  tone(523, 0.09, 0.03);
  tone(659, 0.11, 0.03, 0.09);
  tone(784, 0.16, 0.032, 0.2);
}
