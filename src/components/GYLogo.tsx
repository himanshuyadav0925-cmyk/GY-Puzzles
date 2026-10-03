import React from 'react';

interface GYLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  horizontal?: boolean;
}

export const GYLogo: React.FC<GYLogoProps> = ({
  size = 48,
  showText = true,
  className = '',
  horizontal = true,
}) => {
  return (
    <div
      className={`gy-logo-container ${horizontal ? 'horizontal' : 'vertical'} ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="gy-brand-mark"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(229, 184, 66, 0.25))' }}
      >
        <defs>
          <linearGradient id="gyGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="35%" stopColor="#E5B842" />
            <stop offset="70%" stopColor="#C99723" />
            <stop offset="100%" stopColor="#966C0C" />
          </linearGradient>

          <linearGradient id="gyNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E2C4F" />
            <stop offset="50%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#080D1A" />
          </linearGradient>

          <radialGradient id="gyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(229, 184, 66, 0.4)" />
            <stop offset="100%" stopColor="rgba(229, 184, 66, 0)" />
          </radialGradient>
        </defs>

        {/* Glow backdrop */}
        <circle cx="50" cy="50" r="46" fill="url(#gyGlow)" />

        {/* Shield / Puzzle Emblem */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="22"
          fill="url(#gyNavyGrad)"
          stroke="url(#gyGoldGrad)"
          strokeWidth="3.5"
        />

        {/* 3x3 subtle grid lines evoking Sudoku */}
        <path
          d="M 12 37 L 88 37 M 12 63 L 88 63 M 37 12 L 37 88 M 63 12 L 63 88"
          stroke="rgba(229, 184, 66, 0.12)"
          strokeWidth="1.5"
        />

        {/* Interlocking Monogram: G + Y */}
        {/* Outer stylized G */}
        <path
          d="M 46 28 C 30 28 22 38 22 51 C 22 64 31 72 47 72 C 58 72 65 67 67 59 L 48 59"
          stroke="url(#gyGoldGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Sharp modern Y emerging gracefully */}
        <path
          d="M 64 30 L 73 45 L 82 30 M 73 45 L 73 68"
          stroke="url(#gyGoldGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center sparkling gem / star */}
        <circle cx="48" cy="51" r="3" fill="#FFF8D1" />
      </svg>

      {showText && (
        <div className="gy-logo-text-block">
          <div className="gy-logo-title">
            <span className="brand-gold">GY</span>{' '}
            <span className="brand-light">PUZZLES</span>
          </div>
          <div className="gy-logo-tagline">THINK • SOLVE • GROW</div>
        </div>
      )}
    </div>
  );
};
