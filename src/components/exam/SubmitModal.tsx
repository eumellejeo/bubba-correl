import React from 'react';
import { AlertTriangle, CheckCircle2, Flag, HelpCircle, Send, X } from 'lucide-react';

interface SubmitModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onCancel: () => void;
  onConfirmSubmit: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  flaggedCount,
  onCancel,
  onConfirmSubmit,
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl border-2 border-roseGold-soft bg-white p-6 shadow-rose-lg">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-roseGold-blush border border-roseGold-soft text-roseGold-dark">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl text-espresso-900">
                Submit Examination?
              </h3>
              <p className="text-xs font-medium text-espresso-600">
                Review your session status before finalizing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-1.5 text-espresso-600 hover:bg-roseGold-blush"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 mx-auto mb-1" />
            <div className="font-display text-lg text-emerald-950">{answeredCount}</div>
            <div className="text-[11px] font-bold text-emerald-800">Answered</div>
          </div>

          <div className="rounded-2xl bg-roseGold-ivory border border-roseGold-border p-3 text-center">
            <HelpCircle className="h-4 w-4 text-espresso-700 mx-auto mb-1" />
            <div className="font-display text-lg text-espresso-900">{unansweredCount}</div>
            <div className="text-[11px] font-bold text-espresso-700">Unanswered</div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-center">
            <Flag className="h-4 w-4 text-amber-700 fill-amber-500 mx-auto mb-1" />
            <div className="font-display text-lg text-amber-950">{flaggedCount}</div>
            <div className="text-[11px] font-bold text-amber-800">Flagged</div>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs font-semibold text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              You still have <strong>{unansweredCount}</strong> unanswered{' '}
              {unansweredCount === 1 ? 'question' : 'questions'}. Unanswered items will be marked
              incorrect upon submission.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-roseGold-border bg-roseGold-ivory px-4 py-3 text-sm font-bold text-espresso-800 transition hover:bg-roseGold-tint"
          >
            Return to Exam
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-roseGold-deep to-roseGold-dark px-4 py-3 font-display text-sm text-white shadow-rose-md transition hover:brightness-105"
          >
            <Send className="h-4 w-4" />
            Confirm &amp; Grade
          </button>
        </div>
      </div>
    </div>
  );
};

