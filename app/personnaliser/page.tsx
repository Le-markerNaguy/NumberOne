"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, Check, ShoppingCart, Sparkles } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useDishes } from "@/contexts/dishes-context"
import Link from "next/link"
import type { Plat, Variation } from "@/lib/data"

export default function PersonnaliserPage() {
  const { addCustomItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { publicPlatsBase, publicPlatsAccompagnement, publicPlatsSupplements } = useDishes()
  const [added, setAdded] = useState(false)

  // Base selection
  const [selectedBaseId, setSelectedBaseId] = useState<string>(publicPlatsBase[0]?.id || "")
  const [selectedBaseSizes, setSelectedBaseSizes] = useState<Record<string, string>>({})

  // Accompaniments (multiple selection with variations)
  const [selectedAccompaniments, setSelectedAccompaniments] = useState<
    Record<string, { selected: boolean; taille: string }>
  >({})

  const [selectedSupplements, setSelectedSupplements] = useState<Record<string, { selected: boolean; taille: string }>>(
    {},
  )

  const [quantity, setQuantity] = useState(1)

  // Si la base sélectionnée devient inactive/supprimée, on rebascule sur la première base active
  useEffect(() => {
    if (publicPlatsBase.length === 0) return
    if (!selectedBaseId || !publicPlatsBase.some((p) => p.id === selectedBaseId)) {
      setSelectedBaseId(publicPlatsBase[0].id)
    }
  }, [publicPlatsBase, selectedBaseId])

  // Nettoyer les sélections si un accompagnement/supplément n'est plus actif
  useEffect(() => {
    const allowedAcc = new Set(publicPlatsAccompagnement.map((p) => p.id))
    setSelectedAccompaniments((prev) => {
      const next: typeof prev = {}
      for (const [id, v] of Object.entries(prev)) {
        if (!allowedAcc.has(id)) continue
        next[id] = v
      }
      return next
    })
  }, [publicPlatsAccompagnement])

  useEffect(() => {
    const allowedSup = new Set(publicPlatsSupplements.map((p) => p.id))
    setSelectedSupplements((prev) => {
      const next: typeof prev = {}
      for (const [id, v] of Object.entries(prev)) {
        if (!allowedSup.has(id)) continue
        next[id] = v
      }
      return next
    })
  }, [publicPlatsSupplements])

  const selectedBase = publicPlatsBase.find((p) => p.id === selectedBaseId) || publicPlatsBase[0]
  const selectedVariationTaille = selectedBaseSizes[selectedBaseId] || "moyen"
  const selectedBaseVariation = selectedBase?.variations?.find(
    (v) => v.taille === selectedVariationTaille
  )

  // Calculate prices
  const basePrice = selectedBaseVariation?.prix || 0

  const accompanimentsPrice = Object.entries(selectedAccompaniments)
    .filter(([, value]) => value.selected)
    .reduce((sum, [id, value]) => {
      const plat = publicPlatsAccompagnement.find((p) => p.id === id)
      const variation = plat?.variations?.find((v) => v.taille === value.taille)
      return sum + (variation?.prix || 0)
    }, 0)

  const supplementsPrice = Object.entries(selectedSupplements)
    .filter(([, value]) => value.selected)
    .reduce((sum, [id, value]) => {
      const plat = publicPlatsSupplements.find((p) => p.id === id)
      const variation = plat?.variations?.find((v) => v.taille === value.taille)
      return sum + (variation?.prix || 0)
    }, 0)

  const subtotal = (basePrice + accompanimentsPrice + supplementsPrice) * quantity
  const tva = subtotal * 0.16
  const total = subtotal + tva

  const toggleAccompaniment = (id: string) => {
    setSelectedAccompaniments((prev) => ({
      ...prev,
      [id]: prev[id]?.selected ? { ...prev[id], selected: false } : { selected: true, taille: "moyen" },
    }))
  }

  const updateAccompanimentTaille = (id: string, taille: string) => {
    setSelectedAccompaniments((prev) => ({
      ...prev,
      [id]: { ...prev[id], taille },
    }))
  }

  const toggleSupplement = (id: string) => {
    setSelectedSupplements((prev) => ({
      ...prev,
      [id]: prev[id]?.selected ? { ...prev[id], selected: false } : { selected: true, taille: "moyen" },
    }))
  }

  const updateSupplementTaille = (id: string, taille: string) => {
    setSelectedSupplements((prev) => ({
      ...prev,
      [id]: { ...prev[id], taille },
    }))
  }

  const handleAddToCart = () => {
    if (!isAuthenticated || !selectedBase || !selectedBaseVariation) return

    // Build accompaniments array
    const accompagnementsArray = Object.entries(selectedAccompaniments)
      .filter(([, value]) => value.selected)
      .map(([id, value]) => {
        const plat = publicPlatsAccompagnement.find((p) => p.id === id)!
        const variation = plat.variations?.find((v) => v.taille === value.taille)!
        return { plat, variation, quantite: 1 }
      })

    const supplementsArray = Object.entries(selectedSupplements)
      .filter(([, value]) => value.selected)
      .map(([id, value]) => {
        const plat = publicPlatsSupplements.find((p) => p.id === id)!
        const variation = plat.variations?.find((v) => v.taille === value.taille)!
        return { plat, variation, quantite: 1 }
      })

    const personnalisation = {
      base: { plat: selectedBase, variation: selectedBaseVariation },
      accompagnements: accompagnementsArray,
      supplements: supplementsArray,
    }

    addCustomItem(personnalisation, quantity)
    setAdded(true)

    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-t from-background via-accent/20 to-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="text-center mb-12 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance">
              Personnalise ton repas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Crée le plat parfait selon tes envies et tes goûts
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Selection Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Base */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="space-y-2 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary text-sm font-bold">
                      1
                    </span>
                    <div>
                      <CardTitle className="text-2xl">Choisir la base</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sélectionne l&apos;élément principal de ton plat
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicPlatsBase.map((base) => {
                      const isSelected = selectedBaseId === base.id
                      const currentSize = selectedBaseSizes[base.id] || "moyen"

                      return (
                        <div
                          key={base.id}
                          className={`group overflow-hidden border-2 rounded-lg transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                        >
                          <div className="relative h-40">
                            <Image
                              src={base.image || "/placeholder.svg"}
                              alt={base.nom}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute top-3 left-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {
                                  setSelectedBaseId(base.id)
                                  if (!selectedBaseSizes[base.id]) {
                                    setSelectedBaseSizes((prev) => ({ ...prev, [base.id]: "moyen" }))
                                  }
                                }}
                                className="bg-background/90 backdrop-blur-sm border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <h4 className="font-bold text-white text-base">{base.nom}</h4>
                            </div>
                          </div>
                          <div className="p-4 bg-card">
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {base.variations?.map((v) => (
                                <div key={v.id} className="text-center p-2 bg-secondary/50 border border-border rounded">
                                  <div className="text-xs text-muted-foreground capitalize mb-1">{v.taille}</div>
                                  <div className="text-sm font-bold text-primary">{v.prix.toFixed(0)}f</div>
                                </div>
                              ))}
                            </div>

                            {isSelected && (
                              <Select
                                value={currentSize}
                                onValueChange={(val) => {
                                  setSelectedBaseSizes((prev) => ({ ...prev, [base.id]: val }))
                                }}
                              >
                                <SelectTrigger className="w-full border-2 font-medium">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {base.variations?.map((v) => (
                                    <SelectItem key={v.id} value={v.taille} className="font-medium">
                                      {v.taille.charAt(0).toUpperCase() + v.taille.slice(1)} - {v.prix.toFixed(0)}f
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-6 p-5 bg-linear-to-t from-primary/5 to-primary/10 border-l-4 border-primary rounded-r-lg">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-muted-foreground block mb-1">Base sélectionnée</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">{selectedBase?.nom}</span>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded font-medium capitalize">
                          {selectedVariationTaille}
                        </span>
                      </div>
                    </div>
                    <span className="text-primary font-bold text-2xl">{basePrice.toFixed(0)}f</span>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2: Accompaniments */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="space-y-2 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary text-sm font-bold">
                      2
                    </span>
                    <div>
                      <CardTitle className="text-2xl">Accompagnements</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ajoute un ou plusieurs accompagnements selon ton goût
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicPlatsAccompagnement.map((item) => {
                      const isSelected = selectedAccompaniments[item.id]?.selected
                      const selectedTaille = selectedAccompaniments[item.id]?.taille || "moyen"

                      return (
                        <div
                          key={item.id}
                          className={`group overflow-hidden border-2 rounded-lg transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                        >
                          <div className="relative h-36">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.nom}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute top-3 left-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleAccompaniment(item.id)}
                                className="bg-background/90 backdrop-blur-sm border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <h4 className="font-bold text-white text-base">{item.nom}</h4>
                            </div>
                          </div>
                          <div className="p-4 bg-card">
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {item.variations?.map((v) => (
                                <div key={v.id} className="text-center p-2 bg-secondary/50 border border-border rounded">
                                  <div className="text-xs text-muted-foreground capitalize mb-1">{v.taille}</div>
                                  <div className="text-sm font-bold text-primary">{v.prix.toFixed(0)}f</div>
                                </div>
                              ))}
                            </div>

                            {isSelected && (
                              <Select
                                value={selectedTaille}
                                onValueChange={(val) => updateAccompanimentTaille(item.id, val)}
                              >
                                <SelectTrigger className="w-full border-2 font-medium">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.variations?.map((v) => (
                                    <SelectItem key={v.id} value={v.taille} className="font-medium">
                                      {v.taille.charAt(0).toUpperCase() + v.taille.slice(1)} - {v.prix.toFixed(0)}f
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Section 3: Supplements */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="space-y-2 pb-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-primary/10 text-primary text-sm font-bold">
                      3
                    </span>
                    <div>
                      <CardTitle className="text-2xl">Suppléments</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ajoute un extra pour rendre ton plat meilleur
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {publicPlatsSupplements.map((item) => {
                      const isSelected = selectedSupplements[item.id]?.selected
                      const selectedTaille = selectedSupplements[item.id]?.taille || "moyen"

                      return (
                        <div
                          key={item.id}
                          className={`group overflow-hidden border-2 rounded-lg transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                        >
                          <div className="relative h-32">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.nom}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute top-2 left-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSupplement(item.id)}
                                className="bg-background/90 backdrop-blur-sm border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                              <h4 className="font-bold text-white text-sm">{item.nom}</h4>
                            </div>
                          </div>
                          <div className="p-3 bg-card">
                            <div className="grid grid-cols-3 gap-1 mb-3">
                              {item.variations?.map((v) => (
                                <div key={v.id} className="text-center p-1.5 bg-secondary/50 border border-border rounded">
                                  <div className="text-[10px] text-muted-foreground capitalize">{v.taille}</div>
                                  <div className="text-xs font-bold text-primary">{v.prix.toFixed(0)}f</div>
                                </div>
                              ))}
                            </div>

                            {isSelected && (
                              <Select
                                value={selectedTaille}
                                onValueChange={(val) => updateSupplementTaille(item.id, val)}
                              >
                                <SelectTrigger className="w-full text-sm border-2 font-medium">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.variations?.map((v) => (
                                    <SelectItem key={v.id} value={v.taille} className="font-medium">
                                      {v.taille.charAt(0).toUpperCase() + v.taille.slice(1)} - {v.prix.toFixed(0)}f
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recap Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-2 shadow-xl">
                <CardHeader className="bg-linear-to-br from-primary/10 to-primary/5 border-b-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="relative overflow-hidden shadow-md rounded-lg">
                    <Image
                      src={selectedBase?.image || "/placeholder.svg"}
                      alt={selectedBase?.nom || "Plat"}
                      width={300}
                      height={200}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
                  </div>

                  <div className="space-y-4">
                    <div className="pb-3 border-b-2">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Base</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{selectedBase?.nom}</span>
                          <span className="text-xs text-muted-foreground ml-2 capitalize">
                            ({selectedVariationTaille})
                          </span>
                        </div>
                        <span className="text-primary font-bold">{basePrice.toFixed(0)}f</span>
                      </div>
                    </div>

                    {Object.entries(selectedAccompaniments).filter(([, v]) => v.selected).length > 0 && (
                      <div className="pb-3 border-b">
                        <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Accompagnements</p>
                        <div className="space-y-2">
                          {Object.entries(selectedAccompaniments)
                            .filter(([, v]) => v.selected)
                            .map(([id, value]) => {
                              const plat = publicPlatsAccompagnement.find((p) => p.id === id)
                              const variation = plat?.variations?.find((v) => v.taille === value.taille)
                              return (
                                <div key={id} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {plat?.nom} ({value.taille})
                                  </span>
                                  <span className="font-semibold">{variation?.prix.toFixed(0)}f</span>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    {Object.entries(selectedSupplements).filter(([, v]) => v.selected).length > 0 && (
                      <div className="pb-3 border-b">
                        <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Suppléments</p>
                        <div className="space-y-2">
                          {Object.entries(selectedSupplements)
                            .filter(([, v]) => v.selected)
                            .map(([id, value]) => {
                              const plat = publicPlatsSupplements.find((p) => p.id === id)
                              const variation = plat?.variations?.find((v) => v.taille === value.taille)
                              return (
                                <div key={id} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {plat?.nom} ({value.taille})
                                  </span>
                                  <span className="font-semibold">{variation?.prix.toFixed(0)}f</span>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sous-total</span>
                        <span className="font-semibold">{subtotal.toFixed(0)}f</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TVA (16%)</span>
                        <span className="font-semibold">{tva.toFixed(0)}f</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t-2 border-primary/20">
                        <span className="font-bold text-lg">Total</span>
                        <span className="text-primary font-bold text-2xl">{total.toFixed(0)}f</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/50 border border-border rounded-lg">
                      <span className="font-medium">Quantité</span>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-9 w-9 border-2"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-bold min-w-8 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-9 w-9 border-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {isAuthenticated ? (
                      <Button
                        onClick={handleAddToCart}
                        className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={added}
                      >
                        {added ? (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Ajouté au panier
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Ajouter au panier
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button asChild className="w-full h-12 text-base font-bold shadow-lg">
                        <Link href="/connexion">Connexion requise</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
