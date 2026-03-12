"use client"

import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-16 text-center bg-muted/50">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Comment fonctionne la personnalisation chez Cube ?
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto px-4">
          Chez Cube, vous composez votre plat étape par étape. Chaque élément
          possède plusieurs quantités, avec un prix adapté à votre budget.
        </p>
      </section>

      {/* Step 1 */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-primary font-semibold">ETAPE 1</span>
            <h2 className="text-2xl font-bold">Choisissez votre base</h2>
            <p className="text-muted-foreground">
              La base est l&apos;élément principal de votre plat (poulet, poisson,
              riz...). Chaque base est disponible en trois quantités.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 border space-y-2">
              <p className="font-semibold">Exemple : Poulet braisé</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                <li>Petite portion - 2 500 FCFA</li>
                <li>Portion moyenne - 3 500 FCFA</li>
                <li>Grande portion - 4 500 FCFA</li>
              </ul>
            </div>
          </div>

          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500"
              alt="Base du plat"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="py-14 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg md:order-first">
            <Image
              src="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500"
              alt="Accompagnements"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <span className="text-primary font-semibold">ETAPE 2</span>
            <h2 className="text-2xl font-bold">Ajoutez vos accompagnements</h2>
            <p className="text-muted-foreground">
              Les accompagnements complètent votre plat. Vous pouvez en choisir
              un ou plusieurs, chacun avec trois niveaux de quantité.
            </p>

            <div className="bg-card rounded-xl p-4 border space-y-2">
              <p className="font-semibold">Exemple : Attiéké</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                <li>Petite portion - +300 FCFA</li>
                <li>Portion moyenne - +600 FCFA</li>
                <li>Grande portion - +1 000 FCFA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-primary font-semibold">ETAPE 3</span>
            <h2 className="text-2xl font-bold">Ajoutez des suppléments</h2>
            <p className="text-muted-foreground">
              Les suppléments vous permettent d&apos;enrichir votre plat selon vos
              envies, avec un contrôle total du prix.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 border space-y-2">
              <p className="font-semibold">Exemple : Légumes premium</p>
              <ul className="text-sm text-muted-foreground list-disc pl-5">
                <li>Petit supplément - + 600 FCFA</li>
                <li>Supplément standard - +1 000 FCFA</li>
                <li>Supplément généreux - +1 800 FCFA</li>
              </ul>
            </div>
          </div>

          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500"
              alt="Suppléments"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pricing Explanation */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl font-bold text-primary">Un prix clair et flexible</h2>
          <p className="text-muted-foreground">
            Le prix final dépend uniquement des quantités choisies. Plus vous
            ajoutez d&apos;éléments ou augmentez les portions, plus le prix s&apos;ajuste.
          </p>

          <div className="bg-card rounded-xl shadow-lg p-6 text-left space-y-3 border">
            <p className="font-semibold">Exemple de calcul :</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Base : Poulet braisé (portion moyenne) - 3 500 FCFA</li>
              <li>Accompagnement : Attiéké (portion moyenne) - +600 FCFA</li>
              <li>Supplément : Légumes premium (standard) - +1 000 FCFA</li>
            </ul>
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">5 100 FCFA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-16 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Une personnalisation à votre image</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Cube vous permet de composer un plat unique, adapté à vos goûts et à
          votre budget, grâce à des quantités flexibles et transparentes.
        </p>
      </section>

      <Footer />
    </div>
  )
}
