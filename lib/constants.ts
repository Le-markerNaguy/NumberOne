import { OrderStatus } from "./types"

export const STATUTS_COMMANDE = {
  [OrderStatus.PENDING]: { label: "En attente", color: "bg-blue-100 text-blue-700" },
  [OrderStatus.CONFIRMED]: { label: "Confirmée", color: "bg-cyan-100 text-cyan-700" },
  [OrderStatus.PREPARING]: { label: "En préparation", color: "bg-orange-100 text-orange-700" },
  [OrderStatus.READY]: { label: "Prêt", color: "bg-yellow-100 text-yellow-700" },
  [OrderStatus.DELIVERING]: { label: "En livraison", color: "bg-purple-100 text-purple-700" },
  [OrderStatus.DELIVERED]: { label: "Livrée", color: "bg-green-100 text-green-700" },
  [OrderStatus.CANCELLED]: { label: "Annulée", color: "bg-red-100 text-red-700" },
}

export const TAUX_TVA = 0.16 // 16%

export const FRAIS_LIVRAISON_DEFAUT = 2000
