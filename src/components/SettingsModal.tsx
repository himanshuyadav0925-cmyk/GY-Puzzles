import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Eye,
  RotateCcw,
  Trash2,
  AlertTriangle,
  ZapOff,
  Feather,
  Compass,
  Smartphone,
  Download,
  CheckCircle2,
} from 'lucide-react';
import type { ThemeMode, UserSettings } from '../types/sudoku';
import { resetAllUserData, saveSettings } from '../utils/storage';
import { sound } from '../utils/sound';
import { voice } from '../utils/voice';
import { isStandalone, canPromptInstall, addInstallListener, promptInstallApp } from '../utils/pwa';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetCurrentPuzzle: () => void;
  onAllDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetCurrentPuzzle,
  onAllDataReset,
}) => {
  const [showConfirmResetAll, setShowConfirmResetAll] = useState<boolean>(false);
  const [showConfirmResetGame, setShowConfirmResetGame] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(() => canPromptInstall());
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());

  useEffect(() => {
    return addInstallListener((installable) => {
      setCanInstall(installable);
      setInstalled(isStandalone());
    });
  }, []);

  if (!isOpen) return null;

  const setPreferredMode = (preferredMode: 'relax' | 'classic') => {
    const updated: UserSettings = { ...settings, preferredMode };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleSound = () => {
    const nextVal = !settings.soundEnabled;
    sound.setMuted(!nextVal);
    const updated: UserSettings = { ...settings, soundEnabled: nextVal };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleVoice = () => {
    const nextVal = !settings.voiceEnabled;
    voice.setVoiceEnabled(nextVal);
    if (nextVal) {
      voice.speakWelcome();
    }
    const updated: UserSettings = { ...settings, voiceEnabled: nextVal };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleAnimations = () => {
    const updated: UserSettings = { ...settings, animationsEnabled: !settings.animationsEnabled };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const setTheme = (theme: ThemeMode) => {
    const updated: UserSettings = { ...settings, theme };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleHighContrast = () => {
    const updated: UserSettings = { ...settings, highContrast: !settings.highContrast };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleReducedMotion = () => {
    const updated: UserSettings = { ...settings, reducedMotion: !settings.reducedMotion };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleSameNumbers = () => {
    const updated: UserSettings = { ...settings, highlightSameNumbers: !settings.highlightSameNumbers };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const toggleDuplicates = () => {
    const updated: UserSettings = { ...settings, highlightDuplicates: !settings.highlightDuplicates };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const handleConfirmResetAll = () => {
    resetAllUserData();
    setShowConfirmResetAll(false);
    onAllDataReset();
    onClose();
  };

  const handleConfirmResetCurrent = () => {
    setShowConfirmResetGame(false);
    onResetCurrentPuzzle();
    onClose();
  };

  return (
    <div
      className="modal-backdrop settings-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-heading"
    >
      <div className="settings-modal-card">
        {/* Header */}
        <div className="modal-header">
          <h2 id="settings-heading" className="modal-title">
            Settings & Preferences
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-content-scroll">
          {/* SECTION 1: APPEARANCE */}
          <div className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>
            <div className="theme-selector-grid" role="radiogroup" aria-label="Theme mode selection">
              <button
                type="button"
                className={`theme-choice-btn ${settings.theme === 'dark' ? 'theme-active' : ''}`}
                onClick={() => setTheme('dark')}
                role="radio"
                aria-checked={settings.theme === 'dark'}
              >
                <Moon size={18} />
                <span>Dark</span>
              </button>

              <button
                type="button"
                className={`theme-choice-btn ${settings.theme === 'light' ? 'theme-active' : ''}`}
                onClick={() => setTheme('light')}
                role="radio"
                aria-checked={settings.theme === 'light'}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>

              <button
                type="button"
                className={`theme-choice-btn ${settings.theme === 'system' ? 'theme-active' : ''}`}
                onClick={() => setTheme('system')}
                role="radio"
                aria-checked={settings.theme === 'system'}
              >
                <Monitor size={18} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: PREFERRED EXPERIENCE */}
          <div className="settings-section">
            <h3 className="settings-section-title">Preferred Mode</h3>
            <div className="theme-selector-grid" role="radiogroup" aria-label="Preferred mode selection" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <button
                type="button"
                className={`theme-choice-btn ${settings.preferredMode === 'relax' ? 'theme-active' : ''}`}
                onClick={() => setPreferredMode('relax')}
                role="radio"
                aria-checked={settings.preferredMode === 'relax'}
              >
                <Feather size={18} />
                <span>Relax Mode</span>
              </button>

              <button
                type="button"
                className={`theme-choice-btn ${settings.preferredMode === 'classic' ? 'theme-active' : ''}`}
                onClick={() => setPreferredMode('classic')}
                role="radio"
                aria-checked={settings.preferredMode === 'classic'}
              >
                <Compass size={18} />
                <span>Classic Mode</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: GAMEPLAY & AUDIO */}
          <div className="settings-section">
            <h3 className="settings-section-title">Gameplay & Audio</h3>
            <div className="settings-list">
              {/* Sound */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    <span className="setting-name">Sound Effects</span>
                  </div>
                  <p className="setting-desc">Pleasant procedural audio clicks, notes, and solve chimes.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.soundEnabled ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleSound}
                  aria-label="Toggle sound effects"
                >
                  <div className="switch-handle" />
                </button>
              </div>

              {/* Voice Guidance (Section 10) */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    {settings.voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                    <span className="setting-name">Voice Guidance</span>
                  </div>
                  <p className="setting-desc">Short spoken feedback for key events using native browser speech.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.voiceEnabled ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleVoice}
                  aria-label="Toggle voice guidance"
                >
                  <div className="switch-handle" />
                </button>
              </div>

              {/* Visual Animations */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    <Sparkles size={18} />
                    <span className="setting-name">Celebration Animations</span>
                  </div>
                  <p className="setting-desc">Confetti particles and star celebrations upon victory.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.animationsEnabled ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleAnimations}
                  aria-label="Toggle animations"
                >
                  <div className="switch-handle" />
                </button>
              </div>

              {/* Highlight Same Numbers */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    <Eye size={18} />
                    <span className="setting-name">Highlight Same Numbers</span>
                  </div>
                  <p className="setting-desc">Illuminate all identical numbers when a cell is selected.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.highlightSameNumbers ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleSameNumbers}
                  aria-label="Toggle same number highlight"
                >
                  <div className="switch-handle" />
                </button>
              </div>

              {/* Conflict Duplicate Alert */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    <AlertTriangle size={18} />
                    <span className="setting-name">Conflict Detection</span>
                  </div>
                  <p className="setting-desc">Visually mark duplicate violations across row, column, or box.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.highlightDuplicates ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleDuplicates}
                  aria-label="Toggle duplicate detection"
                >
                  <div className="switch-handle" />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: ACCESSIBILITY */}
          <div className="settings-section">
            <h3 className="settings-section-title">Accessibility</h3>
            <div className="settings-list">
              {/* High Contrast */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    <Eye size={18} />
                    <span className="setting-name">High Contrast</span>
                  </div>
                  <p className="setting-desc">Strengthen board boundaries and increase digit contrast.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.highContrast ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleHighContrast}
                  aria-label="Toggle high contrast"
                >
                  <div className="switch-handle" />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    <ZapOff size={18} />
                    <span className="setting-name">Reduced Motion</span>
                  </div>
                  <p className="setting-desc">Disable decorative transitions and floating micro-animations.</p>
                </div>
                <button
                  type="button"
                  className={`toggle-switch ${settings.reducedMotion ? 'switch-on' : 'switch-off'}`}
                  onClick={toggleReducedMotion}
                  aria-label="Toggle reduced motion"
                >
                  <div className="switch-handle" />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: APP & OFFLINE (PWA) */}
          <div className="settings-section">
            <h3 className="settings-section-title">App & Offline</h3>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-title-row">
                    <Smartphone size={18} />
                    <span className="setting-name">
                      {installed ? 'App Installed' : canInstall ? 'Install Web App' : 'Offline Ready'}
                    </span>
                  </div>
                  <p className="setting-desc">
                    {installed
                      ? 'Running as an installed standalone app with full offline gameplay.'
                      : canInstall
                      ? 'Install GY Puzzles to your home screen for quick access and offline play.'
                      : 'All 100 levels and game assets are cached and ready for offline play.'}
                  </p>
                </div>
                {canInstall && (
                  <button
                    type="button"
                    className="pwa-install-btn"
                    onClick={async () => {
                      const success = await promptInstallApp();
                      if (success) {
                        setInstalled(true);
                        setCanInstall(false);
                      }
                    }}
                    title="Install GY Puzzles to home screen"
                  >
                    <Download size={14} />
                    <span>Install</span>
                  </button>
                )}
                {installed && (
                  <span className="pwa-installed-badge">
                    <CheckCircle2 size={15} />
                    <span>Installed</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: DATA & GAME MANAGEMENT */}
          <div className="settings-section">
            <h3 className="settings-section-title">Data Management</h3>

            {/* Reset Current Puzzle */}
            {!showConfirmResetGame ? (
              <button
                type="button"
                className="secondary-btn full-width setting-action-btn"
                onClick={() => setShowConfirmResetGame(true)}
              >
                <RotateCcw size={16} />
                <span>Reset Current Puzzle</span>
              </button>
            ) : (
              <div className="confirm-reset-box" role="alert">
                <div className="confirm-warning-row">
                  <AlertTriangle size={18} className="icon-warning" />
                  <div>
                    <strong>Restart this puzzle?</strong>
                    <p>Current placed numbers on this level will be reset.</p>
                  </div>
                </div>
                <div className="confirm-btns-row">
                  <button
                    type="button"
                    className="danger-btn flex-1"
                    onClick={handleConfirmResetCurrent}
                  >
                    Reset Puzzle
                  </button>
                  <button
                    type="button"
                    className="secondary-btn flex-1"
                    onClick={() => setShowConfirmResetGame(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reset All Saved Data with Section 5 Confirmation */}
            {!showConfirmResetAll ? (
              <button
                type="button"
                className="danger-btn full-width setting-action-btn"
                onClick={() => setShowConfirmResetAll(true)}
              >
                <Trash2 size={16} />
                <span>Reset All Saved Data & Progress</span>
              </button>
            ) : (
              <div className="confirm-reset-box" role="alert">
                <div className="confirm-warning-row">
                  <AlertTriangle size={20} className="icon-danger" />
                  <div>
                    <strong>Are you sure?</strong>
                    <p>This will permanently reset your progress.</p>
                  </div>
                </div>
                <div className="confirm-btns-row">
                  <button
                    type="button"
                    className="danger-btn flex-1"
                    onClick={handleConfirmResetAll}
                  >
                    Reset Progress
                  </button>
                  <button
                    type="button"
                    className="secondary-btn flex-1"
                    onClick={() => setShowConfirmResetAll(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dedication Credit */}
        <div className="settings-dedication-footer">
          <div>GY Puzzles • THINK • SOLVE • GROW</div>
          <div>Dedicated to <strong>Govind Yadav</strong></div>
        </div>
      </div>
    </div>
  );
};
