import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevGenius',
  description: 'Your All-in-One Developer Assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <header className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">DevGenius</h1>
              <nav>
                <Link href="/" className="mr-4">Home</Link>
                <Link href="/mock-ide">Mock IDE</Link>
              </nav>
            </div>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-200 p-4 text-center">
            <p>&copy; 2024 DevGenius. All rights reserved.</p>
          </footer>
        </AppProvider>
      </body>
    </html>
  )
}