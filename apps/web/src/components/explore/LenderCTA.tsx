'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LenderCTA() {
  return (
    <section className="w-full py-16 md:py-24 antialiased">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Chrome-Card Glass Layer Container */}
        <div className="chrome-card group relative overflow-hidden rounded-[2rem] p-8 md:p-14 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left transition-all duration-500 hover:border-accent/40">
          
          {/* Subtle Ambient Radial Ray Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_80%_20%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent)] transition-transform duration-700 group-hover:scale-105 pointer-events-none" />
          
          {/* Content Block */}
          <div className="relative z-10 max-w-xl space-y-4">
            
            {/* Minimalist Micro-Badge using theme tokens */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-[var(--tag-bg)] border border-border/40 text-[11px] font-semibold tracking-widest uppercase text-[var(--tag-fg)]">
              <Sparkles size={11} className="animate-pulse" />
              <span> peer-to-peer</span>
            </div>
          
            {/* Display Typography Frame */}
            <div className="space-y-3">
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Got gear collecting <span className="text-transparent bg-clip-text bg-[var(--liquid-gradient)]">dust?</span>
              </h2>
              <p className="font-sans text-base md:text-lg text-[var(--text-muted)] font-normal max-w-md leading-relaxed">
                List your cameras, tools, or bikes. Support your campus community and build a smooth passive income stream.
              </p>
            </div>
          </div>

          {/* Action Button Block using .hyper-liquid */}
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link 
              href={{ pathname: '/listings/new' }} 
              className="hyper-liquid group/btn inline-flex w-full md:w-auto items-center justify-center gap-3 px-8 py-4.5 text-base shadow-[var(--btn-shadow)] hover:shadow-[var(--btn-shadow-hover)]"
            >
              <span>Start Listing Gear</span>
              <ArrowRight size={18} className="text-black/80 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
