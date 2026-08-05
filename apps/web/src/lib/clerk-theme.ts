// lib/clerk-theme.ts
export const clerkAppearance = {
  variables: {
    colorPrimary: '#005BEA',
    colorText: 'var(--foreground)',
    colorTextSecondary: 'var(--text-muted)',
    colorBackground: 'transparent',
    colorInputBackground: 'transparent',
    colorInputText: 'var(--foreground)',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-sans)',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'w-full max-w-md shadow-2xl rounded-3xl border border-border/30 bg-surface/90 backdrop-blur-2xl transition-all duration-300 overflow-hidden',
    card: 'bg-transparent shadow-none p-6 sm:p-8 w-full',
    headerTitle: 'font-display font-bold text-2xl text-foreground tracking-tight',
    headerSubtitle: 'text-sm text-foreground/60 font-sans mt-1',
    socialButtonsBlockButton: 'rounded-xl border border-border/30 bg-background/50 hover:bg-muted/80 text-foreground transition-all duration-200 font-medium py-2.5',
    socialButtonsBlockButtonText: 'text-sm font-semibold text-foreground',
    dividerLine: 'bg-border/20',
    dividerText: 'text-xs text-foreground/40 font-medium uppercase tracking-wider',
    formFieldLabel: 'text-xs font-semibold text-foreground/80 tracking-wide uppercase',
    formFieldInput: 'rounded-xl border border-border/30 bg-background/70 focus:bg-background focus:ring-2 focus:ring-[var(--accent)] text-foreground text-sm transition-all duration-200 py-2.5',
    formButtonPrimary: 'hyper-liquid w-full py-3 text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-black',
    footerActionLink: 'text-[var(--accent)] font-semibold hover:underline',
    footerActionText: 'text-xs text-foreground/60',
    footer: 'bg-transparent border-t border-border/10 pt-4',
    identityPreviewText: 'text-foreground font-semibold',
    identityPreviewEditButtonIcon: 'text-[var(--accent)]',
    formResendCodeLink: 'text-[var(--accent)] font-semibold',
    otpCodeFieldInput: 'border-border/30 bg-background/70 rounded-xl text-foreground focus:ring-2 focus:ring-[var(--accent)]',
    badge: 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold',
  }
};

