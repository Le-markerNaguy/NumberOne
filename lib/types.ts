// Order Status Enum
export enum OrderStatus {
  PENDING = "en_attente",
  CONFIRMED = "confirmee",
  PREPARING = "en_preparation",
  READY = "pret",
  DELIVERING = "en_livraison",
  DELIVERED = "livree",
  CANCELLED = "annulee",
}

// User Role Types
// Rôles applicatifs :
// - client: utilisateur final
// - superadmin: super administrateur
// - cuisinier, caissier, manager: trois types d'admins créés par le superadmin
export type UserRole = "client" | "superadmin" | "cuisinier" | "caissier" | "manager"

export type StatutCommande = 
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "pret"
  | "en_livraison"
  | "livree"
  | "annulee"

export type StatutPlat = "actif" | "inactif"

// Plat Types
export interface Variation {
  id: string
  id_plat: string
  taille: "petit" | "moyen" | "grand"
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
  statut: StatutPlat
  variations?: Variation[]
  created_at?: string
  updated_at?: string
}

// Admin Types
export interface Admin {
  id: string
  nom: string
  email: string
  role: UserRole
  role_id?: string
  permissions?: string[]
  created_at?: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
}

// Client Types
export interface Client {
  id: string
  nom_complet: string
  telephone: string
  email?: string
  date_inscription: string
}

// Order Types
export interface LigneCommande {
  id: string
  id_plat: string
  nom_plat: string
  image_plat?: string
  quantite: number
  prix_unitaire: number
  prix_total: number
  taille?: string
  type_element?: "base" | "accompagnement" | "supplement"
}

export interface Paiement {
  id: string
  mode: "airtel_money" | "moov_money" | "livraison"
  montant: number
  statut: "en_attente" | "confirme" | "echoue"
  montant_en_especes?: number
}

export interface Commande {
  id: string
  client: Client
  lignes: LigneCommande[]
  sous_total: number
  frais_livraison: number
  tva: number
  total: number
  statut_commande: StatutCommande
  adresse_livraison: string
  commune: string
  ville: string
  instructions?: string
  paiement?: Paiement
  date_commande: string
  date_confirmation?: string
  date_preparation?: string
  date_depart_livraison?: string
  date_livree?: string
}

// Permission constants
export const ADMIN_PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  PLATS_MANAGE: "plats.manage",
  ORDERS_VIEW: "orders.view",
  ORDERS_UPDATE: "orders.update",
  ORDERS_PREPARATION_UPDATE: "orders.preparation.update",
  ORDERS_LIVREE_CONFIRM: "orders.livree.confirm",
  CLIENTS_VIEW: "clients.view",
  CLIENTS_MANAGE: "clients.manage",
  ADMINS_MANAGE: "admin.admins.manage",
  ROLES_MANAGE: "admin.roles.manage",
  SETTINGS_MANAGE: "settings.manage",
} as const
