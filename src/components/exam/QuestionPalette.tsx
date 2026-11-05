import React from 'react';
import { CheckCircle2, Flag, HelpCircle, Send, X, XCircle } from 'lucide-react';
import { ExamQuestionItem, OptionKey } from '../../types/exam';

interface QuestionPaletteProps {
  items: ExamQuestionItem[];
  currentIndex: number;
  userAnswers: Record<string, OptionKey>;
  flaggedIds: Record<string, boolean>;
  onJumpToQuestion: (index: number) => void;
  onRequestSubmit: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  items,
  currentIndex,
  userAnswers,
  flaggedIds,
  onJumpToQuestion,
  onRequestSubmit,
  isOpenMobile,
  onCloseMobile,
}) => {
  const answeredCount = items.filter((item) => Boolean(userAnswers[item.id])).length;
  const correctCount = items.filter(
    (item) => userAnswers[item.id] && userAnswers[item.id] === item.correctAnswer
  ).length;
  const wrongCount = answeredCount - correctCount;
  const flaggedCount = items.filter((item) => Boolean(flaggedIds[item.id])).length;
  const unansweredCount = items.length - answeredCount;

  const paletteContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-roseGold-border">
        <div>
          <h3 className="font-display text-base sm:text-lg text-espresso-900">
            Question Navigator
          </h3>
          <p className="text-xs text-espresso-600">
            Jump directly to any examination item
          </p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden rounded-xl p-1.5 text-espresso-700 hover:bg-roseGold-blush"
          aria-label="Close navigator"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Status Legend & Live Score Counters */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-900">
            <CheckCircle2 className="h-3 w-3 text-emerald-700 shrink-0" />
            Correct
          </div>
          <span className="font-display text-sm sm:text-base text-emerald-700">
            {correctCount}
          </span>
        </div>

        <div className="rounded-xl bg-rose-50/90 border border-rose-200 px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-900">
            <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
            Wrong
          </div>
          <span className="font-display text-sm sm:text-base text-rose-600">
            {wrongCount}
          </span>
        </div>

        <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-900">
            <Flag className="h-3 w-3 text-amber-700 fill-amber-500 shrink-0" />
            Flagged
          </div>
          <span className="font-display text-sm sm:text-base text-amber-950">
            {flaggedCount}
          </span>
        </div>

        <div className="rounded-xl bg-roseGold-ivory border border-roseGold-border px-2 py-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-espresso-700">
            <HelpCircle className="h-3 w-3 text-espresso-600 shrink-0" />
            Left
          </div>
          <span className="font-display text-sm sm:text-base text-espresso-900">
            {unansweredCount}
          </span>
        </div>
      </div>

      {/* Scrollable Number Grid */}
      <div className="flex-1 overflow-y-auto px-1 py-1 max-h-[52vh] lg:max-h-[48vh]">
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
          {items.map((item, idx) => {
            const isCurrent = idx === currentIndex;
            const userChoice = userAnswers[item.id];
            const isAnswered = Boolean(userChoice);
            const isCorrect = isAnswered && userChoice === item.correctAnswer;
            const isFlagged = Boolean(flaggedIds[item.id]);

            let buttonStyle = '';

            if (!isAnswered) {
              if (isCurrent) {
                // Matches Screenshot 2: darker rose-gold background with lighter number
                buttonStyle =
                  'bg-roseGold-deep text-white border-roseGold-deep font-bold shadow-sm';
              } else {
                buttonStyle =
                  'bg-roseGold-ivory text-espresso-800 border-roseGold-border font-semibold hover:bg-roseGold-blush hover:border-roseGold-soft';
              }
            } else {
              // Question is done answering: number is green if correct, red if wrong
              if (isCurrent) {
                buttonStyle = isCorrect
                  ? 'bg-roseGold-tint border-2 border-roseGold-deep text-emerald-700 font-extrabold shadow-sm'
                  : 'bg-roseGold-tint border-2 border-roseGold-deep text-rose-600 font-extrabold shadow-sm';
              } else {
                buttonStyle = isCorrect
                  ? 'bg-white border-roseGold-deep text-emerald-600 font-extrabold hover:bg-roseGold-blush/50'
                  : 'bg-white border-roseGold-deep text-rose-600 font-extrabold hover:bg-roseGold-blush/50';
              }
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onJumpToQuestion(idx);
                  onCloseMobile();
                }}
                className={`relative flex h-10 w-full items-center justify-center rounded-xl border text-xs sm:text-sm transition-all ${buttonStyle}`}
                title={`Item ${idx + 1}: ${item.topic}${isFlagged ? ' (Flagged)' : ''}${
                  isAnswered
                    ? isCorrect
                      ? ' (Answered - Correct)'
                      : ' (Answered - Incorrect)'
                    : ' (Unanswered)'
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span
                    className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
                    aria-label="Flagged for review"
                  >
                    <Flag className="h-2 w-2 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Exam Action */}
      <div className="pt-4 mt-4 border-t border-roseGold-border">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onRequestSubmit();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-espresso-900 px-4 py-3.5 font-display text-sm sm:text-base text-white shadow-rose-md transition hover:bg-espresso-800 active:scale-[0.99]"
        >
          <Send className="h-4 w-4" />
          Submit Examination
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
        <div className="rounded-3xl border border-roseGold-border bg-white p-5 shadow-rose-md">
          {paletteContent}
        </div>
      </aside>

      {/* Mobile / Tablet Slide-over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-espresso-900/50 backdrop-blur-xs p-0 sm:p-4 lg:hidden">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-roseGold-border bg-white p-5 shadow-rose-lg max-h-[85vh] flex flex-col">
            {paletteContent}
          </div>
        </div>
      )}
    </>
  );
};
