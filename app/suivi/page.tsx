"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SuiviCommandeContent } from "@/components/suivi/suivi-content"

export default function SuiviCommandePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center">Chargement...</div>}>
          <SuiviCommandeContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: "Suivi de commande",
  }
}

