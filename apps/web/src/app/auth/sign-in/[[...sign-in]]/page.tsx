import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to StuFlux
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your rental dashboard
          </p>
        </div>
        <SignIn fallbackRedirectUrl="/messages" routing="path" path="/auth/sign-in" signUpUrl="/auth/sign-up" />
      </div>
    </div>
  );
}