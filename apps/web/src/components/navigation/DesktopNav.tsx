'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageCircle, Activity, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DesktopNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/' as const, icon: Compass },
    { name: 'DMs', href: '/messages' as const, icon: MessageCircle, badge: 2 },
    { name: 'Activity', href: '/bookings' as const, icon: Activity },
  ];

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50">
      {/* Clean Frosted Container */}
      <div className="w-full bg-[var(--surface)] backdrop-blur-2xl border-b border-[var(--border-color)] shadow-sm">
        <div className="w-[90%] max-w-none mx-auto py-2.5 flex items-center justify-between">
          {/* Left: Brand Only */}
          <Link href="/" className="font-['Clash_Display',_sans-serif] font-bold text-3xl tracking-tighter flex items-center hover:opacity-80 transition-opacity">
            <span className="text-zinc-800 dark:text-gray-300 drop-shadow-sm">Stu</span>
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent drop-shadow-sm">Flux</span>
          </Link>

          {/* Right: Menus, Profile, CTA */}
          <div className="flex items-center gap-8">

            {/* Icons Menu with Expand-on-Hover */}
            <div className="flex items-center gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={cn(
                      "group flex items-center rounded-full transition-all duration-300 cursor-pointer active:scale-90 active:[text-shadow:-2px_0_rgba(255,0,0,0.7),2px_0_rgba(0,255,255,0.7)]",
                      isActive ? "text-[var(--accent)]" : "text-[var(--foreground)] opacity-70 hover:opacity-100",
                      "hover:bg-[var(--surface)] hover:text-[var(--accent-hover)] px-3 py-2.5"
                    )}
                  >
                    <div className="relative flex items-center justify-center">
                      <item.icon size={22} className={cn("transition-colors", isActive && "text-[var(--accent)]")} />
                      {item.badge && (
                        <span className="absolute -top-1.5 -right-2 bg-[var(--accent)] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {/* Smoother transition for text expansion */}
                    <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-3 text-sm font-bold tracking-wide">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* You (Profile) Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 w-11 h-11 rounded-full border border-[var(--border-color)] overflow-hidden hover:ring-2 hover:ring-[var(--accent)] transition-all cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-[var(--background)] to-[var(--surface)] flex items-center justify-center">
                  <User size={22} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Opaque Dropdown Menu with Smooth Texture */}
              <div className="absolute right-0 top-full mt-4 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-[var(--background)] opacity-95 p-2 flex flex-col gap-1 border border-[var(--border-color)] rounded-2xl shadow-2xl backdrop-blur-3xl">
                  <Link href={{ pathname: '/profile' }} className="px-4 py-3 rounded-xl hover:bg-[var(--surface)] transition-colors text-sm font-bold">You (Profile)</Link>
                  <Link href={{ pathname: '/settings' }} className="px-4 py-3 rounded-xl hover:bg-[var(--surface)] transition-colors text-sm font-bold">Settings</Link>
                  <div className="h-px bg-[var(--border-color)] my-1 opacity-50" />
                  <button className="text-left px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-sm font-bold">Sign Out</button>
                </div>
              </div>
            </div>

            {/* Action CTA mostly right */}
            <Link href={{ pathname: '/listings/new' }} className="hyper-liquid inline-flex items-center justify-center gap-2 text-sm !py-2 !px-4 whitespace-nowrap ml-2">
              <Plus size={16} strokeWidth={2.5} />
              <span>Drop</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
