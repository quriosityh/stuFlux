import { cn } from '@/lib/utils';

type StepIndicatorProps = {
currentStep: number;
totalSteps?: number;
};

const STEP_LABELS: Record<number, string> = {
1: 'Photos',
2: 'Category & Title',
3: 'Description',
4: 'Pricing',
5: 'Area',
6: 'Availability',
7: 'Review',
};

export function StepIndicator({ currentStep, totalSteps = 7 }: StepIndicatorProps) {
const nextStep = currentStep < totalSteps ? STEP_LABELS[currentStep + 1] : null;
const progress = currentStep / totalSteps;

  // SVG ring params
  const size = 96;
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Sliding window selection for mobile (3 steps shown)
  let startStep = currentStep - 1;
  if (currentStep === 1) {
    startStep = 1;
  } else if (currentStep === totalSteps) {
    startStep = totalSteps - 2;
  }
  const stepsToShow = [startStep, startStep + 1, startStep + 2];

  return (
    <div className="w-full">
      {/* ── Mobile: exact image match dot-line indicator ─────────────────────────── */}
      <div className="lg:hidden w-full select-none pt-4 pb-2">
        <div className="relative w-full px-2">
          
          {/* Background lines */}
          <div className="absolute left-0 w-full h-[4px] z-0 top-[40px]">
            {/* Left extension */}
            {startStep > 1 && (
              <div className="absolute left-0 w-[12.5%] h-full bg-gradient-to-r from-transparent to-foreground/20" />
            )}
            {/* Left to Center */}
            <div className="absolute left-[12.5%] w-[37.5%] h-full bg-foreground/20" />
            
            {/* Center to Right */}
            <div className="absolute left-[50%] w-[37.5%] h-full bg-foreground/20" />
            
            {/* Right extension */}
            {startStep + 2 < totalSteps && (
              <div className="absolute left-[87.5%] w-[12.5%] h-full bg-gradient-to-r from-foreground/20 to-transparent" />
            )}
          </div>

          {/* Flex container for the 3 steps */}
          <div className="relative z-10 flex w-full justify-between">
            {stepsToShow.map((stepNum, idx) => {
               const isCurrent = stepNum === currentStep;
               const isCompleted = stepNum < currentStep;
               
               // Center column gets 50% width, side columns get 25% width
               // This pushes the side circles closer to the screen edges (at 12.5% and 87.5%)
               const colWidth = idx === 1 ? "w-[50%]" : "w-[25%]";
               
               return (
                 <div key={stepNum} className={cn("flex flex-col items-center gap-3", colWidth)}>
                   {/* Label */}
                   <span className={cn(
                     "text-[10.5px] font-display font-bold uppercase tracking-[0.15em] h-4 flex items-end truncate px-1",
                     isCurrent ? "text-accent drop-shadow-[0_0_4px_var(--accent)]" : isCompleted ? "text-foreground/60" : "text-foreground/40"
                   )}>
                     {STEP_LABELS[stepNum]}
                   </span>

                   {/* Node Container (fixed height to align centers) */}
                   <div className="h-8 flex items-center justify-center w-full relative">
                     {isCurrent ? (
                       <div className="relative flex items-center justify-center w-[22px] h-[22px]">
                         <div className="absolute inset-0 rounded-full border-[3px] border-accent shadow-[0_0_8px_var(--accent)] bg-background" />
                         <div className="w-[8px] h-[8px] rounded-full bg-accent relative z-10" />
                       </div>
                     ) : isCompleted ? (
                       <div className="w-[18px] h-[18px] rounded-full bg-accent shadow-[0_0_4px_var(--accent)] flex items-center justify-center relative z-10">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-background w-3.5 h-3.5">
                           <polyline points="20 6 9 17 4 12" />
                         </svg>
                       </div>
                     ) : (
                       <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-foreground/20 bg-background relative z-10" />
                     )}
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

    {/* ── Desktop: circular progress ring ───────────────────── */}
    <div className="hidden lg:flex flex-col items-center gap-3 py-2">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          overflow="visible"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={strokeWidth}
            opacity={0.1}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: 'drop-shadow(0 0 8px var(--accent))',
            }}
          />
        </svg>

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold text-foreground leading-none">
            {currentStep}
          </span>
          <span className="text-[10px] text-foreground/60 font-medium leading-none mt-0.5">
            of {totalSteps}
          </span>
        </div>
      </div>

      {/* Current step name */}
      <div className="text-center">
        <p className="font-display text-sm font-bold text-accent uppercase tracking-widest leading-tight">
          {STEP_LABELS[currentStep]}
        </p>
        {nextStep && (
          <p className="text-[11px] text-foreground/55 mt-1 font-medium">
            Next → {nextStep}
          </p>
        )}
        {!nextStep && (
          <p className="text-[11px] text-accent/60 mt-1 font-medium">
            Last step 🎉
          </p>
        )}
      </div>
    </div>
  </div>
);
}

