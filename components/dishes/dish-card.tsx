"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import type { Plat } from "@/lib/data"

interface DishCardProps {
  dish: Plat
  onAddToCart: (dish: Plat) => void
}

export function DishCard({ dish, onAddToCart }: DishCardProps) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart(dish)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const mediumVariation = dish.variations?.[1] || dish.variations?.[0]
  const price = mediumVariation?.prix || dish.prix_base

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={dish.image || "/placeholder.svg"}
          alt={dish.nom}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
            {price.toFixed(0)}f
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="text-xs text-white/80 bg-black/40 px-2 py-1 rounded">
            {dish.categorie}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1">{dish.nom}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{dish.description}</p>
        
        {dish.variations && dish.variations.length > 0 && (
          <div className="flex gap-2 mb-4">
            {dish.variations.map((v) => (
              <div
                key={v.id}
                className="flex-1 text-center p-2 bg-secondary/50 rounded text-xs"
              >
                <div className="text-muted-foreground capitalize">{v.taille}</div>
                <div className="font-semibold text-primary">{v.prix.toFixed(0)}f</div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleAdd}
          disabled={added}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {added ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Ajouté
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter au panier
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
