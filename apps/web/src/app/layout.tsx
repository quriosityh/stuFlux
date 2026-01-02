import { clerkAppearance } from '@/lib/clerk-theme'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <html lang="en">
        <body className={inter.className}>
          <SignedOut>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </SignedOut>
          <SignedIn>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  )
}
