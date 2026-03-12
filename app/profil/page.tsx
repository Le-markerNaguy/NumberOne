"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { User, Phone, Mail, Calendar, Edit2, Save, X, Shield, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilPage() {
  const { isAuthenticated, client, updateProfile, isLoading, commandeEnCours } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom_complet: "",
    telephone: "",
    email: "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/connexion")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (client) {
      setFormData({
        nom_complet: client.nom_complet,
        telephone: client.telephone,
        email: client.email || "",
      })
    }
  }, [client])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    const result = await updateProfile(formData)

    if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès" })
      setIsEditing(false)
    } else {
      setMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour" })
    }

    setSaving(false)
  }

  if (isLoading || !client) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Informations personnelles */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informations personnelles
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            nom_complet: client.nom_complet,
                            telephone: client.telephone,
                            email: client.email || "",
                          })
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                      <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {message && (
                    <div
                      className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom_complet" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Nom complet
                      </Label>
                      {isEditing ? (
                        <Input
                          id="nom_complet"
                          value={formData.nom_complet}
                          onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-lg font-medium">{client.nom_complet}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Numéro de téléphone
                      </Label>
                      {isEditing ? (
                        <Input
                          id="telephone"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-lg font-medium">{client.telephone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        Email (optionnel)
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="votre@email.com"
                          className="w-full"
                        />
                      ) : (
                        <p className="text-lg font-medium">{client.email || "Non renseigné"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Membre depuis
                      </Label>
                      <p className="text-lg font-medium">
                        {new Date(client.date_inscription).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">Changer le mot de passe</Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Commande en cours */}
              {commandeEnCours && (
                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Commande en cours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Commande #{commandeEnCours.id}</p>
                    <p className="font-medium capitalize mb-4">{commandeEnCours.statut_commande.replace("_", " ")}</p>
                    <Link href={`/suivi?id=${commandeEnCours.id}`}>
                      <Button className="w-full bg-primary text-primary-foreground" size="sm">
                        Suivre ma commande
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Raccourcis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raccourcis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/menu" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <MapPin className="w-4 h-4 mr-2" />
                      Voir le menu
                    </Button>
                  </Link>
                  <Link href="/panier" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="w-4 h-4 mr-2" />
                      Mon panier
                    </Button>
                  </Link>
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
