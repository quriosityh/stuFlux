'use client';

import { usePathname } from 'next/navigation';

export function TopSpacer() {
  const pathname = usePathname();
  const isPDP = pathname.startsWith('/listings/');
  
  // Since Desktop NavHeader is hidden on mobile globally, we don't need a top spacer on mobile.
  return <div className="hidden md:block h-16" />;
}

export function BottomSpacer() {
  const pathname = usePathname();
  const isPDP = pathname.startsWith('/listings/');
  
  // On PDP, the bottom padding is handled by the PDP client for its specific CTA.
  // Otherwise, we need pb-24 equivalent for the MobileNav.
  if (isPDP) return null;
  return <div className="h-16 md:hidden shrink-0" />;
}
