import React from 'react';

type WizardFooterProps = {
  step: number;
  totalSteps: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
};

export function WizardFooter({
  step,
  totalSteps,
  canProceed,
  onBack,
  onNext,
  onSkip,
  isSubmitting = false,
}: WizardFooterProps) {
  const showSkip = step === 6 && !!onSkip;
  const isLast = step === totalSteps;

  return (
    <nav className="fixed bottom-0 inset-x-0 w-full bg-background/95 backdrop-blur-md border-t border-border/20 p-3 flex items-center justify-between z-50 rounded-t-2xl lg:sticky lg:bottom-0 lg:left-auto lg:right-auto lg:py-5 lg:pl-12 lg:pr-0">
      {step > 1 ? (
        <button
          onClick={onBack}
          className="px-6 py-3 font-semibold text-base text-foreground/60 hover:text-foreground"
        >
          {"< Back"}
        </button>
      ) : (
        <div />
      )}

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
          className="hyper-liquid px-8 py-3 font-bold text-base text-black disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLast ? (isSubmitting ? 'Publishing...' : '✨ Publish') : 'Next >'}
        </button>
      </div>
    </nav>
  );
}
