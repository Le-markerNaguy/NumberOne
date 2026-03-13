"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle } from "lucide-react"
import { SUJETS_CONTACT, INFO_RESTAURANT } from "@/lib/data"

const contactInfo = [
  {
    icon: MapPin,
    label: "Adresse",
    value: INFO_RESTAURANT.adresse,
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: INFO_RESTAURANT.telephone,
  },
  {
    icon: Mail,
    label: "Email",
    value: INFO_RESTAURANT.email,
  },
  {
    icon: Clock,
    label: "Horaires",
    value: `Lun-Ven: ${INFO_RESTAURANT.horaires.semaine} | Sam-Dim: ${INFO_RESTAURANT.horaires.weekend}`,
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Erreur lors de l'envoi du message")
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (err) {
      console.error(err)
      setError("Erreur lors de l'envoi du message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Contactez-nous
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Une question, une réservation ou simplement envie de nous dire
              bonjour ? Nous sommes là pour vous
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left Column - Contact Form */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Envoyez-nous un message
              </h2>

              {isSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Message envoyé !
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button onClick={() => setIsSuccess(false)} variant="outline">
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="+243 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subject: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUJETS_CONTACT.map((sujet) => (
                          <SelectItem key={sujet} value={sujet}>
                            {sujet}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Votre message..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le message"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Right Column - Contact Info */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border h-fit">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Nos coordonnées
              </h2>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {info.label}
                      </p>
                      <p className="font-medium text-foreground">
                        {info.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full max-w-6xl mx-auto px-4 mt-12">
            <div className="relative w-full h-[280px] md:h-[380px] lg:h-[400px] overflow-hidden rounded-lg shadow-lg bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" />
                <p>Carte du restaurant</p>
                <p className="text-sm">123 Rue de la Gastronomie, Libreville</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
