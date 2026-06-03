import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BookingSectionProps {
  title: string;
  count?: number;
  hasNotification?: boolean;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  /** Visual indicator to the left of the heading */
  indicator?: 'green-dot' | 'blue-dot' | 'amber-dot' | 'gray-dot' | 'clock' | 'check';
}

export default function BookingSection({
  title,
  count = 0,
  hasNotification = false,
  children,
  className,
  isEmpty = false,
  emptyMessage = "No items in this category.",
  indicator,
}: BookingSectionProps) {
  return (
    <section className={cn("space-y-3.5", className)}>
      <div className="flex items-center gap-2 mb-1.5">
        {/* Colored indicator */}
        {indicator && <SectionIndicator type={indicator} />}

        <h3 className="text-[15px] font-bold tracking-tight text-foreground/85 font-display">
          {title}
        </h3>
        
        {count > 0 && (
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/50 flex items-center gap-1.5 border border-border/10">
            {hasNotification && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            {count}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-[12px] border border-dashed border-border/40 bg-surface/10 text-center transition-all duration-300">
            <span className="text-[12px] font-medium text-foreground/40">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function SectionIndicator({ type }: { type: string }) {
  switch (type) {
    case 'green-dot':
      return <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />;
    case 'blue-dot':
      return <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />;
    case 'amber-dot':
      return <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />;
    case 'gray-dot':
      return <span className="w-2 h-2 rounded-full bg-foreground/20" />;
    case 'clock':
      return (
        <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-4 h-4 text-foreground/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}
