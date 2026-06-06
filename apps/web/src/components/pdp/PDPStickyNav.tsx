'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PDPStickyNavProps {
  dailyRate: number;
  showBookingCTA: boolean;
  onBookClick: () => void;
  canBook: boolean;
}

export function PDPStickyNav({ dailyRate, showBookingCTA, onBookClick, canBook }: PDPStickyNavProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [ctaPos, setCtaPos] = useState<{ left: number; width: number } | null>(null);
  const rafId = useRef(0);

  const updatePosition = useCallback(() => {
    const anchor = document.getElementById('booking-card-anchor');
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setCtaPos(prev => {
        if (!prev || Math.abs(prev.left - rect.left) > 2 || Math.abs(prev.width - rect.width) > 2) {
          return { left: rect.left, width: rect.width };
        }
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Show PDP nav when user scrolls past the gallery
      const gallery = document.getElementById('photos-section');
      if (gallery) {
        const rect = gallery.getBoundingClientRect();
        const shouldShow = rect.bottom < 0;
        setIsVisible(shouldShow);

        // Toggle body attribute to hide main nav
        if (shouldShow) {
          document.body.setAttribute('data-pdp-nav', 'true');
        } else {
          document.body.removeAttribute('data-pdp-nav');
        }
      }

      // Track active section
      const sections = ['photos-section', 'details-section', 'availability-section', 'reviews-section'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(id);
            break;
          }
        }
      }

      // Track CTA position
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updatePosition);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updatePosition);
      cancelAnimationFrame(rafId.current);
      document.body.removeAttribute('data-pdp-nav');
    };
  }, [updatePosition]);

  const scrollToSection = (id: string) => {
    if (id === 'photos-section') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  const navSections = [
    { id: 'photos-section', label: 'Photos' },
    { id: 'details-section', label: 'Details' },
    { id: 'availability-section', label: 'Availability' },
    { id: 'reviews-section', label: 'Reviews' },
    { id: 'lender-section', label: 'Lender' },
  ];

  return (
    <div
      className="hidden md:block fixed top-0 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-border/10 shadow-sm animate-in slide-in-from-top-2 duration-200"
      style={{ zIndex: 60 }}
    >
      <div className="w-[85%] mx-auto h-16 flex items-center justify-between">
        {/* Section Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navSections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={cn(
                'text-sm font-semibold transition-colors border-b-2 h-16 px-1 flex items-center',
                activeSection === id
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />
      </div>

      {/* Desktop Booking CTA — fixed at the BookingCard's X position */}
      {showBookingCTA && ctaPos && (
        <div
          className="hidden md:flex items-center gap-4 fixed top-0 h-16 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ left: ctaPos.left, width: ctaPos.width, zIndex: 61 }}
        >
          <div className="flex items-center gap-4 w-full h-full justify-end bg-white dark:bg-zinc-900 pr-2">
            <div className="text-right">
              <div className="font-bold font-syne leading-none mb-1">
                Rs. {dailyRate.toLocaleString()} / day
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-foreground/60 font-semibold tracking-wider uppercase">
                <span className="text-accent text-xs leading-none">★</span> New
              </div>
            </div>
            <button
              onClick={onBookClick}
              className="hyper-liquid px-6 py-2.5 text-sm shrink-0"
            >
              {canBook ? 'Request to Rent' : 'Check availability'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile CTA */}
      {showBookingCTA && (
        <div
          className="flex md:hidden items-center justify-end gap-3 fixed top-0 right-4 h-16"
          style={{ zIndex: 61 }}
        >
          <button
            onClick={onBookClick}
            className="hyper-liquid px-6 py-2 text-sm"
          >
            {canBook ? 'Request' : 'Check dates'}
          </button>
        </div>
      )}
    </div>
  );
}
