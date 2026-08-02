'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TopSpacer() {
  const pathname = usePathname();

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('[data-nav-spacer="true"]');
      if (nav) {
        const h = nav.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--nav-expanded-h', `${h}px`);
      }
    };

    measure();
    const nav = document.querySelector('[data-nav-spacer="true"]');
    if (!nav) return;
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  // Spacer keeps content below fixed nav; height matches expanded nav height
  return <div className="block w-full shrink-0" style={{ height: 'var(--nav-expanded-h, 96px)' }} />;
}

export function BottomSpacer() {
  const pathname = usePathname();
  if (pathname.startsWith('/listings/')) return null;
  return <div className="h-16 md:hidden shrink-0" />;
}
