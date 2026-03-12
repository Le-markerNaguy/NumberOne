import { Utensils, Scale, Wallet, Heart } from "lucide-react"

const features = [
  {
    icon: Utensils,
    title: "Choix des ingrédients",
    description: "Sélectionnez exactement ce que vous voulez dans votre assiette.",
  },
  {
    icon: Scale,
    title: "Quantités flexibles",
    description: "Adaptez les portions selon votre appétit du moment.",
  },
  {
    icon: Wallet,
    title: "Budget maîtrisé",
    description: "Contrôlez le prix final de votre commande en temps réel.",
  },
  {
    icon: Heart,
    title: "Fait avec amour",
    description: "Des plats préparés sur mesure avec des produits frais.",
  },
]

export function WhyPersonalizationSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pourquoi personnaliser ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chez CUBE, chaque plat est unique car il est créé par vous, pour vous.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl shadow-sm border border-border text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
