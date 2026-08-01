'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PDPMobileNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Transition when scrolled past the top safe area
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-colors duration-300 md:hidden",
        scrolled ? "bg-background border-b border-border/10 shadow-sm" : "bg-transparent"
      )}
    >
      <button 
        onClick={() => router.back()}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors text-foreground",
          scrolled ? "hover:bg-accent/10" : "bg-white/90 backdrop-blur-md shadow-sm dark:bg-black/60"
        )}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="flex items-center gap-3 text-foreground">
        <button 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            scrolled ? "hover:bg-accent/10" : "bg-white/90 backdrop-blur-md shadow-sm dark:bg-black/60"
          )}
        >
          <Share className="w-5 h-5" />
        </button>
        <button 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            scrolled ? "hover:bg-accent/10" : "bg-white/90 backdrop-blur-md shadow-sm dark:bg-black/60"
          )}
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
