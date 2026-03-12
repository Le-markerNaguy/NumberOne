"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"

export default function PanierPage() {
  const { items, sousTotal, fraisLivraison, tva, total, tvaPourcentage, updateQuantity, removeItem } = useCart()
  const { isAuthenticated } = useAuth()

  const getItemDetails = (item: (typeof items)[0]) => {
    if (item.type === "simple" && item.plat) {
      return {
        name: item.plat.nom,
        description: item.variation ? `Taille: ${item.variation.taille}` : "",
        image: item.plat.image || "/placeholder.svg",
      }
    }

    if (item.type === "personnalise" && item.personnalisation) {
      const base = item.personnalisation.base
      const accNames = item.personnalisation.accompagnements.map((a) => a.plat.nom)
      const supNames = item.personnalisation.supplements.map((s) => s.plat.nom)

      return {
        name: `${base.plat.nom} personnalisé`,
        description: [...accNames, ...supNames].join(" + ") || "Personnalisé",
        image: base.plat.image || "/placeholder.svg",
      }
    }

    return { name: "Plat", description: "", image: "/placeholder.svg" }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center px-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6">
              Découvrez notre menu et ajoutez des plats à votre panier
            </p>
            <Link href="/menu">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explorer le menu
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Mon panier</h1>
            <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
              {items.length} article{items.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const details = getItemDetails(item)
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={details.image}
                            alt={details.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{details.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2 truncate">
                            {details.description}
                          </p>
                          <p className="text-primary font-bold">
                            {item.prixUnitaire.toFixed(0)}f / unité
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantite - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-semibold w-8 text-center">{item.quantite}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantite + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <p className="font-bold text-lg">{item.prixTotal.toFixed(0)}f</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{sousTotal.toFixed(0)}f</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span className="font-medium">{fraisLivraison.toFixed(0)}f</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA ({Math.round(tvaPourcentage * 100)}%)</span>
                    <span className="font-medium">{tva.toFixed(0)}f</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">{total.toFixed(0)}f</span>
                  </div>

                  {isAuthenticated ? (
                    <Link href="/commande" className="block">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6">
                        Passer la commande
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/connexion" className="block">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6">
                        Se connecter pour commander
                      </Button>
                    </Link>
                  )}

                  <Link href="/menu" className="block">
                    <Button variant="outline" className="w-full">
                      Continuer mes achats
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
