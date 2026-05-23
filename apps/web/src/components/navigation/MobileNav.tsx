'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Send, Plus, Activity, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'DMs', href: '/messages', icon: Send },
    { name: 'Drop', href: '/post', icon: Plus, isDrop: true },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'You', href: '/profile', icon: UserRound },
  ];

  const activeIndex = navItems.findIndex(item => pathname === item.href);
  const hasActive = activeIndex !== -1;

  // Exact formula to find the center of the item given `px-10` (40px padding) and `justify-between` with 5 `w-12` (48px) items.
  // CSS mask-position percentages are calculated against (container_width - mask_width).
  // The mathematically perfect formula that aligns the 88px mask with the flex items is:
  const maskPositionX = `calc(${activeIndex * 25}% + ${20 - activeIndex * 10}px)`;

  // SVG path drawing the swoop hole using mathematically perfect tangent circular arcs
  // The bowl is perfectly concentric with the icon. Increased bowl radius to 31px for an exact 8px gap.
  const svgMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='36' viewBox='0 0 88 36'%3E%3Cpath d='M0,0 L2,0 A12,12 0 0,1 13.73,9.49 A31,31 0 0,0 74.27,9.49 A12,12 0 0,1 86,0 L88,0 Z' fill='black'/%3E%3C/svg%3E")`;

  const maskStyle = hasActive ? {
    WebkitMaskImage: `linear-gradient(black, black), ${svgMask}`,
    WebkitMaskPosition: `0 0, ${maskPositionX} -1px`,
    WebkitMaskSize: `100% 100%, 88px 36px`,
    WebkitMaskRepeat: `no-repeat, no-repeat`,
    WebkitMaskComposite: `destination-out`,
    maskComposite: `exclude`,
  } : {};

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      
      {/* Background Layer with true transparency mask */}
      <div 
        className="absolute inset-0 bg-[var(--nav-bg)] border-t border-border/10 rounded-t-3xl transition-all duration-300 pointer-events-none"
        style={maskStyle}
      />

      {/* Foreground Layer (Icons) */}
      <div className="relative z-10 px-10 pt-3 pb-4 flex items-end justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center relative transition-all duration-200 w-12",
                isActive
                  ? "text-[var(--foreground)]"
                  : "text-foreground/50 hover:text-foreground/80"
              )}
            >
              {/* Icon area - fixed height so labels always align */}
              <div className="h-6 flex items-center justify-center relative">
                {isActive ? (
                  /* Active: floating icon (nav background is masked out behind it) */
                  <div className="absolute top-[-32px] w-[46px] h-[46px] rounded-full bg-[var(--nav-bg)] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-border/5">
                    <Icon size={22} strokeWidth={2.5} className="text-[var(--accent)]" />
                  </div>
                ) : item.isDrop ? (
                  /* Inactive Drop: circle border */
                  <div className="w-6 h-6 rounded-full border border-foreground/30 flex items-center justify-center">
                    <Icon size={14} strokeWidth={2} />
                  </div>
                ) : (
                  /* Inactive: plain icon */
                  <Icon size={22} strokeWidth={2} />
                )}
              </div>

              {/* Spacer */}
              <div className="h-1.5" />

              {/* Label - always at same position */}
              <span className={cn(
                "text-[10px] tracking-wide transition-all",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
