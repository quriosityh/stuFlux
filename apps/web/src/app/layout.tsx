import { clerkAppearance } from '@/lib/clerk-theme'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import { Syne, Manrope } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/navigation/Navigation'

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={clerkAppearance}
    >
      <html lang="en" className={`${syne.variable} ${manrope.variable}`}>
        <body className="font-sans antialiased transition-colors duration-300">
          <Navigation />
          <SignedOut>
            <main className="min-h-screen relative z-0 pt-16 pb-24 md:pb-0">{children}</main>
          </SignedOut>
          <SignedIn>
            <main className="min-h-screen relative z-0 pt-16 pb-24 md:pb-0">{children}</main>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}
