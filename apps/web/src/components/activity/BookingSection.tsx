import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BookingSectionProps {
  title: string;
  count?: number;
  hasNotification?: boolean;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
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
  indicator,
}: BookingSectionProps) {
  if (isEmpty) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-3">
        {/* Colored indicator */}
        {indicator && <SectionIndicator type={indicator} />}

        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-foreground/40">
          {title}
        </span>
        
        {count > 0 && (
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-foreground/5 text-foreground/40 flex items-center gap-1.5">
            {hasNotification && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            {count}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {children}
      </div>
    </section>
  );
}

function SectionIndicator({ type }: { type: string }) {
  switch (type) {
    case 'green-dot':
      return <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />;
    case 'blue-dot':
      return <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.4)]" />;
    case 'amber-dot':
      return <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />;
    case 'gray-dot':
      return <span className="w-2 h-2 rounded-full bg-foreground/20" />;
    case 'clock':
      return (
        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-3.5 h-3.5 text-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}
