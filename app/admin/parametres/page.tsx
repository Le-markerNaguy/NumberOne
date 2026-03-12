"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Truck, Save } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function AdminParametres() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    frais_livraison_defaut: 2000,
    tva_pourcentage: 16,
    commande_minimum: 3000,
    livraison_gratuite_seuil: 25000,
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "default")
        .maybeSingle()

      if (!mounted) return

      if (error) {
        console.error("Erreur chargement settings:", error)
        return
      }

      if (data) {
        setSettings({
          frais_livraison_defaut: data.frais_livraison_defaut ?? 2000,
          tva_pourcentage: data.tva_pourcentage ?? 16,
          commande_minimum: data.commande_minimum ?? 3000,
          livraison_gratuite_seuil: data.livraison_gratuite_seuil ?? 25000,
        })
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          id: "default",
          frais_livraison_defaut: settings.frais_livraison_defaut,
          tva_pourcentage: settings.tva_pourcentage,
          commande_minimum: settings.commande_minimum,
          livraison_gratuite_seuil: settings.livraison_gratuite_seuil,
        },
        { onConflict: "id" },
      )

    if (error) {
      console.error("Erreur sauvegarde settings:", error)
      setSaving(false)
      toast({ title: "Erreur", description: "Impossible d'enregistrer les paramètres" })
      return
    }

    setSaving(false)
    toast({ title: "Succes", description: "Parametres enregistres avec succes" })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Parametres</h1>
          <p className="text-gray-500">Configurez les parametres de votre restaurant</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></span>
              Enregistrement...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Tarification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <CardTitle>Tarification</CardTitle>
            </div>
            <CardDescription>Configurer les frais et taxes</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tva">TVA (%)</Label>
                <Input
                  id="tva"
                  type="number"
                  value={settings.tva_pourcentage}
                  onChange={(e) => setSettings({ ...settings, tva_pourcentage: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commande_min">Commande minimum (f)</Label>
                <Input
                  id="commande_min"
                  type="number"
                  value={settings.commande_minimum}
                  onChange={(e) => setSettings({ ...settings, commande_minimum: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              <CardTitle>Livraison</CardTitle>
            </div>
            <CardDescription>Parametres de livraison</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frais_livraison">Frais de livraison par defaut (f)</Label>
                <Input
                  id="frais_livraison"
                  type="number"
                  value={settings.frais_livraison_defaut}
                  onChange={(e) => setSettings({ ...settings, frais_livraison_defaut: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="livraison_gratuite">Seuil livraison gratuite (f)</Label>
                <Input
                  id="livraison_gratuite"
                  type="number"
                  value={settings.livraison_gratuite_seuil}
                  onChange={(e) => setSettings({ ...settings, livraison_gratuite_seuil: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
