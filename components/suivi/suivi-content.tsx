"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { commandesApi } from "@/lib/api"
import type { Commande } from "@/lib/types"
import { STATUTS_COMMANDE } from "@/lib/constants"
import { supabase } from "@/lib/supabase-client"

export function SuiviCommandeContent() {
  const searchParams = useSearchParams()
  const commandeId = searchParams.get("id")

  const [commande, setCommande] = useState<Commande | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!commandeId) return

    let mounted = true
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
        return
      }

      setCommande(cmd)
      setNotFound(false)
    }

    load()

    const channel = supabase
      .channel(`commande-${commandeId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "commandes", filter: `id=eq.${commandeId}` },
        (payload) => {
          const cmd = payload.new as Commande
          if (cmd.statut_commande === "livree") {
            setCommande(null)
            return
          }
          setCommande(cmd)
          setNotFound(false)
        },
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [commandeId])

  return (
    <div className="bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Suivi de commande</h1>

        {!commandeId && <p className="text-muted-foreground">Aucune commande à suivre.</p>}

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
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    STATUTS_COMMANDE[commande.statut_commande]?.color || "bg-gray-100 text-gray-700"
                  }`}
                >
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
    </div>
  )
}
