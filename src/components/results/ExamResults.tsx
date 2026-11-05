import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Filter,
  Flag,
  HelpCircle,
  RefreshCw,
  Sliders,
  XCircle,
} from 'lucide-react';
import { ExamQuestionItem, OptionKey } from '../../types/exam';
import { MathText } from '../common/MathText';
import { VisualReferenceBox } from '../common/VisualReferenceBox';

interface ExamResultsProps {
  items: ExamQuestionItem[];
  userAnswers: Record<string, OptionKey>;
  flaggedIds: Record<string, boolean>;
  onRetakeSameConfig: () => void;
  onReturnToLobby: () => void;
}

type ReviewFilter = 'ALL' | 'INCORRECT' | 'CORRECT' | 'FLAGGED';

export const ExamResults: React.FC<ExamResultsProps> = ({
  items,
  userAnswers,
  flaggedIds,
  onRetakeSameConfig,
  onReturnToLobby,
}) => {
  const [filterMode, setFilterMode] = useState<ReviewFilter>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    const byTopic: Record<
      string,
      { topic: string; area: string; correct: number; total: number }
    > = {};

    for (const item of items) {
      const userAns = userAnswers[item.id];
      const isCorrect = userAns === item.correctAnswer;

      if (!userAns) {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      if (!byTopic[item.topicSlug]) {
        byTopic[item.topicSlug] = {
          topic: item.topic,
          area: item.area,
          correct: 0,
          total: 0,
        };
      }
      byTopic[item.topicSlug].total++;
      if (isCorrect) {
        byTopic[item.topicSlug].correct++;
      }
    }

    const total = items.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      incorrect,
      unanswered,
      percentage,
      topicBreakdown: Object.values(byTopic),
    };
  }, [items, userAnswers]);

  const filteredItems = useMemo(() => {
    return items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        if (selectedTopic !== 'ALL' && item.topic !== selectedTopic) {
          return false;
        }
        const userAns = userAnswers[item.id];
        const isCorrect = userAns === item.correctAnswer;

        if (filterMode === 'CORRECT') return isCorrect;
        if (filterMode === 'INCORRECT') return !isCorrect;
        if (filterMode === 'FLAGGED') return Boolean(flaggedIds[item.id]);
        return true;
      });
  }, [items, userAnswers, flaggedIds, filterMode, selectedTopic]);

  const uniqueTopics = useMemo(
    () => Array.from(new Set(items.map((i) => i.topic))),
    [items]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {/* Score Summary Hero Card */}
      <section className="rounded-3xl border-2 border-roseGold-soft bg-white p-6 sm:p-8 shadow-rose-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Score Circle & Verdict */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6 border-b lg:border-b-0 lg:border-r border-roseGold-border pb-6 lg:pb-0 lg:pr-6">
            <div className="relative flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-4 border-roseGold-deep bg-gradient-to-br from-roseGold-blush to-roseGold-tint shadow-rose-md">
              <span className="font-display text-3xl text-espresso-900">
                {stats.percentage}%
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-espresso-700 mt-0.5">
                {stats.correct} / {stats.total}
              </span>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-roseGold-blush border border-roseGold-border px-3 py-1 text-xs font-bold uppercase tracking-wider text-roseGold-dark mb-2">
                <Award className="h-3.5 w-3.5 text-roseGold-deep" />
                Examination Complete
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-espresso-900 mb-1.5">
                {stats.percentage >= 70
                  ? 'Strong Licensure Readiness!'
                  : 'Keep Reviewing the Rationales!'}
              </h2>
              <p className="text-xs sm:text-sm text-espresso-700 leading-relaxed">
                Review each item below to compare your choice against the board answer key and
                study the detailed technical rationale.
              </p>
            </div>
          </div>

          {/* Stat Metrics + Subject Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50/90 border border-emerald-200 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  Correct
                </div>
                <span className="font-display text-xl sm:text-2xl text-emerald-950">
                  {stats.correct}
                </span>
              </div>

              <div className="rounded-2xl bg-rose-50/90 border border-rose-200 p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-900 mb-1">
                  <XCircle className="h-4 w-4 text-rose-700" />
                  Incorrect
                </div>
                <span className="font-display text-xl sm:text-2xl text-rose-950">
                  {stats.incorrect}
                </span>
              </div>

              <div className="rounded-2xl bg-roseGold-ivory border border-roseGold-border p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-espresso-700 mb-1">
                  <HelpCircle className="h-4 w-4 text-espresso-600" />
                  Unanswered
                </div>
                <span className="font-display text-xl sm:text-2xl text-espresso-900">
                  {stats.unanswered}
                </span>
              </div>
            </div>

            {/* Subject Breakdown Bars */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-espresso-700">
                Performance Breakdown by Subject
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {stats.topicBreakdown.map((tb) => {
                  const pct = Math.round((tb.correct / tb.total) * 100);
                  return (
                    <div
                      key={tb.topic}
                      className="rounded-xl border border-roseGold-border bg-roseGold-ivory/70 p-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-espresso-900 mb-1.5">
                        <span className="truncate pr-2">{tb.topic}</span>
                        <span className="shrink-0 font-display">
                          {tb.correct}/{tb.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-roseGold-blush">
                        <div
                          className="h-full rounded-full bg-roseGold-deep transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onReturnToLobby}
                className="inline-flex items-center gap-2 rounded-2xl border border-roseGold-border bg-roseGold-ivory px-4 py-2.5 text-xs sm:text-sm font-bold text-espresso-800 transition hover:bg-roseGold-tint"
              >
                <Sliders className="h-4 w-4 text-roseGold-dark" />
                Configure New Exam
              </button>
              <button
                type="button"
                onClick={onRetakeSameConfig}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-roseGold-deep to-roseGold-dark px-5 py-2.5 font-display text-xs sm:text-sm text-white shadow-rose-sm transition hover:brightness-105"
              >
                <RefreshCw className="h-4 w-4" />
                Retake With Fresh Random Sample
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Answer Review & Technical Rationale Section */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-roseGold-border bg-white p-4 sm:p-5 shadow-rose-sm">
          <div>
            <h3 className="font-display text-lg sm:text-xl text-espresso-900">
              Complete Answer Review &amp; Technical Rationales
            </h3>
            <p className="text-xs text-espresso-600">
              Showing {filteredItems.length} of {items.length} examination items
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Pills */}
            {(
              [
                { id: 'ALL', label: `All (${items.length})` },
                {
                  id: 'INCORRECT',
                  label: `Incorrect / Missed (${stats.incorrect + stats.unanswered})`,
                },
                { id: 'CORRECT', label: `Correct (${stats.correct})` },
                {
                  id: 'FLAGGED',
                  label: `Flagged (${items.filter((i) => flaggedIds[i.id]).length})`,
                },
              ] as { id: ReviewFilter; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  filterMode === tab.id
                    ? 'bg-espresso-900 text-white shadow-xs'
                    : 'bg-roseGold-ivory text-espresso-800 border border-roseGold-border hover:bg-roseGold-blush'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Topic Dropdown Filter */}
            {uniqueTopics.length > 1 && (
              <div className="relative flex items-center">
                <Filter className="h-3.5 w-3.5 text-espresso-600 absolute left-3 pointer-events-none" />
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  aria-label="Filter by subject"
                  className="rounded-xl border border-roseGold-border bg-roseGold-blush/60 pl-8 pr-3 py-1.5 text-xs font-bold text-espresso-900 focus:border-roseGold-deep focus:outline-none"
                >
                  <option value="ALL">All Subjects</option>
                  {uniqueTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Review Items List */}
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-roseGold-border bg-white p-10 text-center shadow-rose-sm">
            <p className="font-display text-lg text-espresso-800 mb-1">
              No questions match this filter
            </p>
            <p className="text-xs text-espresso-600">
              Try switching the filter tab above to view other questions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map(({ item, originalIndex }) => {
              const userOriginalKey = userAnswers[item.id];
              const isCorrect = userOriginalKey === item.correctAnswer;
              const isUnanswered = !userOriginalKey;
              const isFlagged = Boolean(flaggedIds[item.id]);

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-roseGold-border bg-white p-5 sm:p-7 shadow-rose-sm"
                >
                  {/* Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-roseGold-blush">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-espresso-900 px-3 py-1 font-display text-xs text-white">
                        Item #{originalIndex + 1}
                      </span>
                      <span className="rounded-xl bg-roseGold-blush border border-roseGold-border px-2.5 py-1 text-xs font-bold text-roseGold-dark">
                        {item.area} • {item.topic}
                      </span>
                      {isFlagged && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-300 px-2.5 py-1 text-xs font-bold text-amber-900">
                          <Flag className="h-3 w-3 fill-amber-500 text-amber-700" />
                          Flagged
                        </span>
                      )}
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          Correct Answer
                        </span>
                      ) : isUnanswered ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-950">
                          <HelpCircle className="h-4 w-4 text-amber-700" />
                          Unanswered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 border border-rose-300 px-3 py-1 text-xs font-bold text-rose-900">
                          <XCircle className="h-4 w-4 text-rose-700" />
                          Incorrect Choice
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Reference Callout */}
                  <VisualReferenceBox
                    visualReference={item.visualReference}
                    imageSrc={item.imageSrc}
                  />

                  {/* Question Stem */}
                  <div className="mb-5 text-base sm:text-lg font-semibold leading-relaxed text-espresso-900">
                    <MathText text={item.question} as="div" />
                  </div>

                  {/* Options List with Soft Green / Soft Rose Highlighting */}
                  <div className="space-y-2.5 mb-6">
                    {item.shuffledOptions.map((opt) => {
                      const isThisCorrect = opt.originalKey === item.correctAnswer;
                      const isThisUserChoice = opt.originalKey === userOriginalKey;

                      let containerStyle =
                        'border-roseGold-border/80 bg-roseGold-ivory/40 text-espresso-800';
                      let badgeStyle =
                        'bg-white text-espresso-700 border border-roseGold-border';

                      if (isThisCorrect) {
                        containerStyle =
                          'border-emerald-400 bg-emerald-50/90 text-espresso-900 shadow-xs';
                        badgeStyle = 'bg-emerald-700 text-white';
                      } else if (isThisUserChoice && !isThisCorrect) {
                        containerStyle =
                          'border-rose-400 bg-rose-50/90 text-espresso-900 shadow-xs';
                        badgeStyle = 'bg-rose-700 text-white';
                      }

                      return (
                        <div
                          key={opt.originalKey}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border-2 p-3.5 transition ${containerStyle}`}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-xs ${badgeStyle}`}
                            >
                              {opt.displayLabel}
                            </span>
                            <div className="text-sm sm:text-base font-medium leading-relaxed text-espresso-900">
                              <MathText text={opt.text} />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {isThisCorrect && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                <CheckCircle2 className="h-3 w-3" />
                                Correct Key
                              </span>
                            )}
                            {isThisUserChoice && !isThisCorrect && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                <XCircle className="h-3 w-3" />
                                Your Choice
                              </span>
                            )}
                            {isThisUserChoice && isThisCorrect && (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                Your Choice
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Technical Rationale Callout */}
                  <div className="rounded-2xl border border-roseGold-soft bg-gradient-to-br from-roseGold-blush/85 to-roseGold-ivory p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-roseGold-dark mb-2">
                      <BookOpen className="h-4 w-4 text-roseGold-deep" />
                      Technical Rationale
                    </div>
                    <div className="text-sm sm:text-[15px] leading-relaxed text-espresso-800">
                      <MathText text={item.rationale} as="div" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

