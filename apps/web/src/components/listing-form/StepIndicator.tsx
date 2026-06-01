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
    { id: 2, label: 'Logistics' },
    { id: 3, label: 'Photos' },
    { id: 4, label: 'Review & Publish' },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full mb-12 mt-8 px-2 sm:px-8">
      <div className="relative flex items-center">
        {/* Background track line */}
        <div className="absolute left-0 right-0 h-[2px] rounded-full bg-[#2A2A35]" />
        
        {/* Active progress line */}
        <div 
          className="absolute left-0 h-[2px] rounded-full bg-accent transition-all duration-700 ease-out shadow-[0_0_18px_rgba(57,255,20,0.45)]" 
          style={{ width: `${progressPercentage}%` }} 
        />

        {/* Steps */}
        <div className="relative flex justify-between w-full z-10">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="relative flex flex-col items-center justify-center">
                {/* Label above */}
                <span className={cn(
                  "absolute bottom-5 sm:bottom-6 whitespace-nowrap text-[9px] sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-300",
                  isCompleted ? "text-emerald-400" : isActive ? "text-accent" : "text-white/40"
                )}>
                  {step.label}
                </span>

                {/* Node */}
                <div className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all duration-300 bg-[#0B0B13] border-[2px] transform-gpu",
                  isCompleted ? "border-accent bg-accent" : 
                  isActive ? "border-accent shadow-[0_0_10px_rgba(57,255,20,0.4)] scale-110" : 
                  "border-[#2A2A35]"
                )}>
                  {isActive && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse" />}
                  {isCompleted && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black step-check-anim" strokeWidth={4} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
