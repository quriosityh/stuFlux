// lib/clerk-theme.ts
export const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorInputBackground: '#f8fafc',
    colorInputText: '#0f172a',
    borderRadius: '0.875rem',
    fontFamily: 'var(--font-manrope), sans-serif',
    fontFamilyButtons: 'var(--font-heading), sans-serif',
  },
  elements: {
    card: 'w-full rounded-3xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-slate-950/25 backdrop-blur sm:p-5',
    headerTitle: 'font-display text-2xl font-bold tracking-tight',
    headerSubtitle: 'text-sm text-slate-500',
    socialButtonsBlockButton: 'min-h-11 rounded-xl border-slate-200 font-semibold transition hover:border-blue-300 hover:bg-blue-50',
    formButtonPrimary: 'min-h-11 rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-600/20 transition hover:bg-blue-700',
    formFieldInput: 'min-h-11 rounded-xl border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-blue-500/20',
    formFieldLabel: 'font-semibold text-slate-700',
    footerActionLink: 'font-semibold text-blue-600 hover:text-blue-700',
    dividerLine: 'bg-slate-200',
  },
};
