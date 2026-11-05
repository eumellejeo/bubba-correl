import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';

interface HeaderProps {
  mode: 'LOBBY' | 'EXAM' | 'RESULTS';
  totalQuestions?: number;
  answeredCount?: number;
  onResetToLobby?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  totalQuestions = 0,
  answeredCount = 0,
  onResetToLobby,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-roseGold-border bg-white/95 backdrop-blur-md shadow-rose-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-roseGold-soft to-roseGold-deep text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg sm:text-xl tracking-wide text-espresso-900">
                ArchLicensure
              </h1>
              <span className="hidden sm:inline-block rounded-full bg-roseGold-blush border border-roseGold-border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-roseGold-dark">
                ALE Mock Reviewer
              </span>
            </div>
            <p className="text-xs font-medium text-espresso-600">
              Architecture Licensure Examination • Area A &amp; Area B
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === 'EXAM' && totalQuestions > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-roseGold-blush px-3 py-1.5 border border-roseGold-border">
              <span className="text-xs font-semibold text-espresso-700">Answered:</span>
              <span className="font-display text-sm text-espresso-900">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
          )}

          {mode !== 'LOBBY' && onResetToLobby && (
            <button
              type="button"
              onClick={onResetToLobby}
              className="inline-flex items-center gap-1.5 rounded-xl border border-roseGold-border bg-roseGold-ivory px-3 py-1.5 text-xs sm:text-sm font-semibold text-espresso-800 transition hover:bg-roseGold-tint hover:border-roseGold-soft"
              title="Return to Exam Configuration Lobby"
            >
              <RotateCcw className="h-3.5 w-3.5 text-roseGold-deep" />
              <span className="hidden xs:inline">Exit to Lobby</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

