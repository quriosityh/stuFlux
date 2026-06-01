'use client';

import { usePathname } from 'next/navigation';
import { MobileNav } from './MobileNav';
import { NavHeader } from './NavHeader';

export function Navigation() {
  const pathname = usePathname();
  const isPDP = pathname?.startsWith('/listings/');

  return (
    <>
      {!isPDP && <MobileNav />}
      
      <div className="hidden md:block">
        <NavHeader />
      </div>
    </>
  );
}
