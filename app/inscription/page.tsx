"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Check, X, ShoppingCart, Gift, MapPin, Users, Star, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function InscriptionPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true)

  const { register, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/menu")
    }
  }, [isAuthenticated, router])

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }

  const allPasswordChecks = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }))
    if (value === "") {
      setIsEmailValid(true)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setIsEmailValid(emailRegex.test(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!allPasswordChecks) {
      setError("Le mot de passe ne respecte pas les critères requis")
      return
    }

    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (formData.email && !isEmailValid) {
      setError("Email invalide")
      return
    }

    setSubmitting(true)

    try {
      const result = await register({
        nom_complet: formData.name,
        telephone: formData.phone,
        email: formData.email || undefined,
        mot_de_passe: formData.password,
      })

      if (!result.success) {
        setError(result.error || "Erreur lors de l'inscription")
        setSubmitting(false)
        return
      }

      router.push("/menu")
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la requête d'inscription")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline text-sm">
            &larr; Retour à l&apos;accueil
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Registration Form */}
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
            <p className="text-muted-foreground mb-8">
              Rejoignez CUBE et profitez d&apos;une expérience culinaire unique
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="XXX XXX XXX"
                  className="w-full"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Entrez votre nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full"
                  aria-invalid={!isEmailValid}
                  aria-describedby="email-help"
                />
                {formData.email ? (
                  !isEmailValid ? (
                    <p id="email-help" className="text-sm text-red-600">Email invalide</p>
                  ) : (
                    <p id="email-help" className="text-sm text-muted-foreground">Email optionnel, utilisé pour retrouver votre compte</p>
                  )
                ) : (
                  <p id="email-help" className="text-sm text-muted-foreground">Email optionnel, utilisé pour retrouver votre compte</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium mb-2">Votre mot de passe doit contenir :</p>
                  <ul className="space-y-1 text-sm">
                    <li
                      className={`flex items-center gap-2 ${passwordChecks.length ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {passwordChecks.length ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      Au moins 8 caractères
                    </li>
                    <li
                      className={`flex items-center gap-2 ${passwordChecks.uppercase ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {passwordChecks.uppercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      Une lettre majuscule
                    </li>
                    <li
                      className={`flex items-center gap-2 ${passwordChecks.number ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      {passwordChecks.number ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      Un chiffre
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal">
                  J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 sm:py-6"
                disabled={!acceptTerms || submitting || isLoading || !allPasswordChecks || !passwordsMatch || (!!formData.email && !isEmailValid)}
              >
                {submitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </form>

            <p className="text-center mt-6 text-muted-foreground">
              Déjà inscrit ?{" "}
              <Link href="/connexion" className="text-primary hover:underline font-medium">
                Connexion
              </Link>
            </p>
          </div>

          {/* Right Side - Benefits */}
          <div className="bg-secondary rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl font-bold mb-2">Pourquoi rejoindre CUBE ?</h2>
            <p className="text-muted-foreground mb-8">Découvrez tous les avantages de votre compte</p>

            <div className="space-y-6 mb-12">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Commandes rapides</h3>
                  <p className="text-sm text-muted-foreground">Enregistrez vos adresses et commandez en un clic</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Offres exclusives</h3>
                  <p className="text-sm text-muted-foreground">Accédez à des promotions réservées aux membres</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Suivi en temps réel</h3>
                  <p className="text-sm text-muted-foreground">
                    Suivez votre commande de la préparation à la livraison
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">5000+</p>
                <p className="text-xs text-muted-foreground">Clients actifs</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">4.8</p>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">30min</p>
                <p className="text-xs text-muted-foreground">Livraison rapide</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
