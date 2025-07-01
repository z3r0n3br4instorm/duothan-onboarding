import type { Metadata } from 'next'
import './globals.css'
import { Space_Grotesk } from 'next/font/google'

// Initialize the Space Grotesk font
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Duothan Onboarding',
  description: 'Powered by IEEE NSBM',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={spaceGrotesk.className}>
      <body>{children}</body>
    </html>
  )
}
