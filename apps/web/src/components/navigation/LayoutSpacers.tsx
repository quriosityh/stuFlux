'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function TopSpacer() {
  const pathname = usePathname();

  useEffect(() => {
    const measure = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const isPDP = pathname?.startsWith('/listings/');
        document.documentElement.style.setProperty('--nav-expanded-h', isPDP ? '0px' : '56px');
        return;
      }
      const nav = document.querySelector('[data-nav-spacer="true"]');
      if (nav) {
        const h = nav.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--nav-expanded-h', `${h}px`);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    const nav = document.querySelector('[data-nav-spacer="true"]');
    if (!nav) {
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [pathname]);

  // Spacer keeps content below fixed desktop nav; hidden on mobile where search header is sticky
  return <div className="hidden md:block w-full shrink-0" style={{ height: 'var(--nav-expanded-h, 96px)' }} />;
}

export function BottomSpacer() {
  const pathname = usePathname();
  if (pathname.startsWith('/listings/')) return null;
  return <div className="h-16 md:hidden shrink-0" />;
}
