'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const HIDDEN_ROUTES = ['/messages', '/listings/', '/onboarding'];

export function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some(r => pathname?.startsWith(r));

  if (hidden) return null;

  return (
    <footer className="hidden md:block border-t border-white/10 bg-[var(--glass-bg,rgba(15,15,20,0.6))] backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-white/40">
        <span>&copy; {new Date().getFullYear()} StuFlux</span>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
          <Link href="/explore" className="hover:text-white/70 transition-colors">Explore</Link>
          <Link href="/bookings" className="hover:text-white/70 transition-colors">Bookings</Link>
        </div>
      </div>
    </footer>
  );
}
