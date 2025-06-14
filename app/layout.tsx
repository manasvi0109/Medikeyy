import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import ThemeToggle from "@/components/theme-toggle"
import AnimatedBackground from "@/components/animated-background"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediKey - Health Dashboard",
  description: "Your personal health management platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="medikey-theme">
          <AuthProvider>
            <div className="flex min-h-screen relative">
              <Sidebar />
              <main className="flex-1 overflow-auto relative w-full md:w-[calc(100%-16rem)]">
                <AnimatedBackground />
                <div className="pt-16 md:pt-0">{children}</div>
                <div className="fixed bottom-4 right-4 z-50">
                  <ThemeToggle />
                </div>
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
