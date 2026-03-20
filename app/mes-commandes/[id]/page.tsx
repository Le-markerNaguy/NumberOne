"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { commandesApi, type CommandeResponse } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useDishes } from "@/contexts/dishes-context"
import { STATUTS_COMMANDE } from "@/lib/constants"
import { OrderStatus } from "@/lib/types"

export default function MesCommandesDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, isLoading, client } = useAuth()

  const [order, setOrder] = useState<CommandeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { platsMenu, platsBase, platsAccompagnement, platsSupplements } = useDishes()
  const allPlats = [...platsMenu, ...platsBase, ...platsAccompagnement, ...platsSupplements]

  const id = params?.id

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/connexion?redirect=/mes-commandes/${encodeURIComponent(String(id || ""))}`)
    }
  }, [isAuthenticated, isLoading, router, id])

  useEffect(() => {
    if (!id || !client) return

    let mounted = true
    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await commandesApi.getById(String(id))
        if (!mounted) return

        if (!res.success || !res.data) {
          setNotFound(true)
          setOrder(null)
          return
        }

        // sécurité front: vérifier que la commande appartient au client
        if (res.data.client?.id !== client.id) {
          setNotFound(true)
          setOrder(null)
          return
        }

        setOrder(res.data)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id, client])

  const statusLabel = (status: OrderStatus | string) =>
    STATUTS_COMMANDE[status as OrderStatus]?.label || status

  const statusClass = (status: OrderStatus | string) =>
    STATUTS_COMMANDE[status as OrderStatus]?.color || "bg-gray-100 text-gray-700"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Détails de la commande</h1>
              <p className="text-muted-foreground">Consultez les informations et les articles.</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/mes-commandes")}>
              Retour
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : notFound || !order ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Commande introuvable.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle>Commande #{order.id.slice(0, 8)}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs md:text-sm ${statusClass(order.statut_commande as any)}`}>
                    {statusLabel(order.statut_commande as any)}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{new Date(order.date_commande).toLocaleString("fr-FR")}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold text-primary">{order.total.toFixed(0)} f</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Adresse de livraison</p>
                    <p className="font-medium">
                      {order.adresse_livraison}
                      {order.commune ? `, ${order.commune}` : ""}
                      {order.ville ? `, ${order.ville}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Articles ({order.lignes.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.lignes.map((l) => {
                    const associatedPlat = allPlats.find((p) => p.id === l.id_plat)
                    return (
                      <div key={l.id} className="flex items-center justify-between gap-4 border-b last:border-0 pb-3 last:pb-0">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img
                              src={associatedPlat?.image || l.image_plat || "/placeholder.svg"}
                              alt={associatedPlat?.nom || l.nom_plat || "Plat"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{associatedPlat?.nom || l.nom_plat}</p>
                            {associatedPlat?.categorie && (
                              <p className="text-xs text-gray-500">{associatedPlat.categorie}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {l.quantite} × {Number(l.prix_unitaire).toFixed(0)} f
                              {l.taille ? ` • Taille: ${l.taille}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="font-semibold">{Number(l.prix_total).toFixed(0)} f</div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

