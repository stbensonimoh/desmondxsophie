import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Desmond & Sophie - December 6, 2025',
  description: 'Save the date! Join us for our wedding celebration on December 6, 2025',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fleur+De+Leah&family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Fleur+De+Leah&family=Mea+Culpa&display=swap" rel="stylesheet"></link>
      </head>
      <body>{children}</body>
    </html>
  )
}
