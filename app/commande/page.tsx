"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { VILLES_GABON, QUARTIERS_LIBREVILLE, MODES_PAIEMENT } from "@/lib/data"
import { paymentService } from "@/lib/payment-service"
import { commandesApi } from "@/lib/api"
import type { Paiement } from "@/lib/types"

export default function CommandePage() {
  const router = useRouter()
  const { items, sousTotal, fraisLivraison, total, clearCart, commandeMinimum } = useCart()
  const { isAuthenticated, client, isLoading: authLoading } = useAuth()

  const [selectedPayment, setSelectedPayment] = useState<string>("airtel_money")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [cashAmount, setCashAmount] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    quartier: "",
    instructions: "",
  })

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push("/connexion?redirect=/commande")
      } else if (items.length === 0 && !orderComplete) {
        router.push("/panier")
      }
    }
  }, [isAuthenticated, authLoading, items.length, router, orderComplete])

  useEffect(() => {
    if (client) {
      setFormData((prev) => ({
        ...prev,
        name: client.nom_complet,
        phone: client.telephone,
      }))
    }
  }, [client])

  const getItemDetails = (item: (typeof items)[0]) => {
    if (item.type === "simple" && item.plat) {
      return {
        name: item.plat.nom,
        description: item.variation ? `Taille: ${item.variation.taille}` : "",
        image: item.plat.image || "/placeholder.svg",
      }
    }

    if (item.type === "personnalise" && item.personnalisation) {
      const base = item.personnalisation.base
      const accNames = item.personnalisation.accompagnements.map((a) => a.plat.nom)
      const supNames = item.personnalisation.supplements.map((s) => s.plat.nom)

      return {
        name: base.plat.nom,
        description: [...accNames, ...supNames].join(" + ") || "Personnalisé",
        image: base.plat.image || "/placeholder.svg",
      }
    }

    return { name: "Plat", description: "", image: "/placeholder.svg" }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)
    setError("")

    // Validation pour paiement à la livraison
    if (selectedPayment === "livraison") {
      if (!cashAmount) {
        setError("Veuillez indiquer le montant en espèces que vous aurez à la livraison")
        setIsSubmitting(false)
        return
      }
      const cashNum = Number(cashAmount)
      if (Number.isNaN(cashNum) || cashNum <= 0) {
        setError("Le montant en espèces doit être un nombre valide supérieur à 0")
        setIsSubmitting(false)
        return
      }
      if (cashNum < total) {
        setError("Le montant en espèces est inférieur au total de la commande")
        setIsSubmitting(false)
        return
      }
    }

    // Validation commande minimum
    if (commandeMinimum > 0 && sousTotal < commandeMinimum) {
      setError(`Le montant minimum de commande est de ${commandeMinimum.toFixed(0)}f`)
      setIsSubmitting(false)
      return
    }

    try {
      if (!client) {
        setError("Vous devez être connecté pour passer une commande")
        setIsSubmitting(false)
        return
      }

      // Construire les lignes de commande à partir du panier
      const lignes: any[] = []

      items.forEach((item) => {
        if (item.type === "simple" && item.plat) {
          const variation = item.variation || {
            id: `var-${item.plat.id}-default`,
            id_plat: item.plat.id,
            taille: "petit",
            prix: item.plat.prix_base,
          }
          lignes.push({
            id: item.id,
            id_plat: item.plat.id,
            nom_plat: item.plat.nom,
            image_plat: item.plat.image || "/placeholder.svg",
            quantite: item.quantite,
            prix_unitaire: item.prixUnitaire,
            prix_total: item.prixTotal,
            taille: variation.taille,
          })
        } else if (item.type === "personnalise" && item.personnalisation) {
          const baseVar = item.personnalisation.base.variation
          const basePrix = baseVar.prix

          // Base
          lignes.push({
            id: `${item.id}-base`,
            id_plat: item.personnalisation.base.plat.id,
            nom_plat: item.personnalisation.base.plat.nom,
            image_plat: item.personnalisation.base.plat.image || "/placeholder.svg",
            quantite: item.quantite,
            prix_unitaire: basePrix,
            prix_total: basePrix * item.quantite,
            taille: baseVar.taille,
            type_element: "base",
          })

          // Accompagnements
          item.personnalisation.accompagnements.forEach((acc, index) => {
            const q = item.quantite * acc.quantite
            lignes.push({
              id: `${item.id}-acc-${index}`,
              id_plat: acc.plat.id,
              nom_plat: acc.plat.nom,
              image_plat: acc.plat.image || "/placeholder.svg",
              quantite: q,
              prix_unitaire: acc.variation.prix,
              prix_total: acc.variation.prix * q,
              taille: acc.variation.taille,
              type_element: "accompagnement",
            })
          })

          // Suppléments
          item.personnalisation.supplements.forEach((sup, index) => {
            const q = item.quantite * sup.quantite
            lignes.push({
              id: `${item.id}-sup-${index}`,
              id_plat: sup.plat.id,
              nom_plat: sup.plat.nom,
              image_plat: sup.plat.image || "/placeholder.svg",
              quantite: q,
              prix_unitaire: sup.variation.prix,
              prix_total: sup.variation.prix * q,
              taille: sup.variation.taille,
              type_element: "supplement",
            })
          })
        }
      })

      // Handle payment based on method
      let paiement: Paiement

      if (selectedPayment === "livraison") {
        paiement = {
          id: `pay-${Date.now()}`,
          mode: "livraison",
          montant: total,
          statut: "en_attente",
          montant_en_especes: Number(cashAmount),
        }
      } else {
        // For mobile money payments, create order first, then process payment
        const tempPaiement: Paiement = {
          id: `pay-${Date.now()}`,
          mode: selectedPayment as "airtel_money" | "moov_money",
          montant: total,
          statut: "en_attente",
        }

        // Create order with pending payment
        const orderRes = await commandesApi.create({
          client,
          lignes,
          sous_total: sousTotal,
          frais_livraison: fraisLivraison,
          tva: 0,
          total,
          adresse_livraison: formData.address,
          commune: formData.quartier || "",
          ville: formData.city || "Libreville",
          instructions: formData.instructions,
          paiement: tempPaiement,
        })

        if (!orderRes.success || !orderRes.data) {
          setError(orderRes.error || "Impossible de créer la commande. Veuillez réessayer.")
          setIsSubmitting(false)
          return
        }

        // Process mobile money payment
        const paymentResult = await paymentService.processPayment(
          selectedPayment as "airtel_money" | "moov_money",
          {
            amount: total,
            phoneNumber: client.telephone,
            orderId: orderRes.data.id,
            description: `Commande ${orderRes.data.id}`,
          }
        )

        if (!paymentResult.success) {
          // Payment failed, but order is created - user can retry payment later
          setError(`Commande créée mais paiement échoué: ${paymentResult.error}. Vous pouvez réessayer le paiement.`)
          setCreatedOrderId(orderRes.data.id)
          setIsSubmitting(false)
          clearCart()
          setOrderComplete(true)
          return
        }

        // Update payment with transaction details
        paiement = {
          ...tempPaiement,
          transaction_id: paymentResult.transactionId,
          statut: "en_cours",
        } as Paiement

        // Update order with payment transaction details
        await commandesApi.update(orderRes.data.id, {
          paiement,
        })
      }

      // For cash on delivery, create order directly
      if (selectedPayment === "livraison") {
        const res = await commandesApi.create({
          client,
          lignes,
          sous_total: sousTotal,
          frais_livraison: fraisLivraison,
          tva: 0,
          total,
          adresse_livraison: formData.address,
          commune: formData.quartier || "",
          ville: formData.city || "Libreville",
          instructions: formData.instructions,
          paiement: paiement,
        })

        if (!res.success || !res.data) {
          setError(res.error || "Impossible de créer la commande. Veuillez réessayer.")
          setIsSubmitting(false)
          return
        }

        setCreatedOrderId(res.data.id)
      }

      setIsSubmitting(false)
      clearCart()
      setOrderComplete(true)
    } catch (e) {
      console.error("Erreur lors de la création de la commande:", e)
      setError("Une erreur est survenue lors de la création de la commande.")
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center px-4 max-w-md">
            <h1 className="text-3xl font-bold mb-4">Commande confirmée</h1>
            {createdOrderId && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <Button
                  onClick={() => router.push(`/suivi?id=${createdOrderId}`)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Suivi de commande
                </Button>
                <Button variant="outline" onClick={() => router.push("/")}>
                  Retour à l&apos;accueil
                </Button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Finaliser votre commande</h1>
            <p className="text-muted-foreground">Complétez vos informations pour recevoir votre commande</p>
          </div>

          {error && (
            <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Form */}
            <div className="space-y-8">
              {/* Delivery Information */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Informations de livraison</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      placeholder="Entrez votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      placeholder="+243 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="address">Adresse de livraison *</Label>
                  <Input
                    id="address"
                    placeholder="Numéro, rue, quartier"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Ville et quartier (Gabon) - optionnels */}
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville (optionnel)</Label>
                    <select
                      id="city"
                      className="w-full border rounded-lg px-3 py-2 bg-background"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="">Sélectionner une ville</option>
                      {VILLES_GABON.map((ville) => (
                        <option key={ville.id} value={ville.nom}>
                          {ville.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quartier">Quartier (optionnel)</Label>
                    <select
                      id="quartier"
                      className="w-full border rounded-lg px-3 py-2 bg-background"
                      value={formData.quartier}
                      onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                    >
                      <option value="">Sélectionner un quartier</option>
                      {QUARTIERS_LIBREVILLE.map((q) => (
                        <option key={q.id} value={q.nom}>
                          {q.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="instructions">Instructions de livraison (optionnel)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Précisions supplémentaires..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Mode de paiement</h2>

                <div className="space-y-3">
                  {MODES_PAIEMENT.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        selectedPayment === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.id ? "border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {selectedPayment === method.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{method.nom}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {selectedPayment === "livraison" && (
                  <div className="mt-4">
                    <Label htmlFor="cash">Montant en espèces que vous aurez à la livraison *</Label>
                    <Input
                      id="cash"
                      type="number"
                      min={0}
                      placeholder="Entrez le montant exact en f"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Montant total: <span className="font-medium">{total.toFixed(0)}f</span>.{" "}
                      {cashAmount && Number(cashAmount) >= total
                        ? `Monnaie à préparer: ${(Number(cashAmount) - total).toFixed(0)}f`
                        : cashAmount
                          ? "Le montant indiqué est inférieur au total"
                          : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Récapitulatif de commande</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const details = getItemDetails(item)
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <Image
                          src={details.image || "/placeholder.svg"}
                          alt={details.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{details.name}</h3>
                          <p className="text-sm text-muted-foreground">{details.description}</p>
                          <p className="text-sm text-muted-foreground">Quantité: {item.quantite}</p>
                        </div>
                        <span className="font-semibold text-primary">{item.prixTotal.toFixed(0)}f</span>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>{sousTotal.toFixed(0)}f</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frais de livraison</span>
                    <span>{fraisLivraison.toFixed(0)}f</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{total.toFixed(0)}f</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg rounded-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    "Passer la commande"
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600">
                  <Shield className="w-4 h-4" />
                  <span>Paiement 100% sécurisé et crypté</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
