'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LenderCTA() {
  return (
    <section className="w-full py-8 sm:py-16 md:py-24 antialiased">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Chrome-Card Glass Layer Container */}
        <div className="chrome-card group relative overflow-hidden rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12 text-left transition-all duration-500 hover:border-accent/40">

          {/* Subtle Ambient Radial Ray Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_80%_20%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent)] transition-transform duration-700 group-hover:scale-105 pointer-events-none" />

          {/* Content Block */}
          <div className="relative z-10 w-full max-w-xl space-y-5 md:space-y-6">

            {/* Minimalist Micro-Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--tag-bg)] border border-border/40 text-[10px] md:text-[11px] font-semibold tracking-widest uppercase text-[var(--tag-fg)]">
              <Sparkles size={12} className="animate-pulse" />
              <span>peer-to-peer</span>
            </div>

            {/* Display Typography Frame */}
            <div className="space-y-3 md:space-y-4">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.2] md:leading-[1.1]">
                Got gear collecting <span className="text-transparent bg-clip-text bg-[var(--liquid-gradient)]">dust?</span>
              </h2>
              <p className="font-sans text-[15px] sm:text-base md:text-lg text-[var(--text-muted)] font-normal max-w-[95%] md:max-w-md leading-relaxed">
                List your cameras, tools, or bikes. Support your campus community and build a smooth passive income stream.
              </p>
            </div>
          </div>

          {/* Action Button Block */}
          <div className="relative z-10 shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <Link
              href={{ pathname: '/listings/new' }}
              className="hyper-liquid group/btn inline-flex w-full md:w-auto items-center justify-center gap-3 px-6 md:px-8 py-3.5 md:py-4 text-[15px] md:text-base font-medium rounded-2xl md:rounded-full shadow-[var(--btn-shadow)] hover:shadow-[var(--btn-shadow-hover)] transition-all"
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