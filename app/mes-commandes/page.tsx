"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { commandesApi, type CommandeResponse } from "@/lib/api"
import { STATUTS_COMMANDE } from "@/lib/constants"
import { OrderStatus } from "@/lib/types"

export default function MesCommandesPage() {
  const { isAuthenticated, isLoading, client } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<CommandeResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connexion?redirect=/mes-commandes")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!client) return

    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await commandesApi.getAll()
        if (!mounted || !res.success || !res.data) return

        const mine = res.data.filter((cmd) => cmd.client?.id === client.id)
        setOrders(
          mine.sort(
            (a, b) =>
              new Date(b.date_commande).getTime() - new Date(a.date_commande).getTime(),
          ),
        )
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [client])

  const statusLabel = (status: OrderStatus | string) =>
    STATUTS_COMMANDE[status as OrderStatus]?.label || status

  const statusClass = (status: OrderStatus | string) =>
    STATUTS_COMMANDE[status as OrderStatus]?.color ||
    "bg-gray-100 text-gray-700"

  if (isLoading || (!isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mes commandes</h1>
              <p className="text-muted-foreground">
                Historique de toutes vos commandes passées.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/profil")}>
              Mon profil
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Vous n&apos;avez encore passé aucune commande.
              </p>
              <Button onClick={() => router.push("/menu")}>
                Découvrir le menu
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base md:text-lg">
                        Commande #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(order.date_commande).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs md:text-sm ${statusClass(
                        order.statut_commande as OrderStatus,
                      )}`}
                    >
                      {statusLabel(order.statut_commande as OrderStatus)}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Articles</span>
                      <span className="font-medium">
                        {order.lignes.length} élément
                        {order.lignes.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold text-primary">
                        {order.total.toFixed(0)} f
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/mes-commandes/${order.id}`)}
                      >
                        Détails de la commande
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

