import 'leaflet/dist/leaflet.css' // Add this to layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SchemaProvider } from '@/modules/core/context/SchemaContext';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GeoEstate Dashboard',
  description: 'Real Estate Sales Intelligence Platform',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, orientation=landscape'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SchemaProvider>
          {children}
        </SchemaProvider>
      </body>
    </html>
  )
}
