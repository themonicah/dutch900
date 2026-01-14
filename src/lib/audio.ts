/**
 * Audio utilities using Web Speech API for Dutch pronunciation
 */

let dutchVoice: SpeechSynthesisVoice | null = null;

/**
 * Initialize and find the best Dutch voice
 */
export function initDutchVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    const findVoice = () => {
      const voices = speechSynthesis.getVoices();
      // Prefer nl-NL, then any Dutch variant
      dutchVoice =
        voices.find((v) => v.lang === 'nl-NL') ||
        voices.find((v) => v.lang.startsWith('nl')) ||
        null;
      resolve(dutchVoice);
    };

    // Voices might not be loaded yet
    if (speechSynthesis.getVoices().length > 0) {
      findVoice();
    } else {
      speechSynthesis.addEventListener('voiceschanged', findVoice, { once: true });
    }
  });
}

/**
 * Speak Dutch text using Web Speech API
 */
export function speakDutch(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL';
    utterance.rate = rate;

    if (dutchVoice) {
      utterance.voice = dutchVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      // Don't reject on cancel
      if (event.error !== 'canceled') {
        reject(new Error(`Speech error: ${event.error}`));
      } else {
        resolve();
      }
    };

    speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  speechSynthesis.cancel();
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Get available Dutch voices
 */
export function getDutchVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices().filter((v) => v.lang.startsWith('nl'));
}
