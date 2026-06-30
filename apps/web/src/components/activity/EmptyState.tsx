import Link from 'next/link';
import { cn } from '@/lib/utils';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
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
      <div className="mb-6 flex justify-center text-foreground/40">
        {icon}
      </div>
      <h3 className="text-[20px] font-medium mb-3">{title}</h3>
      <p className="text-foreground/60 max-w-sm mb-8 text-lg">
        {description}
      </p>
      <Link
        href={{ pathname: actionHref }}
        className="liquid-button"
      >
        {actionLabel}
      </Link>
    </div>
  );
}