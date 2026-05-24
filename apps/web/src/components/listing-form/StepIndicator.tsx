import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type StepIndicatorProps = {
  currentStep: number;
  totalSteps?: number;
};

export function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
  const steps = [
    { id: 1, label: 'Basics' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Availability' },
    { id: 4, label: 'Photos' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-10 mt-6 relative">
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 flex-1 relative">
              {/* Connector Line */}
              {idx !== 0 && (
                <div
                  className={cn(
                    "absolute top-[1.125rem] right-[50%] left-[-50%] h-[3px] -z-10 transition-colors duration-500",
                    isCompleted || isActive ? "bg-accent" : "bg-border/30"
                  )}
                />
              )}
              
              {/* Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-300",
                  isCompleted && "liquid-button !w-10 !h-10 !p-0 !text-black", // checkmark completed state
                  isActive && "bg-surface border-2 border-accent text-accent shadow-[0_0_15px_rgba(57,255,20,0.3)]",
                  isPending && "glass-spotlight border border-border/40 text-foreground/50"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5 text-black" strokeWidth={3} /> : step.id}
              </div>
              
              {/* Label */}
              <span
                className={cn(
                  "text-xs font-semibold tracking-wide uppercase transition-colors duration-300",
                  isActive ? "text-foreground" : "text-foreground/40"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
