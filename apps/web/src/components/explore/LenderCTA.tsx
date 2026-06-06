'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LenderCTA() {
  return (
    <section className="w-full py-8 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left bg-gradient-to-br from-background to-surface border border-[var(--accent)]/20 shadow-2xl shadow-[var(--accent)]/5">
          
          {/* Background FX */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[var(--accent)]/20 via-transparent to-transparent opacity-50" />
          
          <div className="relative z-10 max-w-xl">
            <h2 className="font-syne text-3xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Got gear collecting dust?
            </h2>
            <p className="text-lg md:text-xl text-foreground/70 font-manrope">
              List your cameras, tools, or bikes. Help your campus and earn money doing it.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link 
              href="/listings/new" 
              className="hyper-liquid inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold w-full md:w-auto shadow-[0_0_40px_-10px_var(--accent)]"
            >
              <Sparkles size={20} className="text-black" />
              <span>Start Listing</span>
              <ArrowRight size={20} className="text-black/70 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
