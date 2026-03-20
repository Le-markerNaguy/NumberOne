"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Plat, Variation } from "@/lib/data"
import { settingsApi } from "@/lib/api"

interface Personnalisation {
  base: { plat: Plat; variation: Variation }
  accompagnements: { plat: Plat; variation: Variation; quantite: number }[]
  supplements: { plat: Plat; variation: Variation; quantite: number }[]
}

interface CartItem {
  id: string
  type: "simple" | "personnalise"
  plat?: Plat
  variation?: Variation
  personnalisation?: Personnalisation
  quantite: number
  prixUnitaire: number
  prixTotal: number
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  sousTotal: number
  fraisLivraison: number
  tva: number
  total: number
  tvaPourcentage: number
  commandeMinimum: number
  livraisonGratuiteSeuil: number
  addSimpleItem: (plat: Plat, variation?: Variation, quantite?: number) => void
  addCustomItem: (personnalisation: Personnalisation, quantite?: number) => void
  updateQuantity: (id: string, quantite: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [fraisLivraison, setFraisLivraison] = useState(2000)
  const [tvaPourcentage, setTvaPourcentage] = useState(0)
  const [commandeMinimum, setCommandeMinimum] = useState(0)
  const [livraisonGratuiteSeuil, setLivraisonGratuiteSeuil] = useState(0)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("cube_cart")
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        localStorage.removeItem("cube_cart")
      }
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cube_cart", JSON.stringify(items))
  }, [items])

  // Load settings from Supabase
  useEffect(() => {
    let mounted = true
    async function loadSettings() {
      const res = await settingsApi.getDefault()
      if (!mounted || !res.success || !res.data) return

      setFraisLivraison(res.data.frais_livraison_defaut)
      setTvaPourcentage(0)
      setCommandeMinimum(res.data.commande_minimum ?? 0)
      setLivraisonGratuiteSeuil(res.data.livraison_gratuite_seuil ?? 0)
    }
    loadSettings()
    return () => {
      mounted = false
    }
  }, [])

  const itemCount = items.reduce((sum, item) => sum + item.quantite, 0)
  const sousTotal = items.reduce((sum, item) => sum + item.prixTotal, 0)
  const tva = sousTotal * tvaPourcentage
  const effectiveFraisLivraison =
    items.length > 0
      ? livraisonGratuiteSeuil > 0 && sousTotal >= livraisonGratuiteSeuil
        ? 0
        : fraisLivraison
      : 0
  const total = sousTotal + effectiveFraisLivraison

  const addSimpleItem = (plat: Plat, variation?: Variation, quantite = 1) => {
    const selectedVariation =
      variation ||
      plat.variations?.[1] ||
      plat.variations?.[0] ||
      {
        id: `var-${plat.id}-default`,
        id_plat: plat.id,
        taille: "petit",
        prix: plat.prix_base,
      }
    const prixUnitaire = selectedVariation?.prix || plat.prix_base

    setItems((prev) => {
      // Check if same item exists
      const existingIndex = prev.findIndex(
        (item) =>
          item.type === "simple" &&
          item.plat?.id === plat.id &&
          item.variation?.id === selectedVariation?.id
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantite += quantite
        updated[existingIndex].prixTotal = updated[existingIndex].prixUnitaire * updated[existingIndex].quantite
        return updated
      }

      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          type: "simple",
          plat,
          variation: selectedVariation,
          quantite,
          prixUnitaire,
          prixTotal: prixUnitaire * quantite,
        },
      ]
    })
  }

  const addCustomItem = (personnalisation: Personnalisation, quantite = 1) => {
    const basePrice = personnalisation.base.variation.prix
    const accPrice = personnalisation.accompagnements.reduce(
      (sum, acc) => sum + acc.variation.prix * acc.quantite,
      0
    )
    const supPrice = personnalisation.supplements.reduce(
      (sum, sup) => sum + sup.variation.prix * sup.quantite,
      0
    )
    const prixUnitaire = basePrice + accPrice + supPrice

    setItems((prev) => [
      ...prev,
      {
        id: `cart-custom-${Date.now()}`,
        type: "personnalise",
        personnalisation,
        quantite,
        prixUnitaire,
        prixTotal: prixUnitaire * quantite,
      },
    ])
  }

  const updateQuantity = (id: string, quantite: number) => {
    if (quantite <= 0) {
      removeItem(id)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantite, prixTotal: item.prixUnitaire * quantite }
          : item
      )
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cube_cart")
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        sousTotal,
        fraisLivraison: effectiveFraisLivraison,
        tva,
        total,
        tvaPourcentage,
        commandeMinimum,
        livraisonGratuiteSeuil,
        addSimpleItem,
        addCustomItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
