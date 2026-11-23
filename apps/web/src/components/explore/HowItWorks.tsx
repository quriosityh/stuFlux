'use client';

import { Search, CalendarDays, Handshake } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
    },
  },
};

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Find It',
      desc: 'Browse cameras, tools, or outdoor gear available right in your area.',
      offsetClass: 'md:-translate-y-4',
    },
    {
      num: '02',
      icon: CalendarDays,
      title: 'Book It',
      desc: 'Pick your exact rental dates and send an instant reservation request.',
      offsetClass: 'md:translate-y-4 md:py-14',
    },
    {
      num: '03',
      icon: Handshake,
      title: 'Get It',
      desc: 'Meet up with the owner nearby, grab the gear, and get to work.',
      offsetClass: 'md:-translate-y-2',
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 border-y border-border/40 bg-gradient-to-b from-transparent via-[var(--surface)]/10 to-transparent antialiased overflow-hidden">
      <div className="max-w-5xl mx-auto px-5 md:px-6 text-center">

        {/* Header Block */}
        <div className="space-y-3 mb-14 md:mb-24 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tag-bg)] text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-[var(--tag-fg)] shadow-sm">
            Simple Process
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Three Steps. Zero Hassle.
          </h2>
        </div>

        {/* Main Grid & Mobile Timeline Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center"
        >
          {/* Desktop Ambient Glow */}
          <div className="hidden md:block absolute w-[110%] h-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent)_4%,transparent),transparent_60%)] -z-10 pointer-events-none" />

          {/* Mobile Vertical Connection Beam */}
          <div className="md:hidden absolute left-7 top-6 bottom-10 w-0.5 bg-gradient-to-b from-[var(--accent)] via-border/50 to-transparent -z-10" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`chrome-card group relative flex flex-row md:flex-col items-start md:items-center pl-16 pr-5 py-6 md:p-10 rounded-3xl md:rounded-[2.5rem] text-left md:text-center border border-border/30 bg-[var(--surface)]/40 backdrop-blur-md hover:bg-[var(--surface)] hover:shadow-2xl hover:shadow-[var(--accent)]/10 transition-all duration-500 ease-out ${step.offsetClass}`}
            >

              {/* Floating Timeline Icon Node (Mobile: Overlapping the beam | Desktop: Centered) */}
              <div className="absolute left-1.5 top-5 md:static shrink-0">
                <div className="relative w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-[var(--surface)] border border-border/60 text-[var(--accent)] flex items-center justify-center md:mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-md shadow-accent/5">
                  <step.icon size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={2} />

                  {/* Subtle Node Pulse on Mobile */}
                  <span className="md:hidden absolute -inset-1 rounded-2xl bg-[var(--accent)]/10 -z-10 animate-pulse" />
                </div>
              </div>

              {/* Content Frame */}
              <div className="space-y-1.5 md:space-y-2 flex-1 pl-2 md:pl-0">

                {/* Step Number Tag */}
                <div className="flex items-center justify-between md:justify-center mb-1 md:mb-4">
                  <span className="font-display text-[11px] md:text-xs font-black tracking-widest text-[var(--accent)] uppercase px-2 py-0.5 rounded-md bg-[var(--tag-bg)]">
                    Step {step.num}
                  </span>
                </div>

                <h3 className="font-display text-lg md:text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-[var(--accent)]">
                  {step.title}
                </h3>

                <p className="font-sans text-[13px] md:text-sm text-[var(--text-muted)] font-normal w-full md:max-w-[220px] md:mx-auto leading-relaxed">
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