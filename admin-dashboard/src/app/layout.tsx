import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zalo Account Manager - Admin',
  description: 'Admin Dashboard for Zalo Account Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
