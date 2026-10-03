// Browser native speech synthesis voice guidance system for GY Puzzles
class VoiceGuidanceSystem {
  private enabled: boolean = false;
  private lastSpokenTime: number = 0;
  private minIntervalMs: number = 1800; // Throttle repetitive voice triggers

  constructor() {
    try {
      const saved = localStorage.getItem('gy_puzzles_voice_enabled');
      if (saved !== null) {
        this.enabled = JSON.parse(saved);
      }
    } catch {
      this.enabled = false;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public isVoiceEnabled(): boolean {
    return this.enabled;
  }

  public setVoiceEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      localStorage.setItem('gy_puzzles_voice_enabled', JSON.stringify(enabled));
    } catch {
      // Ignore storage errors
    }
    if (!enabled && this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(text: string, priority: boolean = false): void {
    if (!this.enabled || !this.isSupported()) return;

    const now = Date.now();
    if (!priority && now - this.lastSpokenTime < this.minIntervalMs) {
      return;
    }
    this.lastSpokenTime = now;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Calm, relaxed cadence
      utterance.pitch = 1.0;
      utterance.volume = 0.85;

      // Select a clear English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Serena')))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Gracefully ignore any browser synthesis errors
      console.warn('Speech synthesis unavailable:', e);
    }
  }

  public stop(): void {
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }

  // Meaningful event helpers
  public speakWelcome(): void {
    this.speak('Welcome to GY Puzzles.', true);
  }

  public speakChooseLevel(): void {
    this.speak('Choose a level.');
  }

  public speakPuzzleStarted(levelNumber?: number): void {
    if (levelNumber) {
      this.speak(`Level ${levelNumber} started.`, true);
    } else {
      this.speak('Puzzle started.', true);
    }
  }

  public speakNotesMode(active: boolean): void {
    this.speak(active ? 'Notes mode on.' : 'Notes mode off.', true);
  }

  public speakNiceMove(): void {
    this.speak('Nice move.');
  }

  public speakConflict(): void {
    this.speak('That number conflicts with the puzzle.', true);
  }

  public speakLifelinesRemaining(count: number): void {
    if (count === 1) {
      this.speak('You have one lifeline remaining.');
    } else {
      this.speak(`You have ${count} lifelines remaining.`);
    }
  }

  public speakHintUsed(): void {
    this.speak('Hint used.', true);
  }

  public speakPuzzleCompleted(): void {
    this.speak('Puzzle completed. Congratulations.', true);
  }

  public speakGamePaused(): void {
    this.speak('Game paused.', true);
  }

  public speakGameResumed(): void {
    this.speak('Game resumed.', true);
  }

  public speakMathCorrect(): void {
    this.speak('Correct! One lifeline earned.', true);
  }
}

export const voice = new VoiceGuidanceSystem();
