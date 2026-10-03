import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Hash,
  PenTool,
  RotateCcw,
  Sparkles,
  Star,
  Check,
} from 'lucide-react';
import { setTutorialSeen } from '../utils/storage';

interface InteractiveTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

interface TutorialStep {
  step: number;
  title: string;
  description: string;
  tip: string;
  icon: React.ReactNode;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 1,
    title: 'Step 1: Select a Cell',
    description: 'Tap or click any empty cell on the 9×9 Sudoku grid. The row, column, and 3×3 box will gently highlight to give you clear spatial focus.',
    tip: 'Tip: You can also use keyboard Arrow keys to navigate between cells smoothly.',
    icon: <MousePointer size={28} className="tut-icon-gold" />,
  },
  {
    step: 2,
    title: 'Step 2: Choose a Number from 1–9',
    description: 'Press any digit (1–9) on the keypad or your physical keyboard. Each digit must appear exactly once per row, column, and 3×3 block.',
    tip: 'Tip: Matching numbers across the board highlight automatically so you can spot patterns easily.',
    icon: <Hash size={28} className="tut-icon-blue" />,
  },
  {
    step: 3,
    title: 'Step 3: Use Notes Mode',
    description: 'When unsure, tap "Notes" or press "N" on your keyboard. Add candidate possibilities in a cell. When you place the correct digit later, conflicting notes auto-clear!',
    tip: 'Tip: Notes prevent mistakes by letting you track candidates cleanly without guessing.',
    icon: <PenTool size={28} className="tut-icon-amber" />,
  },
  {
    step: 4,
    title: 'Step 4: Use Undo or Erase',
    description: 'Made an error or changed your deduction? Use "Undo" (or Ctrl+Z) to reverse steps, or "Erase" (Backspace/Delete) to clear user input from a cell.',
    tip: 'Tip: Initial clue numbers are protected and can never be accidentally erased.',
    icon: <RotateCcw size={28} className="tut-icon-slate" />,
  },
  {
    step: 5,
    title: 'Step 5: Use Lifelines when Stuck',
    description: 'Every puzzle comes with 2 free lifelines! Each lifeline provides a Smart Hint to safely reveal a cell. When you run out, solve a quick Maths Challenge to earn +1 Lifeline.',
    tip: 'Tip: Lifelines are unlimited through the mental maths challenge, so you never have to be blocked.',
    icon: <Sparkles size={28} className="tut-icon-gold" />,
  },
  {
    step: 6,
    title: 'Step 6: Complete the Puzzle & Earn Stars',
    description: 'Fill all 81 cells correctly with zero mistakes to claim a 3-star rating, record your personal best time, and advance to the next level in the 100-level map!',
    tip: 'Tip: Your puzzle state autosaves continuously. You can close or refresh at any time safely.',
    icon: <Star size={28} className="tut-icon-amber" fill="#e5b842" />,
  },
];

export const InteractiveTutorialModal: React.FC<InteractiveTutorialModalProps> = ({
  isOpen,
  onClose,
  onFinish,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIdx];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      setTutorialSeen(true);
    }
    onClose();
    if (onFinish) onFinish();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      setTutorialSeen(true);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tutorial-step-title">
      <div className="tutorial-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <span className="step-counter-pill">
              {currentStep.step} of {TUTORIAL_STEPS.length}
            </span>
            <h2 id="tutorial-step-title" className="modal-title">
              {currentStep.title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleSkip}
            aria-label="Skip and close tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="step-dots-bar" role="tablist" aria-label="Tutorial steps">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={`dot-${s.step}`}
              type="button"
              className={`step-dot ${idx === currentStepIdx ? 'dot-active' : idx < currentStepIdx ? 'dot-done' : ''}`}
              onClick={() => setCurrentStepIdx(idx)}
              aria-label={`Jump to ${s.title}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="tutorial-body">
          <div className="tutorial-icon-card">
            {currentStep.icon}
          </div>

          <p className="tutorial-desc">
            {currentStep.description}
          </p>

          <div className="tutorial-tip-card">
            <span>💡</span>
            <span>{currentStep.tip}</span>
          </div>
        </div>

        {/* Don't show again toggle */}
        <div className="tutorial-checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span>Don't show this tutorial again automatically</span>
          </label>
        </div>

        {/* Modal Footer Controls */}
        <div className="tutorial-footer">
          <button
            type="button"
            className="tertiary-btn skip-btn"
            onClick={handleSkip}
          >
            Skip Tutorial
          </button>

          <div className="nav-buttons-group">
            {!isFirst && (
              <button
                type="button"
                className="secondary-btn"
                onClick={handlePrev}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={handleNext}
              autoFocus
            >
              <span>{isLast ? 'Start Playing' : 'Next'}</span>
              {isLast ? <Check size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
