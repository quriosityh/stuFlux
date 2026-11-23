import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="relative min-h-[calc(100vh-var(--nav-expanded-h,96px))] w-full flex flex-col items-center justify-center pt-20 sm:pt-24 md:pt-8 pb-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6 relative z-10 flex flex-col items-center">
        {/* Sleek header badge & title */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
            Welcome Back
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-foreground">
            Sign in to <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">StuFlux</span>
          </h1>
          <p className="text-sm text-foreground/60 font-sans max-w-xs mx-auto">
            Access your rental dashboard, messages & listings
          </p>
        </div>

        {/* Clerk Sign In component */}
        <div className="w-full flex justify-center">
          <SignIn
            fallbackRedirectUrl="/"
            routing="path"
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            appearance={{
              elements: {
                header: 'hidden',
              },
            }}
          />
        </div>

        {/* Links footer */}
        <p className="text-xs text-center text-foreground/50 pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-[var(--accent)] font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

