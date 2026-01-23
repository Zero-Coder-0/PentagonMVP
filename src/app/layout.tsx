import 'leaflet/dist/leaflet.css' // Add this to layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SchemaProvider } from '@/modules/core/context/SchemaContext';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GeoEstate Dashboard',
  description: 'Real Estate Sales Intelligence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SchemaProvider>
          {children}
        </SchemaProvider>
      </body>
    </html>
  )
}
