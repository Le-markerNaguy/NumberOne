"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
  heroSection?: ReactNode
  className?: string
}

export function PageLayout({ children, heroSection, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {heroSection && (
        <section
          className="relative bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          {heroSection}
        </section>
      )}

      <main className={cn("flex-1", className)}>{children}</main>
      
      <Footer />
    </div>
  )
}
