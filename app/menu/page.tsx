"use client"

import { useState } from "react"
import { PageLayout } from "@/components/layout/page-layout"
import { PageHeader } from "@/components/layout/page-header"
import { DishCard } from "@/components/dishes/dish-card"
import { CategoryFilter } from "@/components/dishes/category-filter"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useDishes } from "@/contexts/dishes-context"
import Link from "next/link"

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("Plat-menus")
  const { addSimpleItem } = useCart()
  const { platsMenu, categories, isLoading } = useDishes()

  const menuCategories = categories.filter((c) => c === "Tous" || c === "Plat-menus")

  const filteredDishes =
    platsMenu
      .filter((p) => p.categorie === "Plat-menus")
      .filter((p) => (activeCategory === "Tous" ? p.statut === "actif" : p.categorie === activeCategory && p.statut === "actif"))

  const handleAddToCart = (plat: any) => {
    addSimpleItem(plat)
  }

  return (
    <PageLayout className="bg-background">
      {/* Hero */}
      <section className="bg-muted/40 py-12 mb-8">
        <div className="container mx-auto px-4">
          <PageHeader
            title="Menu Cube"
            subtitle="Choisissez un plat déjà personnalisé par le CUBE ou créez le vôtre !"
            className="mb-8"
          />
          <CategoryFilter
            categories={menuCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </section>

      {/* Dishes Grid */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun plat disponible dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="bg-primary/10 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Envie de quelque chose d&apos;unique ?</h2>
          <p className="text-muted-foreground mb-6">
            Créez votre propre plat en sélectionnant vos ingrédients préférés
          </p>
          <Link href="/personnaliser">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
              Personnaliser un plat
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  )
}
