import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Local AI Chat',
  description: 'Real-time chat with local AI models (Ollama & LM Studio)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
