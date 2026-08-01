import React from 'react';
import { Lightbulb } from 'lucide-react';

type WizardFooterProps = {
  step: number;
  totalSteps: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
  onShowTips?: () => void;
};

export function WizardFooter({
  step,
  totalSteps,
  canProceed,
  onBack,
  onNext,
  onSkip,
  isSubmitting = false,
  onShowTips,
}: WizardFooterProps) {
  const showSkip = step === 6 && !!onSkip;
  const isLast = step === totalSteps;

  return (
    <nav className="fixed bottom-0 inset-x-0 w-full bg-background/95 backdrop-blur-md border-t border-border/20 p-3 flex items-center justify-between z-50 rounded-t-2xl lg:sticky lg:bottom-0 lg:left-auto lg:right-auto lg:py-5 lg:pl-12 lg:pr-0">
      {/* Left: Back + tips hint on mobile */}
      <div className="flex items-center gap-2">
        {step > 1 ? (
          <button
            onClick={onBack}
            className="px-4 py-2 font-semibold text-sm text-foreground/60 hover:text-foreground"
          >
            {'< Back'}
          </button>
        ) : (
          <div />
        )}
        {/* 💡 Tips button — mobile only */}
        {onShowTips && (
          <button
            onClick={onShowTips}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-foreground/40 hover:text-accent hover:bg-accent/10 transition-colors text-xs font-medium"
            title="View tips"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Tips</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        {showSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-accent hover:text-accent/80"
          >
            Skip
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="hyper-liquid px-5 py-2 font-bold text-sm text-black disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLast ? (isSubmitting ? 'Publishing...' : '✨ Publish') : 'Next >'}
        </button>
      </div>
    </nav>
  );
}
