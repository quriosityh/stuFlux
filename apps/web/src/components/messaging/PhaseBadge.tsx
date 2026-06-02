import { cn } from '@/lib/utils';
import { ConversationPhase } from './types';

export function PhaseBadge({ phase, className }: { phase: ConversationPhase | string; className?: string }) {
  const getPhaseBadgeClasses = (phase: string) => {
    switch (phase) {
      case 'inquiry':
        return 'border border-[var(--foreground)] border-opacity-30 text-[var(--foreground)] opacity-50 bg-transparent';
      case 'pending':
        return 'bg-amber-500 text-black border-transparent';
      case 'confirmed':
        return 'bg-[var(--accent)] text-black border-transparent';
      case 'ongoing':
        return 'bg-[var(--accent)] text-black animate-[pulse_3s_ease-in-out_infinite] border-transparent shadow-[0_0_8px_var(--accent)]';
      case 'completed':
        return 'border border-[var(--foreground)] border-opacity-20 text-[var(--foreground)] opacity-40 bg-transparent';
      default:
        return '';
    }
  };

  return (
    <span
      className={cn(
        "text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0",
        getPhaseBadgeClasses(phase),
        className
      )}
    >
      {phase}
    </span>
  );
}
