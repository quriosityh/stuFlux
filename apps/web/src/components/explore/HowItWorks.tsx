'use client';

import { Search, CalendarDays, Handshake } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
};

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Find It',
      desc: 'Browse cameras, tools, or outdoor gear available right in your area.',
      // Pushes first card up slightly
      offsetClass: 'md:-translate-y-4', 
    },
    {
      icon: CalendarDays,
      title: 'Book It',
      desc: 'Pick your exact rental dates and send an instant reservation request.',
      // Keeps center card grounded but makes it taller for emphasis
      offsetClass: 'md:translate-y-4 md:py-14', 
    },
    {
      icon: Handshake,
      title: 'Get It',
      desc: 'Meet up with the owner nearby, grab the gear, and get to work.',
      // Pushes third card up to create a modern staggered zig-zag
      offsetClass: 'md:-translate-y-2', 
    },
  ];

  return (
    <section className="w-full py-24 border-y border-border/40 bg-gradient-to-b from-transparent via-[var(--surface)]/10 to-transparent antialiased overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center">
        
        {/* Sleek Minimal Display Header */}
        <div className="space-y-3 mb-24">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-[var(--tag-bg)] text-[10px] font-bold tracking-widest uppercase text-[var(--tag-fg)]">
            Simple Process
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Three Steps. Zero Hassle.
          </h2>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-center"
        >
          {/* Fluid Curved Connecting Aura instead of a boring straight line */}
          <div className="hidden md:block absolute w-[110%] h-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent)_4%,transparent),transparent_60%)] -z-10 pointer-events-none" />

          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants} 
              className={`chrome-card group flex flex-col items-center p-8 md:p-10 rounded-[2.5rem] text-center border-none shadow-none bg-[var(--surface)]/30 hover:bg-[var(--surface)] hover:shadow-2xl hover:shadow-[var(--accent)]/5 transition-all duration-500 ease-out ${step.offsetClass}`}
            >
              {/* Floating Step Number */}
              <div className="font-display text-xs font-black tracking-widest text-[var(--text-subtle)]/30 mb-5 uppercase">
                Step 0{i + 1}
              </div>

              {/* Icon Capsule Frame */}
              <div className="w-14 h-14 rounded-btn bg-[var(--tag-bg)] text-[var(--tag-fg)] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <step.icon size={22} strokeWidth={2} />
              </div>
              
              {/* Content Frame */}
              <div className="space-y-2">
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-[var(--accent)]">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-[var(--text-muted)] font-normal max-w-[220px] mx-auto leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
