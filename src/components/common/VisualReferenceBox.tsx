import React from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { MathText } from './MathText';

interface VisualReferenceBoxProps {
  visualReference: string | null;
  imageSrc?: string;
}

export const VisualReferenceBox: React.FC<VisualReferenceBoxProps> = ({
  visualReference,
  imageSrc,
}) => {
  if (!visualReference && !imageSrc) return null;

  return (
    <div className="mb-5 rounded-2xl border-2 border-dashed border-roseGold-soft bg-gradient-to-br from-roseGold-blush/90 via-roseGold-ivory to-roseGold-tint/60 p-4 sm:p-5 shadow-rose-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-roseGold-tint border border-roseGold-soft/60 text-roseGold-dark shadow-sm">
          <ImageIcon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-roseGold-deep px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" />
              Architectural Visual Reference
            </span>
            {!imageSrc && (
              <span className="text-xs font-semibold text-espresso-600">
                Diagram / Blueprint Description Provided
              </span>
            )}
          </div>

          {imageSrc && (
            <div className="my-3 overflow-hidden rounded-xl border border-roseGold-border bg-white p-2">
              <img
                src={imageSrc}
                alt={visualReference || 'Architectural visual reference'}
                className="mx-auto max-h-72 w-auto object-contain rounded-lg"
              />
            </div>
          )}

          {visualReference && (
            <div className="text-sm sm:text-[15px] font-medium leading-relaxed text-espresso-900 bg-white/80 rounded-xl px-3.5 py-2.5 border border-roseGold-border/80">
              <MathText text={visualReference} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

