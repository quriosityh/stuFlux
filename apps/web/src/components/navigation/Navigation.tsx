'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { MobileNav } from './MobileNav';
import { NavHeader } from './NavHeader';
import { MobileSearchBar } from '../explore/MobileSearchBar';

export function Navigation() {
  const pathname = usePathname();
  const isPDP = pathname?.startsWith('/listings/');

  return (
    <>
      {!isPDP && (
        <>
          <Suspense fallback={null}>
            <MobileSearchBar />
          </Suspense>
          <MobileNav />
        </>
      )}

      <div className="hidden md:block">
        <Suspense fallback={<div className="h-[60px]" />}>
          <NavHeader />
        </Suspense>
      </div>
    </>
  );
}

