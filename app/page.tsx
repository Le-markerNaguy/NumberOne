"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { WhyPersonalizationSection } from "@/components/home/why-personalization-section"
import { StepsSection } from "@/components/home/steps-section"
import { PopularDishesSection } from "@/components/home/popular-dishes-section"
import { Button } from "@/components/ui/button"
import { UserPlus, UtensilsCrossed, ListChecks, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDishes } from "@/contexts/dishes-context"
import { useCart } from "@/contexts/cart-context"

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Créer un compte",
    description: "Inscrivez-vous pour profiter de nos avantages et commandez en quelques secondes.",
  },
  {
    number: "2",
    icon: UtensilsCrossed,
    title: "Choisir un plat",
    description: "Sélectionnez votre plat de base ou personnalisez complètement votre repas.",
  },
  {
    number: "3",
    icon: ListChecks,
    title: "Sélectionner quantités",
    description: "Ajustez les quantités selon vos envies et votre appétit.",
  },
  {
    number: "4",
    icon: CreditCard,
    title: "Payer et suivre",
    description: "Payez en ligne et suivez votre commande en temps réel jusqu'à la livraison.",
  },
]

export default function HomePage() {
  const { publicPopularDishes, isLoading } = useDishes()
  const { addSimpleItem } = useCart()

  const handleAddToCart = (dish: any) => {
    addSimpleItem(dish)
  }

  return (
    <PageLayout
      heroSection={
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-10">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 bg-white/90 text-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Nouveau concept de restauration
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight text-balance drop-shadow-2xl">
                Compose ton repas
                <br />
                <span className="text-primary drop-shadow-2xl">comme tu l&apos;aimes</span>
              </h1>
              <p className="text-white text-xl md:text-2xl leading-relaxed max-w-xl drop-shadow-lg">
                Un service simple, rapide et sur mesure pour créer le repas parfait. Choisissez les ingrédients, les
                quantités et ton budget.
              </p>
              <div className="flex flex-wrap gap-5 pt-4">
                <Link href="/personnaliser">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all hover:scale-105 rounded-2xl">
                    Personnaliser mon plat
                  </Button>
                </Link>
                <Link href="/menu">
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-6 py-3 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold transition-all hover:scale-105 bg-white/10 backdrop-blur-sm rounded-2xl"
                  >
                    Explorer le menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <WhyPersonalizationSection />

      <StepsSection
        title="Comment ça marche ?"
        subtitle="4 étapes simples pour créer votre repas personnalisé"
        steps={steps}
        ctaLabel="Créer mon compte"
        ctaHref="/inscription"
      />

      {isLoading ? (
        <section className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </section>
      ) : (
        <PopularDishesSection
          title="Plats populaires"
          subtitle="Découvrez nos plats les plus commandés, tous personnalisables à votre goût"
          dishes={publicPopularDishes}
          onAddToCart={handleAddToCart}
        />
      )}
    </PageLayout>
  )
}
