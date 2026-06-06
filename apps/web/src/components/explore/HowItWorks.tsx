'use client';

import { Search, CalendarDays, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 100, 
      damping: 15 
    } 
  },
};

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Find It',
      desc: 'Browse gear near you.',
    },
    {
      icon: CalendarDays,
      title: 'Book It',
      desc: 'Pick dates & request.',
    },
    {
      icon: Handshake,
      title: 'Get It',
      desc: 'Meet up and create.',
    },
  ];

  return (
    <section className="w-full py-12 border-y border-border/10 bg-surface/30">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-syne text-4xl md:text-5xl font-extrabold tracking-tighter mb-12">How StuFlux Works</h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Desktop connecting line */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px border-t-2 border-dashed border-border/20 -z-10 origin-left" 
          />

          {steps.map((step, i) => (
            <motion.div key={i} variants={itemVariants} className="flex flex-col items-center bg-background/50 backdrop-blur-md p-6 rounded-3xl border border-border/10 shadow-sm relative">
              <div className="w-20 h-20 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-6 text-[var(--accent)] shadow-inner">
                <step.icon size={36} strokeWidth={2} />
              </div>
              <h3 className="font-syne text-2xl font-bold tracking-tight mb-2">{step.title}</h3>
              <p className="text-foreground/50 text-sm font-medium max-w-[200px] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
