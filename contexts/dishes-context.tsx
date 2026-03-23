"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { categories as defaultCategories} from "@/lib/data"
import { Plat } from "@/lib/types"
import { platsApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface DishesContextType {
  platsMenu: Plat[]
  platsBase: Plat[]
  platsAccompagnement: Plat[]
  platsSupplements: Plat[]
  popularDishes: Plat[]
  publicPlatsMenu: Plat[]
  publicPlatsBase: Plat[]
  publicPlatsAccompagnement: Plat[]
  publicPlatsSupplements: Plat[]
  publicPopularDishes: Plat[]
  categories: string[]
  isLoading: boolean
  addPlat: (plat: Plat) => void
  updatePlat: (id: string, data: Partial<Plat>) => void
  deletePlat: (id: string) => void
}

const DishesContext = createContext<DishesContextType | undefined>(undefined)

export function DishesProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [platsMenu, setPlatsMenu] = useState<Plat[]>([])
  const [platsBase, setPlatsBase] = useState<Plat[]>([])
  const [platsAccompagnement, setPlatsAccompagnement] = useState<Plat[]>([])
  const [platsSupplements, setPlatsSupplements] = useState<Plat[]>([])
  const [popularDishes, setPopularDishes] = useState<Plat[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)

  const publicPlatsMenu = platsMenu.filter((p) => p.statut === "actif")
  const publicPlatsBase = platsBase.filter((p) => p.statut === "actif")
  const publicPlatsAccompagnement = platsAccompagnement.filter((p) => p.statut === "actif")
  const publicPlatsSupplements = platsSupplements.filter((p) => p.statut === "actif")
  const publicPopularDishes = publicPlatsMenu.slice(0, 4)

  // Debug: Log les changements pour vérifier que les données se mettent à jour
  useEffect(() => {
    console.log(`[dishes-context] PublicPlats - Menu: ${publicPlatsMenu.length}, Base: ${publicPlatsBase.length}, Acc: ${publicPlatsAccompagnement.length}, Sup: ${publicPlatsSupplements.length}`)
  }, [publicPlatsMenu, publicPlatsBase, publicPlatsAccompagnement, publicPlatsSupplements])

  const reloadPlats = async () => {
    setIsLoading(true)
    try {
      const [menuRes, baseRes, accRes, supRes] = await Promise.all([
        platsApi.getMenu(),
        platsApi.getBases(),
        platsApi.getAccompagnements(),
        platsApi.getSupplements(),
      ])

      if (menuRes.success && menuRes.data) setPlatsMenu(menuRes.data as any)
      if (baseRes.success && baseRes.data) setPlatsBase(baseRes.data as any)
      if (accRes.success && accRes.data) setPlatsAccompagnement(accRes.data as any)
      if (supRes.success && supRes.data) setPlatsSupplements(supRes.data as any)

      // UI admin: garder "popularDishes" basé sur les menus (tous statuts)
      if (menuRes.success && menuRes.data) setPopularDishes((menuRes.data as any).slice(0, 4))

      // Recalcul catégories à partir des données rechargées
      const allPlats = [
        ...(baseRes.data || []),
        ...(menuRes.data || []),
        ...(accRes.data || []),
        ...(supRes.data || []),
      ] as any[]

      if (allPlats.length > 0) {
        const uniqueCategories = Array.from(new Set(allPlats.map((p) => p.categorie))).filter(Boolean)
        setCategories(["Tous", ...uniqueCategories])
      }
    } catch (e) {
      console.error("Erreur lors du rechargement des plats:", e)
      toast({ title: "Erreur", description: "Impossible de recharger les plats depuis Supabase." })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    reloadPlats()

    return () => {
      mounted = false
    }
  }, [])

  const syncCategories = (all: Plat[]) => {
    if (all.length > 0) {
      const uniqueCategories = Array.from(new Set(all.map((p) => p.categorie))).filter(Boolean) as string[]
      setCategories(["Tous", ...uniqueCategories])
    }
  }

  const addPlat = (plat: Plat) => {
    ;(async () => {
      const res = await platsApi.create(plat as any)
      if (!res.success || !res.data) return
      const created = res.data as any as Plat

      if (created.type === "menu") {
        setPlatsMenu((prev) => [created, ...prev])
        setPopularDishes((prev) => [created, ...prev].slice(0, 4))
      } else if (created.type === "base") {
        setPlatsBase((prev) => [created, ...prev])
      } else if (created.type === "accompagnement") {
        setPlatsAccompagnement((prev) => [created, ...prev])
      } else if (created.type === "supplement") {
        setPlatsSupplements((prev) => [created, ...prev])
      }

      const all = [
        created,
        ...platsMenu,
        ...platsBase,
        ...platsAccompagnement,
        ...platsSupplements,
      ]
      syncCategories(all as Plat[])
    })()
  }

  const updatePlat = (id: string, data: Partial<Plat>) => {
    ;(async () => {
      const res = await platsApi.update(id, data as any)
      if (!res.success) {
        toast({ title: "Erreur", description: res.error || "Impossible de mettre à jour le plat." })
        return
      }
      await reloadPlats()
    })()
  }

  const deletePlat = (id: string) => {
    ;(async () => {
      try {
        // ÉTAPE 1: Supprimer de Supabase
        const res = await platsApi.delete(id)
        
        if (!res.success) {
          console.error(`[deletePlat] Erreur Supabase:`, res.error)
          toast({ title: "Erreur", description: res.error || "Impossible de supprimer le plat." })
          return
        }
        
        // ÉTAPE 2: Supprimer du UI immédiatement
        const filterList = (list: Plat[]) => list.filter((p) => p.id !== id)
        
        setPlatsMenu((prev) => filterList(prev))
        setPlatsBase((prev) => filterList(prev))
        setPlatsAccompagnement((prev) => filterList(prev))
        setPlatsSupplements((prev) => filterList(prev))
        setPopularDishes((prev) => prev.filter((p) => p.id !== id))
        
        // ÉTAPE 3: Recharger les données après 300ms pour synchroniser avec Supabase
        setTimeout(() => {
          reloadPlats()
        }, 300)
        
        toast({ title: "Succès", description: "Plat supprimé définitivement" })
      } catch (e) {
        console.error(`[deletePlat] Exception:`, e)
        toast({ title: "Erreur", description: "Une erreur est survenue lors de la suppression" })
      }
    })()
  }

  return (
    <DishesContext.Provider
      value={{
        platsMenu,
        platsBase,
        platsAccompagnement,
        platsSupplements,
        popularDishes,
        publicPlatsMenu,
        publicPlatsBase,
        publicPlatsAccompagnement,
        publicPlatsSupplements,
        publicPopularDishes,
        categories,
        isLoading,
        addPlat,
        updatePlat,
        deletePlat,
      }}
    >
      {children}
    </DishesContext.Provider>
  )
}

export function useDishes() {
  const context = useContext(DishesContext)
  if (context === undefined) {
    throw new Error("useDishes must be used within a DishesProvider")
  }
  return context
}
