import React, { useState, useEffect } from 'react';
import {
  Home,
  Play,
  Calendar,
  BarChart3,
  MoreHorizontal,
  Award,
  BookOpen,
  Settings as SettingsIcon,
  Zap,
  List,
  X,
  Download,
} from 'lucide-react';
import type { ActiveView } from '../types/sudoku';
import { canPromptInstall, addInstallListener, promptInstallApp } from '../utils/pwa';

interface MobileNavBarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenAchievements: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeView,
  onNavigate,
  onOpenAchievements,
  onOpenRules,
  onOpenSettings,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(() => canPromptInstall());

  useEffect(() => {
    return addInstallListener((installable) => {
      setCanInstall(installable);
    });
  }, []);

  return (
    <>
      {/* Mobile Drawer / Popup when 'More' is clicked */}
      {showMoreMenu && (
        <div
          className="mobile-more-backdrop"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="mobile-more-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-header">
              <span className="sheet-title">More Options</span>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowMoreMenu(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sheet-grid">
              <button
                type="button"
                className="sheet-item"
                onClick={() => {
                  onNavigate('levels');
                  setShowMoreMenu(false);
                }}
              >
                <List size={20} />
                <span>100 Levels Map</span>
              </button>

              <button
                type="button"
                className="sheet-item"
                onClick={() => {
                  onNavigate('challenge');
                  setShowMoreMenu(false);
                }}
              >
                <Zap size={20} className="icon-red" />
                <span>GY Challenge</span>
              </button>

              <button
                type="button"
                className="sheet-item"
                onClick={() => {
                  onOpenAchievements();
                  setShowMoreMenu(false);
                }}
              >
                <Award size={20} />
                <span>Achievements</span>
              </button>

              <button
                type="button"
                className="sheet-item"
                onClick={() => {
                  onOpenRules();
                  setShowMoreMenu(false);
                }}
              >
                <BookOpen size={20} />
                <span>How to Play</span>
              </button>

              <button
                type="button"
                className="sheet-item"
                onClick={() => {
                  onOpenSettings();
                  setShowMoreMenu(false);
                }}
              >
                <SettingsIcon size={20} />
                <span>Settings</span>
              </button>

              {canInstall && (
                <button
                  type="button"
                  className="sheet-item sheet-item-install"
                  onClick={async () => {
                    setShowMoreMenu(false);
                    await promptInstallApp();
                  }}
                >
                  <Download size={20} className="icon-gold" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar on Mobile */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <button
          type="button"
          className={`mobile-nav-tab ${activeView === 'home' ? 'nav-active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeView === 'play' ? 'nav-active' : ''}`}
          onClick={() => onNavigate('play')}
        >
          <Play size={20} />
          <span>Play</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeView === 'daily' ? 'nav-active' : ''}`}
          onClick={() => onNavigate('daily')}
        >
          <Calendar size={20} />
          <span>Daily</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeView === 'stats' ? 'nav-active' : ''}`}
          onClick={() => onNavigate('stats')}
        >
          <BarChart3 size={20} />
          <span>Stats</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${showMoreMenu ? 'nav-active' : ''}`}
          onClick={() => setShowMoreMenu((prev) => !prev)}
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
