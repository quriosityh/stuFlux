'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageCircle, Plus, Activity, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/', icon: Compass },
    { name: 'DMs', href: '/messages', icon: MessageCircle },
    { name: 'Drop', href: '/post', icon: Plus, isDrop: true },
    { name: 'Activity', href: '/activity', icon: Activity },
    { name: 'You', href: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="chrome-card rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isDrop) {
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="liquid-button -mt-8 !p-4 !rounded-full flex-shrink-0"
                aria-label={item.name}
              >
                <Icon size={28} className="text-black" />
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 relative text-[var(--foreground)] opacity-70 transition-all hover:opacity-100",
                isActive && "opacity-100"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "text-[var(--accent)]")} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
