import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  LayoutGrid,
  Lock,
  Send,
  XCircle,
} from 'lucide-react';
import { ExamQuestionItem, OptionKey } from '../../types/exam';
import { MathText } from '../common/MathText';
import { VisualReferenceBox } from '../common/VisualReferenceBox';
import { QuestionPalette } from './QuestionPalette';
import { SubmitModal } from './SubmitModal';

interface ExamWorkspaceProps {
  items: ExamQuestionItem[];
  currentIndex: number;
  userAnswers: Record<string, OptionKey>;
  flaggedIds: Record<string, boolean>;
  onSelectAnswer: (questionId: string, originalKey: OptionKey) => void;
  onToggleFlag: (questionId: string) => void;
  onJumpToQuestion: (index: number) => void;
  onSubmitExam: () => void;
}

export const ExamWorkspace: React.FC<ExamWorkspaceProps> = ({
  items,
  currentIndex,
  userAnswers,
  flaggedIds,
  onSelectAnswer,
  onToggleFlag,
  onJumpToQuestion,
  onSubmitExam,
}) => {
  const [isPaletteOpenMobile, setIsPaletteOpenMobile] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const currentQuestion = items[currentIndex];
  const selectedOriginalKey = userAnswers[currentQuestion.id];
  const isQuestionAnswered = Boolean(selectedOriginalKey);
  const isCurrentAnswerCorrect =
    isQuestionAnswered && selectedOriginalKey === currentQuestion.correctAnswer;
  const isFlagged = Boolean(flaggedIds[currentQuestion.id]);

  const answeredCount = items.filter((i) => Boolean(userAnswers[i.id])).length;
  const flaggedCount = items.filter((i) => Boolean(flaggedIds[i.id])).length;
  const progressPercent = Math.round((answeredCount / items.length) * 100);

  // Keyboard navigation ergonomics (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitModalOpen || isPaletteOpenMobile) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) {
        onJumpToQuestion(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onJumpToQuestion(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, isSubmitModalOpen, isPaletteOpenMobile, onJumpToQuestion]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-12">
      {/* Top Progress Bar */}
      <div className="mb-6 rounded-2xl border border-roseGold-border bg-white p-3.5 sm:px-5 shadow-rose-sm">
        <div className="flex items-center justify-between text-xs font-bold text-espresso-700 mb-2">
          <span>
            Completion Progress ({answeredCount} of {items.length} Answered)
          </span>
          <span className="font-display text-espresso-900">{progressPercent}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-roseGold-blush">
          <div
            className="h-full rounded-full bg-gradient-to-r from-roseGold-soft to-roseGold-deep transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active Question Card */}
        <div className="lg:col-span-8">
          <article className="rounded-3xl border border-roseGold-border bg-white p-5 sm:p-8 shadow-rose-md">
            {/* Question Metadata Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-roseGold-blush">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-espresso-900 px-3 py-1 font-display text-xs sm:text-sm text-white">
                  Question {currentIndex + 1} of {items.length}
                </span>
                <span className="rounded-xl bg-roseGold-blush border border-roseGold-border px-3 py-1 text-xs font-bold text-roseGold-dark">
                  {currentQuestion.area}
                </span>
                <span className="rounded-xl bg-roseGold-ivory border border-roseGold-border px-3 py-1 text-xs font-bold text-espresso-800">
                  {currentQuestion.topic}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isQuestionAnswered && (
                  <span
                    className="inline-flex items-center gap-1 rounded-xl bg-roseGold-ivory border border-roseGold-border px-2.5 py-1.5 text-xs font-bold text-espresso-700"
                    title="Your answer for this item is locked for this session"
                  >
                    <Lock className="h-3.5 w-3.5 text-roseGold-deep" />
                    Locked
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onToggleFlag(currentQuestion.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-bold transition ${
                    isFlagged
                      ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-roseGold-border bg-roseGold-ivory text-espresso-700 hover:bg-roseGold-blush'
                  }`}
                >
                  <Flag
                    className={`h-4 w-4 ${
                      isFlagged ? 'text-amber-600 fill-amber-500' : 'text-espresso-600'
                    }`}
                  />
                  {isFlagged ? 'Flagged' : 'Flag for Review'}
                </button>
              </div>
            </div>

            {/* Visual Reference Callout Box (if applicable) */}
            <VisualReferenceBox
              visualReference={currentQuestion.visualReference}
              imageSrc={currentQuestion.imageSrc}
            />

            {/* Question Stem */}
            <div className="mb-6 text-base sm:text-lg font-semibold leading-relaxed text-espresso-900">
              <MathText text={currentQuestion.question} as="div" />
            </div>

            {/* Shuffled Answer Choices */}
            <div className="space-y-3" role="radiogroup" aria-label="Answer Options">
              {currentQuestion.shuffledOptions.map((option) => {
                const isSelected = selectedOriginalKey === option.originalKey;
                const isCorrectOption = option.originalKey === currentQuestion.correctAnswer;

                let cardStyle =
                  'border-roseGold-border bg-roseGold-ivory/40 hover:border-roseGold-soft hover:bg-roseGold-blush/35 cursor-pointer';
                let badgeStyle =
                  'bg-white text-espresso-800 border border-roseGold-border group-hover:border-roseGold-soft';

                if (isQuestionAnswered) {
                  if (isCorrectOption) {
                    cardStyle =
                      'border-emerald-500 bg-emerald-50/90 shadow-xs cursor-default';
                    badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isSelected && !isCorrectOption) {
                    cardStyle =
                      'border-rose-500 bg-rose-50/90 shadow-xs cursor-default';
                    badgeStyle = 'bg-rose-600 text-white border-rose-600';
                  } else {
                    cardStyle =
                      'border-roseGold-border/70 bg-roseGold-ivory/25 opacity-75 cursor-default';
                    badgeStyle = 'bg-white text-espresso-600 border border-roseGold-border';
                  }
                }

                return (
                  <button
                    key={option.originalKey}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isQuestionAnswered}
                    onClick={() => {
                      if (!isQuestionAnswered) {
                        onSelectAnswer(currentQuestion.id, option.originalKey);
                      }
                    }}
                    className={`group w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-150 ${cardStyle}`}
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-sm transition ${badgeStyle}`}
                      >
                        {option.displayLabel}
                      </span>

                      <div className="pt-0.5 text-sm sm:text-base font-medium leading-relaxed text-espresso-900 flex-1">
                        <MathText text={option.text} />
                      </div>
                    </div>

                    {isQuestionAnswered && (
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {isCorrectOption && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {isSelected ? 'Correct Choice' : 'Correct Answer'}
                          </span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs">
                            <XCircle className="h-3.5 w-3.5" />
                            Your Answer (Wrong)
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Banner + Technical Rationale upon Answering */}
            {isQuestionAnswered && (
              <div className="mt-6 space-y-4 animate-fadeIn">
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 ${
                    isCurrentAnswerCorrect
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                      : 'border-rose-300 bg-rose-50 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isCurrentAnswerCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    )}
                    <span className="font-display text-sm sm:text-base">
                      {isCurrentAnswerCorrect
                        ? 'Correct! Well done.'
                        : 'Incorrect. Review the technical rationale below.'}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-80">
                    <Lock className="h-3 w-3" />
                    Answer locked for this session
                  </span>
                </div>

                <div className="rounded-2xl border border-roseGold-soft bg-gradient-to-br from-roseGold-blush/90 to-roseGold-ivory p-4 sm:p-5 shadow-rose-sm">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-roseGold-dark mb-2">
                    <BookOpen className="h-4 w-4 text-roseGold-deep" />
                    Technical Rationale
                  </div>
                  <div className="text-sm sm:text-[15px] leading-relaxed text-espresso-800">
                    <MathText text={currentQuestion.rationale} as="div" />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Footer Navigation Controls */}
            <div className="hidden sm:flex items-center justify-between gap-4 mt-8 pt-6 border-t border-roseGold-blush">
              <button
                type="button"
                onClick={() => onJumpToQuestion(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-roseGold-border bg-roseGold-ivory px-5 py-3 text-sm font-bold text-espresso-800 transition hover:bg-roseGold-tint disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaletteOpenMobile(true)}
                  className="lg:hidden inline-flex items-center gap-2 rounded-2xl border border-roseGold-soft bg-roseGold-blush px-4 py-3 text-sm font-bold text-espresso-900"
                >
                  <LayoutGrid className="h-4 w-4 text-roseGold-dark" />
                  Palette ({answeredCount}/{items.length})
                </button>

                {currentIndex < items.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => onJumpToQuestion(currentIndex + 1)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-roseGold-deep to-roseGold-dark px-6 py-3 font-display text-sm text-white shadow-rose-sm transition hover:brightness-105"
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-espresso-900 px-6 py-3 font-display text-sm text-white shadow-rose-md transition hover:bg-espresso-800"
                  >
                    <Send className="h-4 w-4" />
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>

        {/* Question Palette Sidebar / Mobile Drawer */}
        <QuestionPalette
          items={items}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          flaggedIds={flaggedIds}
          onJumpToQuestion={onJumpToQuestion}
          onRequestSubmit={() => setIsSubmitModalOpen(true)}
          isOpenMobile={isPaletteOpenMobile}
          onCloseMobile={() => setIsPaletteOpenMobile(false)}
        />
      </div>

      {/* Sticky Bottom Action Bar for Mobile Screens */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-roseGold-border bg-white/95 backdrop-blur-md px-3 py-2.5 shadow-rose-lg sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onJumpToQuestion(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex h-11 items-center justify-center rounded-xl border border-roseGold-border bg-roseGold-ivory px-3.5 text-xs font-bold text-espresso-800 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </button>

          <button
            type="button"
            onClick={() => setIsPaletteOpenMobile(true)}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-roseGold-soft bg-roseGold-blush px-3 text-xs font-bold text-espresso-900"
          >
            <LayoutGrid className="h-4 w-4 text-roseGold-dark" />
            <span>
              {currentIndex + 1} / {items.length}
            </span>
          </button>

          {currentIndex < items.length - 1 ? (
            <button
              type="button"
              onClick={() => onJumpToQuestion(currentIndex + 1)}
              className="flex h-11 items-center justify-center rounded-xl bg-roseGold-deep px-4 font-display text-xs text-white shadow-xs"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="flex h-11 items-center justify-center rounded-xl bg-espresso-900 px-4 font-display text-xs text-white shadow-xs"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        totalQuestions={items.length}
        answeredCount={answeredCount}
        flaggedCount={flaggedCount}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirmSubmit={() => {
          setIsSubmitModalOpen(false);
          onSubmitExam();
        }}
      />
    </main>
  );
};
