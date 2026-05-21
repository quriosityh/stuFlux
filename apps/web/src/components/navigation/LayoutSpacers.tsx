'use client';

import { usePathname } from 'next/navigation';

export function TopSpacer() {
  const pathname = usePathname();
  const isPDP = pathname.startsWith('/listings/');
  
  // On PDP, no top spacer on mobile (to allow full-bleed images).
  // On desktop, we still need the h-16 spacer for the fixed NavHeader.
  return <div className={`h-16 ${isPDP ? 'hidden md:block' : ''}`} />;
}

export function BottomSpacer() {
  const pathname = usePathname();
  const isPDP = pathname.startsWith('/listings/');
  
  // On PDP, the bottom padding is handled by the PDP client for its specific CTA.
  // Otherwise, we need pb-24 equivalent for the MobileNav.
  if (isPDP) return null;
  return <div className="h-24 md:hidden shrink-0" />;
}
