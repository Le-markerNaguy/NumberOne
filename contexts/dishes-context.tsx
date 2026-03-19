"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { categories as defaultCategories} from "@/lib/data"
import { Plat } from "@/lib/types"
import { platsApi } from "@/lib/api"

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

  useEffect(() => {
    let mounted = true

    async function loadPlats() {
      setIsLoading(true)
      try {
        const [menuRes, baseRes, accRes, supRes] = await Promise.all([
          platsApi.getMenu(),
          platsApi.getBases(),
          platsApi.getAccompagnements(),
          platsApi.getSupplements(),
        ])

        if (!mounted) return

        if (menuRes.success && menuRes.data) {
          setPlatsMenu(menuRes.data as any)
          // Dishes populaires = 4 premiers menus (liste complète, le public filtrera sur `statut`)
          setPopularDishes((menuRes.data as any).slice(0, 4))
        }
        if (baseRes.success && baseRes.data) setPlatsBase(baseRes.data as any)
        if (accRes.success && accRes.data) setPlatsAccompagnement(accRes.data as any)
        if (supRes.success && supRes.data) setPlatsSupplements(supRes.data as any)

        // Construire dynamiquement les catégories si possible
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
        console.error("Erreur lors du chargement des plats depuis Supabase:", e)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadPlats()

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
      if (!res.success || !res.data) return
      const updated = res.data as any as Plat

      const updateList = (list: Plat[]) => list.map((p) => (p.id === id ? updated : p))

      setPlatsMenu((prev) => updateList(prev))
      setPlatsBase((prev) => updateList(prev))
      setPlatsAccompagnement((prev) => updateList(prev))
      setPlatsSupplements((prev) => updateList(prev))

      const all = [
        ...platsMenu,
        ...platsBase,
        ...platsAccompagnement,
        ...platsSupplements,
      ].map((p) => (p.id === id ? updated : p))
      syncCategories(all as Plat[])
    })()
  }

  const deletePlat = (id: string) => {
    ;(async () => {
      const res = await platsApi.delete(id)
      if (!res.success) return

      const filterList = (list: Plat[]) => list.filter((p) => p.id !== id)

      const newMenu = filterList(platsMenu)
      const newBase = filterList(platsBase)
      const newAcc = filterList(platsAccompagnement)
      const newSup = filterList(platsSupplements)

      setPlatsMenu(newMenu)
      setPlatsBase(newBase)
      setPlatsAccompagnement(newAcc)
      setPlatsSupplements(newSup)
      setPopularDishes((prev) => prev.filter((p) => p.id !== id))

      const all = [...newMenu, ...newBase, ...newAcc, ...newSup]
      syncCategories(all as Plat[])
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
