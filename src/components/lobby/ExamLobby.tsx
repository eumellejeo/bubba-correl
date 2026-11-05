import React from 'react';
import {
  BookOpen,
  Building2,
  CheckSquare,
  Layers,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { AreaSelectionMode, TopicMetadata } from '../../types/exam';
import { isTopicActiveInAreaMode, TOPICS_METADATA } from '../../utils/examEngine';

interface ExamLobbyProps {
  areaMode: AreaSelectionMode;
  topicQuotas: Record<string, number>;
  onChangeAreaMode: (mode: AreaSelectionMode) => void;
  onChangeTopicQuota: (slug: string, count: number) => void;
  onSelectAllActive: () => void;
  onResetActive: () => void;
  onStartExam: () => void;
}

const PRESET_COUNTS = [0, 10, 20, 30, 60];

export const ExamLobby: React.FC<ExamLobbyProps> = ({
  areaMode,
  topicQuotas,
  onChangeAreaMode,
  onChangeTopicQuota,
  onSelectAllActive,
  onResetActive,
  onStartExam,
}) => {
  const activeTopics = TOPICS_METADATA.filter((t) => isTopicActiveInAreaMode(t, areaMode));

  const areaATopics = TOPICS_METADATA.filter((t) => t.area === 'Area A');
  const areaBTopics = TOPICS_METADATA.filter((t) => t.area === 'Area B');

  const totalAreaAQueued =
    areaMode === 'AREA_B'
      ? 0
      : areaATopics.reduce((sum, t) => sum + (topicQuotas[t.slug] || 0), 0);

  const totalAreaBQueued =
    areaMode === 'AREA_A'
      ? 0
      : areaBTopics.reduce((sum, t) => sum + (topicQuotas[t.slug] || 0), 0);

  const totalQueued = totalAreaAQueued + totalAreaBQueued;
  const maxPossibleActive = activeTopics.reduce((sum, t) => sum + t.totalAvailable, 0);

  const renderTopicCard = (topic: TopicMetadata) => {
    const quota = topicQuotas[topic.slug] ?? 0;
    const isSelected = quota > 0;

    return (
      <div
        key={topic.slug}
        className={`group flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
          isSelected
            ? 'border-roseGold-deep bg-white shadow-rose-md'
            : 'border-roseGold-border/80 bg-white/60 opacity-85 hover:opacity-100 hover:border-roseGold-soft'
        }`}
      >
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="inline-block rounded-md bg-roseGold-blush px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-roseGold-dark border border-roseGold-border mb-1.5">
                {topic.area} • {topic.totalAvailable} Items Pool
              </span>
              <h4 className="font-display text-base sm:text-lg text-espresso-900">
                {topic.name}
              </h4>
            </div>
            <div
              className={`flex h-9 min-w-[3.25rem] items-center justify-center rounded-xl px-2.5 font-display text-sm transition ${
                isSelected
                  ? 'bg-roseGold-deep text-white shadow-sm'
                  : 'bg-roseGold-blush text-espresso-600 border border-roseGold-border'
              }`}
            >
              {quota}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-espresso-700 leading-relaxed mb-4">
            {topic.description}
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-roseGold-blush">
          {/* Interactive Stepper + Direct Number Input */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-espresso-700">
              Question Quota
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChangeTopicQuota(topic.slug, Math.max(0, quota - 5))}
                disabled={quota <= 0}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-roseGold-border bg-roseGold-ivory text-espresso-800 transition hover:bg-roseGold-tint disabled:opacity-40 disabled:pointer-events-none"
                title="Decrease by 5"
                aria-label={`Decrease ${topic.name} questions`}
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                type="number"
                min={0}
                max={topic.totalAvailable}
                value={quota}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChangeTopicQuota(
                    topic.slug,
                    Number.isNaN(val) ? 0 : Math.max(0, Math.min(topic.totalAvailable, val))
                  );
                }}
                aria-label={`${topic.name} question count`}
                className="h-9 w-16 rounded-xl border border-roseGold-soft bg-white text-center font-display text-sm text-espresso-900 focus:border-roseGold-deep focus:outline-none focus:ring-2 focus:ring-roseGold-soft/40"
              />

              <button
                type="button"
                onClick={() =>
                  onChangeTopicQuota(topic.slug, Math.min(topic.totalAvailable, quota + 5))
                }
                disabled={quota >= topic.totalAvailable}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-roseGold-border bg-roseGold-ivory text-espresso-800 transition hover:bg-roseGold-tint disabled:opacity-40 disabled:pointer-events-none"
                title="Increase by 5"
                aria-label={`Increase ${topic.name} questions`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div className="flex items-center justify-between gap-1">
            {PRESET_COUNTS.map((preset) => {
              const activePreset = quota === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChangeTopicQuota(topic.slug, preset)}
                  className={`flex-1 rounded-lg py-1 text-xs font-bold transition ${
                    activePreset
                      ? 'bg-espresso-900 text-white shadow-sm'
                      : 'bg-roseGold-ivory text-espresso-700 hover:bg-roseGold-tint border border-roseGold-border/70'
                  }`}
                >
                  {preset === 60 ? 'All (60)' : preset === 0 ? 'None' : preset}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-roseGold-border bg-gradient-to-br from-white via-roseGold-blush/80 to-roseGold-tint/70 p-6 sm:p-8 lg:p-10 shadow-rose-md mb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-roseGold-soft px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-roseGold-dark shadow-sm mb-4">
            <Sparkles className="h-3.5 w-3.5 text-roseGold-deep" />
            Interactive Board Exam Simulator • 420 Curated Items
          </div>
          <h2 className="font-display text-2xl sm:text-4xl text-espresso-900 leading-tight mb-3">
            Configure Your Architecture Licensure Mock Session
          </h2>
          <p className="text-sm sm:text-base text-espresso-700 leading-relaxed">
            Select your target examination division (Area A, Area B, or Both Areas) and customize
            your question count per subject. Questions and multiple-choice options are freshly
            randomized every session with full LaTeX engineering formulas and technical rationales.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Configuration Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Area Selection Segmented Control */}
          <section className="rounded-3xl border border-roseGold-border bg-white p-5 sm:p-6 shadow-rose-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-roseGold-blush text-roseGold-dark border border-roseGold-border">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-espresso-900">
                    1. Select Examination Division
                  </h3>
                  <p className="text-xs text-espresso-600">
                    Filter subject pools by official licensure examination division
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'AREA_A' as AreaSelectionMode,
                  title: 'Area A Only',
                  subtitle: 'History, Theory & Practice',
                  badge: '180 Max Items',
                  icon: BookOpen,
                },
                {
                  id: 'AREA_B' as AreaSelectionMode,
                  title: 'Area B Only',
                  subtitle: 'Structures, Tech, Utilities & Methods',
                  badge: '240 Max Items',
                  icon: Building2,
                },
                {
                  id: 'BOTH' as AreaSelectionMode,
                  title: 'Both Areas (A & B)',
                  subtitle: 'All 7 Licensure Subjects',
                  badge: '420 Max Items',
                  icon: Layers,
                },
              ].map((option) => {
                const Icon = option.icon;
                const isActive = areaMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onChangeAreaMode(option.id)}
                    className={`flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                      isActive
                        ? 'border-roseGold-deep bg-roseGold-blush/70 shadow-rose-sm'
                        : 'border-roseGold-border bg-roseGold-ivory/60 hover:bg-roseGold-blush/30 hover:border-roseGold-soft'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-2">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isActive
                            ? 'bg-roseGold-deep text-white'
                            : 'bg-white text-espresso-700 border border-roseGold-border'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isActive
                            ? 'bg-espresso-900 text-white'
                            : 'bg-white text-espresso-700 border border-roseGold-border'
                        }`}
                      >
                        {option.badge}
                      </span>
                    </div>
                    <span className="font-display text-base text-espresso-900">
                      {option.title}
                    </span>
                    <span className="text-xs font-medium text-espresso-700 mt-0.5">
                      {option.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Topic Selection & Quota Customizer */}
          <section className="rounded-3xl border border-roseGold-border bg-white p-5 sm:p-6 shadow-rose-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-roseGold-blush">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-roseGold-blush text-roseGold-dark border border-roseGold-border">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-espresso-900">
                    2. Customize Subject Quotas
                  </h3>
                  <p className="text-xs text-espresso-600">
                    Set the exact number of random questions (0–60) per active subject
                  </p>
                </div>
              </div>

              {/* Quick Select All / Reset Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSelectAllActive}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-roseGold-blush border border-roseGold-soft px-3 py-2 text-xs font-bold text-espresso-900 transition hover:bg-roseGold-tint"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-roseGold-dark" />
                  Select All Available ({maxPossibleActive})
                </button>
                <button
                  type="button"
                  onClick={onResetActive}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-roseGold-ivory border border-roseGold-border px-3 py-2 text-xs font-bold text-espresso-700 transition hover:bg-roseGold-blush"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-espresso-600" />
                  Reset (0)
                </button>
              </div>
            </div>

            {/* Area A Subjects */}
            {(areaMode === 'AREA_A' || areaMode === 'BOTH') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-roseGold-deep" />
                    <h4 className="font-display text-base text-espresso-900 tracking-wide">
                      AREA A: History, Theory &amp; Professional Practice
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-espresso-700 bg-roseGold-blush px-2.5 py-1 rounded-lg border border-roseGold-border">
                    {totalAreaAQueued} / 180 Queued
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areaATopics.map(renderTopicCard)}
                </div>
              </div>
            )}

            {/* Area B Subjects */}
            {(areaMode === 'AREA_B' || areaMode === 'BOTH') && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-roseGold-deep" />
                    <h4 className="font-display text-base text-espresso-900 tracking-wide">
                      AREA B: Structures, Technology, Utilities &amp; Methods
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-espresso-700 bg-roseGold-blush px-2.5 py-1 rounded-lg border border-roseGold-border">
                    {totalAreaBQueued} / 240 Queued
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {areaBTopics.map(renderTopicCard)}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right / Sticky Summary & Launch Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border-2 border-roseGold-soft bg-white p-6 shadow-rose-lg">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-roseGold-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-roseGold-dark">
                  Session Summary
                </span>
                <h3 className="font-display text-xl text-espresso-900">Exam Queue</h3>
              </div>
              <div className="flex h-14 min-w-[4rem] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-roseGold-blush to-roseGold-tint px-3 border border-roseGold-soft">
                <span className="font-display text-2xl text-espresso-900 leading-none">
                  {totalQueued}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-700 mt-0.5">
                  Items
                </span>
              </div>
            </div>

            {/* Active Topic Breakdown */}
            <div className="space-y-2.5 mb-6">
              {activeTopics.map((t) => {
                const count = topicQuotas[t.slug] || 0;
                return (
                  <div
                    key={t.slug}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm ${
                      count > 0
                        ? 'bg-roseGold-blush/70 font-semibold text-espresso-900 border border-roseGold-border'
                        : 'bg-roseGold-ivory/60 text-espresso-600'
                    }`}
                  >
                    <span className="truncate pr-2">{t.name}</span>
                    <span className="font-display shrink-0">
                      {count} <span className="font-sans text-xs font-normal">/ 60</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Validation warning if 0 selected */}
            {totalQueued === 0 && (
              <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-900">
                Please select at least 1 question from any subject above to begin the examination.
              </div>
            )}

            <button
              type="button"
              onClick={onStartExam}
              disabled={totalQueued === 0}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-roseGold-deep to-roseGold-dark px-6 py-4 font-display text-base sm:text-lg text-white shadow-rose-md transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
            >
              <Play className="h-5 w-5 fill-current" />
              Begin Exam ({totalQueued} {totalQueued === 1 ? 'Item' : 'Items'})
            </button>

            <ul className="mt-5 space-y-1.5 text-xs text-espresso-700 border-t border-roseGold-blush pt-4">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-roseGold-deep" />
                Randomly samples from each selected subject pool
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-roseGold-deep" />
                Shuffles choices (A, B, C, D) on every session load
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-roseGold-deep" />
                Includes full post-exam Technical Rationale review
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};

