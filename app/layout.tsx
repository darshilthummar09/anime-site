import type { Metadata } from 'next'
import './globals.css'
import '@/lib/errorHandler'
import { PremiumProvider } from '@/contexts/PremiumContext'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'AnimeFlix - Watch Anime Online',
  description: 'Stream your favorite anime shows and movies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <PremiumProvider>
            {children}
          </PremiumProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

