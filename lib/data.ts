// Types
import { Plat , Variation, Client} from "./types"

// Constants
export const SUJETS_CONTACT = [
  "Question générale",
  "Réservation",
  "Réclamation",
  "Partenariat",
  "Autre",
]

export const INFO_RESTAURANT = {
  adresse: "123 Rue de la Gastronomie, Libreville",
  telephone: "+241 XX XXX XXX",
  email: "contact@cube-restaurant.com",
  horaires: {
    semaine: "11h - 22h",
    weekend: "12h - 23h",
  },
}

export const VILLES_GABON = [
  { id: "1", nom: "Libreville" },
  { id: "2", nom: "Port-Gentil" },
  { id: "3", nom: "Franceville" },
  { id: "4", nom: "Oyem" },
]

export const QUARTIERS_LIBREVILLE = [
  { id: "1", nom: "Akebe" },
  { id: "2", nom: "Nzeng-Ayong" },
  { id: "3", nom: "Plein Ciel" },
  { id: "4", nom: "Glass" },
  { id: "5", nom: "Louis" },
]

export const MODES_PAIEMENT = [
  {
    id: "airtel_money",
    nom: "Airtel Money",
    description: "Paiement mobile via Airtel Money",
  },
  {
    id: "moov_money",
    nom: "Moov Money",
    description: "Paiement mobile via Moov Money",
  },
  {
    id: "livraison",
    nom: "Paiement à la livraison",
    description: "Payez en espèces à la réception de votre commande",
  },
]


// Categories
export const categories = ["Tous", "Poulet", "Poisson", "Viande", "Végétarien", "Spécial"]


