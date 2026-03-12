"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { commandesApi } from "@/lib/api"
import type { Commande } from "@/lib/types"
import { STATUTS_COMMANDE } from "@/lib/constants"

export default function SuiviCommandePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const commandeId = searchParams.get("id")

  const [commande, setCommande] = useState<Commande | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!commandeId) return

    let mounted = true
    let interval: ReturnType<typeof setInterval> | null = null

    const load = async () => {
      const res = await commandesApi.getById(commandeId)
      if (!mounted) return

      if (!res.success || !res.data) {
        setNotFound(true)
        setCommande(null)
        return
      }

      const cmd = res.data as Commande

      // Si livrée, on efface automatiquement la vue
      if (cmd.statut_commande === "livree") {
        setCommande(null)
        if (interval) clearInterval(interval)
        return
      }

      setCommande(cmd)
      setNotFound(false)
    }

    load()
    interval = setInterval(load, 5000)

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
    }
  }, [commandeId])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">Suivi de commande</h1>

          {!commandeId && (
            <p className="text-muted-foreground">Aucune commande à suivre.</p>
          )}

          {commandeId && notFound && (
            <p className="text-muted-foreground">Commande introuvable ou déjà supprimée.</p>
          )}

          {commande && (
            <Card>
              <CardHeader>
                <CardTitle>Commande #{commande.id.slice(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Statut actuel</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    STATUTS_COMMANDE[commande.statut_commande]?.color || "bg-gray-100 text-gray-700"
                  }`}>
                    {STATUTS_COMMANDE[commande.statut_commande]?.label || commande.statut_commande}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{commande.client?.nom_complet}</p>
                  <p className="text-sm text-muted-foreground">{commande.client?.telephone}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Adresse de livraison</p>
                  <p className="font-medium">
                    {commande.adresse_livraison}, {commande.commune}, {commande.ville}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="font-bold">{commande.total.toFixed(0)} f</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

