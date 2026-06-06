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

  return (
    <div className="w-full">
      {/* ── Mobile: slim labelled bar ─────────────────────────── */}
      <div className="lg:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-foreground/50 uppercase tracking-widest font-display">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-accent font-bold font-display uppercase tracking-wider">
            {STEP_LABELS[currentStep]}
          </span>
        </div>
        {/* Segmented bar */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                i < currentStep ? 'bg-accent' : 'bg-border/30'
              )}
            />
          ))}
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

