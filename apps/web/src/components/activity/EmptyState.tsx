import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="chrome-card rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-6xl mb-6 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
        {icon}
      </div>
      <h3 className="font-display text-2xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/60 max-w-sm mb-8 text-lg">
        {description}
      </p>
      <Link 
        href={actionHref}
        className="liquid-button"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
