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

export function StepIndicator({ currentStep, totalSteps = 7 }: StepIndicatorProps) {
  // Mobile typically only shows numbers or current/total due to space constraints for 7 steps.
  // Desktop can show full labels.
  const steps = [
    { id: 1, label: 'Photos' },
    { id: 2, label: 'Category' },
    { id: 3, label: 'Details' },
    { id: 4, label: 'Pricing' },
    { id: 5, label: 'Area' },
    { id: 6, label: 'Dates' },
    { id: 7, label: 'Review' },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full mb-8 px-2 sm:px-4">
      {/* Mobile view: simple progress bar */}
      <div className="lg:hidden">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-white">Step {currentStep} of {totalSteps}</span>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            {steps[currentStep - 1]?.label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#2A2A35] rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
          />
        </div>
      </div>

      {/* Desktop view: full segmented tracker */}
      <div className="hidden lg:flex relative items-center mt-12 mb-4">
        {/* Background track line */}
        <div className="absolute left-0 right-0 h-[2px] bg-[#2A2A35]" />
        
        {/* Active progress line */}
        <div 
          className="absolute left-0 h-[2px] bg-accent transition-all duration-500 ease-in-out" 
          style={{ width: `${progressPercentage}%` }} 
        />

        {/* Steps */}
        <div className="relative flex justify-between w-full z-10">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="relative flex flex-col items-center justify-center group cursor-default">
                {/* Label above */}
                <span className={cn(
                  "absolute bottom-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                  isActive || isCompleted ? "text-accent" : "text-white/40"
                )}>
                  {step.label}
                </span>

                {/* Node */}
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 bg-[#0D0D16] border-[2px]",
                  isCompleted ? "border-accent bg-accent" : 
                  isActive ? "border-accent shadow-[0_0_10px_rgba(57,255,20,0.4)]" : 
                  "border-[#2A2A35]"
                )}>
                  {isActive && <div className="w-2 h-2 rounded-full bg-accent" />}
                  {isCompleted && <Check className="w-3 h-3 text-black" strokeWidth={4} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
