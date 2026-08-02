import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Join StuFlux
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start renting and earning today
          </p>
        </div>
        <SignUp fallbackRedirectUrl="/onboarding" routing="path" path="/auth/sign-up" signInUrl="/auth/sign-in" />
      </div>
    </div>
  );
}