import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,.3),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,.18),_transparent_35%)]" />
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl font-black shadow-lg shadow-blue-500/30">S</div>
          <p className="font-display text-3xl font-bold tracking-tight">Join StuFlux</p>
          <p className="mt-2 text-sm text-slate-300">Your campus marketplace for borrowing more and owning less.</p>
        </div>
        <SignUp fallbackRedirectUrl="/onboarding" routing="path" path="/auth/sign-up" signInUrl="/auth/sign-in" />
      </div>
    </main>
  );
}
