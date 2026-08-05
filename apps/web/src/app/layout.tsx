import { clerkAppearance } from '@/lib/clerk-theme'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import { Space_Grotesk, Manrope } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation/Navigation'
import { NotificationStream } from '@/components/NotificationStream'
import { OnboardingProvider } from '@/components/auth/OnboardingProvider'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata = {
  title: 'StuFlux - Peer-to-Peer Rental Platform',
  description: 'Rent anything from your neighbors - cameras, tools, vehicles & more',
}

import { TopSpacer, BottomSpacer } from '@/components/navigation/LayoutSpacers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={clerkAppearance}
    >
      <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
        <body className="font-sans antialiased transition-colors duration-300 flex flex-col min-h-screen">
          <Navigation />
          <TopSpacer />
          <SignedOut>
            <main className="flex-1 relative z-0 flex flex-col">{children}</main>
          </SignedOut>
          <SignedIn>
            <OnboardingProvider>
              <NotificationStream />
              <main className="flex-1 relative z-0 flex flex-col">{children}</main>
            </OnboardingProvider>
          </SignedIn>
          <BottomSpacer />
        </body>
      </html>
    </ClerkProvider>
  )
}
