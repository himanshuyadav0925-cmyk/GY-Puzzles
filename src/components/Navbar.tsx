import React from 'react';
import {
  List,
  Trophy,
  HelpCircle,
  Brain,
  Volume2,
  VolumeX,
  Calendar,
  BarChart3,
  Settings as SettingsIcon,
  Home,
  Zap,
} from 'lucide-react';
import type { ActiveView } from '../types/sudoku';
import { GYLogo } from './GYLogo';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenMathChallenge: () => void;
  onOpenAchievements: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  totalStars: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenMathChallenge,
  onOpenAchievements,
  onOpenRules,
  onOpenSettings,
  isMuted,
  onToggleMute,
  totalStars,
}) => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand & Dedication */}
        <div className="navbar-brand-section" onClick={() => onNavigate('home')} role="button" tabIndex={0}>
          <GYLogo size={40} showText={true} />
          <div className="govind-tribute-pill">
            <span className="tribute-star">✦</span>
            <span>Dedicated to Govind Yadav</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-actions desktop-nav-only" aria-label="Desktop Navigation">
          <button
            type="button"
            className={`nav-btn ${activeView === 'home' ? 'nav-btn-active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            <Home size={17} />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeView === 'play' ? 'nav-btn-active' : ''}`}
            onClick={() => onNavigate('play')}
          >
            <span>Play</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeView === 'daily' ? 'nav-btn-active' : ''}`}
            onClick={() => onNavigate('daily')}
          >
            <Calendar size={17} />
            <span>Daily</span>
          </button>

          <button
            type="button"
            className={`nav-btn levels-nav-btn ${activeView === 'levels' ? 'nav-btn-active' : ''}`}
            onClick={() => onNavigate('levels')}
          >
            <List size={17} />
            <span>100 Levels</span>
            <span className="nav-stars-badge">★ {totalStars}</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeView === 'challenge' ? 'nav-btn-active' : ''}`}
            onClick={() => onNavigate('challenge')}
          >
            <Zap size={17} className="icon-red" />
            <span>Challenge</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeView === 'stats' ? 'nav-btn-active' : ''}`}
            onClick={() => onNavigate('stats')}
          >
            <BarChart3 size={17} />
            <span>Stats</span>
          </button>

          <button
            type="button"
            className="nav-btn math-nav-btn"
            onClick={onOpenMathChallenge}
            title="Earn Lifelines with Maths"
          >
            <Brain size={17} />
            <span>+Lifelines</span>
          </button>

          <button
            type="button"
            className="nav-btn icon-only-nav-btn"
            onClick={onOpenAchievements}
            title="Achievements"
          >
            <Trophy size={17} />
          </button>

          <button
            type="button"
            className="nav-btn icon-only-nav-btn"
            onClick={onOpenRules}
            title="Rules & How to Play"
          >
            <HelpCircle size={17} />
          </button>

          <button
            type="button"
            className="nav-btn icon-only-nav-btn"
            onClick={onOpenSettings}
            title="Settings"
          >
            <SettingsIcon size={17} />
          </button>

          <button
            type="button"
            className="nav-btn icon-only-nav-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </nav>
      </div>
    </header>
  );
};
