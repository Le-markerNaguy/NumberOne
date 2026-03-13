// Types
export interface Variation {
  id: string
  taille: string
  prix: number
}

export interface Plat {
  id: string
  nom: string
  description: string
  type: "base" | "accompagnement" | "supplement" | "menu"
  prix_base: number
  categorie: string
  image: string
  statut: "actif" | "inactif"
  variations: Variation[]
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  nom_complet: string
  telephone: string
  email?: string
  date_inscription: string
}

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

// Mock Data - Bases
export const platsBase: Plat[] = [
  {
    id: "base-1",
    nom: "Poulet braisé",
    description: "Poulet braisé aux épices africaines",
    type: "base",
    prix_base: 3500,
    categorie: "Poulet",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500",
    statut: "actif",
    variations: [
      { id: "v1", taille: "petit", prix: 2500 },
      { id: "v2", taille: "moyen", prix: 3500 },
      { id: "v3", taille: "grand", prix: 4500 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "base-2",
    nom: "Poisson grillé",
    description: "Poisson frais grillé avec herbes",
    type: "base",
    prix_base: 4000,
    categorie: "Poisson",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500",
    statut: "actif",
    variations: [
      { id: "v4", taille: "petit", prix: 3000 },
      { id: "v5", taille: "moyen", prix: 4000 },
      { id: "v6", taille: "grand", prix: 5500 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "base-3",
    nom: "Boeuf sauté",
    description: "Boeuf sauté aux légumes",
    type: "base",
    prix_base: 4500,
    categorie: "Viande",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    statut: "actif",
    variations: [
      { id: "v7", taille: "petit", prix: 3500 },
      { id: "v8", taille: "moyen", prix: 4500 },
      { id: "v9", taille: "grand", prix: 6000 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
]

// Mock Data - Accompaniments
export const platsAccompagnement: Plat[] = [
  {
    id: "acc-1",
    nom: "Attiéké",
    description: "Semoule de manioc traditionnelle",
    type: "accompagnement",
    prix_base: 600,
    categorie: "Accompagnement",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
    statut: "actif",
    variations: [
      { id: "va1", taille: "petit", prix: 300 },
      { id: "va2", taille: "moyen", prix: 600 },
      { id: "va3", taille: "grand", prix: 1000 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "acc-2",
    nom: "Riz blanc",
    description: "Riz parfumé cuit à la vapeur",
    type: "accompagnement",
    prix_base: 500,
    categorie: "Accompagnement",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=500",
    statut: "actif",
    variations: [
      { id: "va4", taille: "petit", prix: 300 },
      { id: "va5", taille: "moyen", prix: 500 },
      { id: "va6", taille: "grand", prix: 800 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "acc-3",
    nom: "Frites",
    description: "Frites croustillantes maison",
    type: "accompagnement",
    prix_base: 700,
    categorie: "Accompagnement",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
    statut: "actif",
    variations: [
      { id: "va7", taille: "petit", prix: 400 },
      { id: "va8", taille: "moyen", prix: 700 },
      { id: "va9", taille: "grand", prix: 1100 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "acc-4",
    nom: "Banane plantain",
    description: "Banane plantain frite dorée",
    type: "accompagnement",
    prix_base: 600,
    categorie: "Accompagnement",
    image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=500",
    statut: "actif",
    variations: [
      { id: "va10", taille: "petit", prix: 350 },
      { id: "va11", taille: "moyen", prix: 600 },
      { id: "va12", taille: "grand", prix: 950 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
]

// Mock Data - Supplements
export const platsSupplements: Plat[] = [
  {
    id: "sup-1",
    nom: "Légumes sautés",
    description: "Mélange de légumes frais sautés",
    type: "supplement",
    prix_base: 1000,
    categorie: "Supplement",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
    statut: "actif",
    variations: [
      { id: "vs1", taille: "petit", prix: 600 },
      { id: "vs2", taille: "moyen", prix: 1000 },
      { id: "vs3", taille: "grand", prix: 1800 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "sup-2",
    nom: "Sauce tomate",
    description: "Sauce tomate épicée maison",
    type: "supplement",
    prix_base: 500,
    categorie: "Supplement",
    image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500",
    statut: "actif",
    variations: [
      { id: "vs4", taille: "petit", prix: 300 },
      { id: "vs5", taille: "moyen", prix: 500 },
      { id: "vs6", taille: "grand", prix: 800 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "sup-3",
    nom: "Oeufs",
    description: "Oeufs au plat ou brouillés",
    type: "supplement",
    prix_base: 400,
    categorie: "Supplement",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500",
    statut: "actif",
    variations: [
      { id: "vs7", taille: "petit", prix: 250 },
      { id: "vs8", taille: "moyen", prix: 400 },
      { id: "vs9", taille: "grand", prix: 600 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
]

// Mock Data - Menu Items (pre-configured dishes)
export const platsMenu: Plat[] = [
  {
    id: "menu-1",
    nom: "Menu Poulet Complet",
    description: "Poulet braisé + Attiéké + Légumes sautés",
    type: "menu",
    prix_base: 5500,
    categorie: "Poulet",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500",
    statut: "actif",
    variations: [
      { id: "vm1", taille: "petit", prix: 4000 },
      { id: "vm2", taille: "moyen", prix: 5500 },
      { id: "vm3", taille: "grand", prix: 7500 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "menu-2",
    nom: "Menu Poisson Royal",
    description: "Poisson grillé + Riz + Sauce tomate",
    type: "menu",
    prix_base: 6000,
    categorie: "Poisson",
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=500",
    statut: "actif",
    variations: [
      { id: "vm4", taille: "petit", prix: 4500 },
      { id: "vm5", taille: "moyen", prix: 6000 },
      { id: "vm6", taille: "grand", prix: 8000 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "menu-3",
    nom: "Menu Boeuf Délice",
    description: "Boeuf sauté + Frites + Légumes",
    type: "menu",
    prix_base: 6500,
    categorie: "Viande",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
    statut: "actif",
    variations: [
      { id: "vm7", taille: "petit", prix: 5000 },
      { id: "vm8", taille: "moyen", prix: 6500 },
      { id: "vm9", taille: "grand", prix: 8500 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "menu-4",
    nom: "Menu Végétarien",
    description: "Riz aux légumes sautés et sauce tomate",
    type: "menu",
    prix_base: 3500,
    categorie: "Végétarien",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    statut: "actif",
    variations: [
      { id: "vm10", taille: "petit", prix: 2500 },
      { id: "vm11", taille: "moyen", prix: 3500 },
      { id: "vm12", taille: "grand", prix: 4500 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "menu-5",
    nom: "Menu Africain",
    description: "Poulet + Banane plantain + Attiéké",
    type: "menu",
    prix_base: 5000,
    categorie: "Poulet",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500",
    statut: "actif",
    variations: [
      { id: "vm13", taille: "petit", prix: 3800 },
      { id: "vm14", taille: "moyen", prix: 5000 },
      { id: "vm15", taille: "grand", prix: 6800 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "menu-6",
    nom: "Menu Spécial CUBE",
    description: "Notre signature: Poulet + Poisson + Riz + Légumes",
    type: "menu",
    prix_base: 8000,
    categorie: "Spécial",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500",
    statut: "actif",
    variations: [
      { id: "vm16", taille: "petit", prix: 6500 },
      { id: "vm17", taille: "moyen", prix: 8000 },
      { id: "vm18", taille: "grand", prix: 10500 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
]

// Categories
export const categories = ["Tous", "Poulet", "Poisson", "Viande", "Végétarien", "Spécial"]

// Popular dishes for homepage
export const popularDishes = platsMenu.slice(0, 4)
