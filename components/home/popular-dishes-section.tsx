"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DishCard } from "@/components/dishes/dish-card"
import type { Plat } from "@/lib/data"

interface PopularDishesSectionProps {
  title: string
  subtitle?: string
  dishes: Plat[]
  onAddToCart: (dish: Plat) => void
}

export function PopularDishesSection({
  title,
  subtitle,
  dishes,
  onAddToCart,
}: PopularDishesSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onAddToCart={onAddToCart} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/menu">
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8"
            >
              Voir tout le menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
