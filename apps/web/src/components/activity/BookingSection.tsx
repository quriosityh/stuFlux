import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BookingSectionProps {
  title: string;
  icon: string;
  count?: number;
  hasNotification?: boolean;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
}

export default function BookingSection({
  title,
  icon,
  count = 0,
  hasNotification = false,
  children,
  className,
  isEmpty = false,
}: BookingSectionProps) {
  if (isEmpty) return null;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
        <h3 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="text-xl opacity-80">{icon}</span>
          {title}
        </h3>
        
        {count > 0 && (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white flex items-center gap-1.5 ml-2">
            {hasNotification && <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent)]" />}
            {count}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-5">
        {children}
      </div>
    </section>
  );
}
