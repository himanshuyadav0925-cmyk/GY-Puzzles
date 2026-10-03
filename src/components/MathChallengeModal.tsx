import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, CheckCircle2, XCircle, ArrowRight, X, RotateCcw } from 'lucide-react';
import type { MathQuestion } from '../types/sudoku';
import { generateMathQuestion } from '../utils/mathGenerator';
import { sound } from '../utils/sound';
import { voice } from '../utils/voice';

interface MathChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardLifeline: () => void;
  currentLifelines: number;
}

export const MathChallengeModal: React.FC<MathChallengeModalProps> = ({
  isOpen,
  onClose,
  onRewardLifeline,
  currentLifelines,
}) => {
  const [question, setQuestion] = useState<MathQuestion | null>(() => (isOpen ? generateMathQuestion() : null));
  const [userInputValue, setUserInputValue] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [earnedCount, setEarnedCount] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuestion(generateMathQuestion());
      setUserInputValue('');
      setStatus('idle');
      setExplanation('');
      setEarnedCount(0);
    }
  }

  // Initialize or reset question
  const loadNewQuestion = () => {
    const q = generateMathQuestion();
    setQuestion(q);
    setUserInputValue('');
    setStatus('idle');
    setExplanation('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !question) return null;

  const handleSubmitAnswer = (submittedVal: number) => {
    if (status === 'correct') return;

    if (submittedVal === question.answer) {
      setStatus('correct');
      sound.playMathCorrect();
      voice.speakMathCorrect();
      setEarnedCount((prev) => prev + 1);
      setExplanation(`${question.num1} ${question.operator} ${question.num2} = ${question.answer}`);
      onRewardLifeline();
    } else {
      setStatus('wrong');
      sound.playMistake();
      setExplanation(
        `Note: ${question.num1} ${question.operator} ${question.num2} = ${question.answer}`
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(userInputValue.trim(), 10);
    if (isNaN(parsed)) return;
    handleSubmitAnswer(parsed);
  };

  const handleSelectOption = (optVal: number) => {
    setUserInputValue(optVal.toString());
    handleSubmitAnswer(optVal);
  };

  return (
    <div
      className="modal-backdrop math-challenge-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="math-challenge-title"
    >
      <div className="math-modal-card">
        {/* Header with clear requirement title */}
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <div className="modal-badge-icon">
              <Brain size={22} />
            </div>
            <div>
              <h2 id="math-challenge-title" className="modal-title brand-gold-text">
                Earn +1 Lifeline
              </h2>
              <p className="modal-subtitle">
                Solve this arithmetic challenge to earn a free Smart Hint!
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close challenge"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current status banner */}
        <div className="lifeline-status-ribbon">
          <span>Active Lifelines: <strong>{currentLifelines}</strong></span>
          {earnedCount > 0 && (
            <span className="earned-badge">
              <Sparkles size={14} /> +{earnedCount} Earned!
            </span>
          )}
        </div>

        {/* Question Equation Card */}
        <div className="equation-card">
          <div className="operation-tag">
            {question.operator === '+' && 'Addition Challenge'}
            {question.operator === '-' && 'Subtraction Challenge'}
            {question.operator === '×' && 'Multiplication Challenge'}
            {question.operator === '÷' && 'Division Challenge'}
          </div>

          <div className="equation-display" aria-label={`Question: ${question.num1} ${question.operator} ${question.num2}`}>
            <span className="eq-num">{question.num1}</span>
            <span className="eq-op">{question.operator}</span>
            <span className="eq-num">{question.num2}</span>
            <span className="eq-equals">=</span>
            <span className={`eq-answer-box ${status}`}>
              {status === 'correct' ? question.answer : userInputValue || '?'}
            </span>
          </div>
        </div>

        {/* Direct Answer Input Form */}
        <form onSubmit={handleFormSubmit} className="math-input-form">
          <div className="math-input-group">
            <input
              ref={inputRef}
              type="number"
              className="math-answer-input"
              placeholder="Your answer"
              value={userInputValue}
              onChange={(e) => setUserInputValue(e.target.value)}
              disabled={status === 'correct'}
              aria-label="Enter your arithmetic answer"
            />
            <button
              type="submit"
              className="primary-btn math-submit-btn"
              disabled={!userInputValue.trim() || status === 'correct'}
            >
              Submit Answer
            </button>
          </div>
        </form>

        {/* Quick Tap Choices */}
        <div className="math-quick-options">
          <span className="options-prompt">Or choose from options:</span>
          <div className="options-grid">
            {question.options.map((opt, idx) => {
              const isCorrect = status === 'correct' && opt === question.answer;
              const isWrong = status === 'wrong' && userInputValue === opt.toString();

              return (
                <button
                  key={`opt-${idx}-${opt}`}
                  type="button"
                  className={`option-btn ${
                    isCorrect ? 'btn-correct' : isWrong ? 'btn-wrong' : ''
                  }`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={status === 'correct'}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Message according to Section 9 */}
        {status === 'correct' && (
          <div className="feedback-banner correct-banner" role="alert">
            <CheckCircle2 size={20} />
            <div>
              <strong>Correct! +1 Lifeline</strong>
              <div className="feedback-sub">{explanation}</div>
            </div>
          </div>
        )}

        {status === 'wrong' && (
          <div className="feedback-banner wrong-banner" role="alert">
            <XCircle size={20} />
            <div>
              <strong>Not quite. Try again.</strong>
              {explanation && <div className="feedback-sub">{explanation}</div>}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="modal-footer">
          {status === 'correct' ? (
            <div className="math-footer-btns">
              <button
                type="button"
                className="secondary-btn"
                onClick={loadNewQuestion}
              >
                <RotateCcw size={16} />
                <span>Next Challenge (+1)</span>
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={onClose}
                autoFocus
              >
                <span>Return to Sudoku</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="math-footer-btns">
              <button
                type="button"
                className="secondary-btn"
                onClick={loadNewQuestion}
              >
                Skip Question
              </button>
              <button
                type="button"
                className="tertiary-btn"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
