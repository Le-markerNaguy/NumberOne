"use client"

import { useEffect, useState } from "react"
import { Search, ChevronLeft, ChevronRight, Eye, X, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { clientsApi, commandesApi } from "@/lib/api"
import type { Client, Commande } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function AdminClients() {
  const [clients, setClients] = useState<(Client & { commandes_count?: number; total_depense?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<(Client & { commandes_count?: number; total_depense?: number }) | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const clientsPerPage = 10
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const [clientsRes, commandesRes] = await Promise.all([
          clientsApi.getAll(),
          commandesApi.getAll(),
        ])

        if (!mounted) return

        if (!clientsRes.success) {
          toast({ title: "Erreur", description: clientsRes.error || "Impossible de charger les clients" })
        }
        if (!commandesRes.success) {
          toast({ title: "Erreur", description: commandesRes.error || "Impossible de charger les commandes" })
        }

        const rawClients = (clientsRes.success && clientsRes.data ? clientsRes.data : []) as Client[]
        const commandes = (commandesRes.success && commandesRes.data ? commandesRes.data : []) as Commande[]

        const commandesByClient: Record<string, { count: number; total: number }> = {}
        for (const cmd of commandes) {
          const clientId = cmd.client?.id
          if (!clientId) continue
          if (!commandesByClient[clientId]) {
            commandesByClient[clientId] = { count: 0, total: 0 }
          }
          commandesByClient[clientId].count += 1
          commandesByClient[clientId].total += cmd.total || 0
        }

        const enriched = rawClients.map((c) => ({
          ...c,
          commandes_count: commandesByClient[c.id]?.count || 0,
          total_depense: commandesByClient[c.id]?.total || 0,
        }))

        setClients(enriched)
      } catch (e) {
        console.error("Erreur chargement clients:", e)
        toast({ title: "Erreur", description: "Erreur lors du chargement des clients" })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nom_complet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.telephone.includes(searchQuery) ||
      (client.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredClients.length / clientsPerPage)
  const paginatedClients = filteredClients.slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)

  const stats = [
    { label: "Total clients", value: clients.length },
    { label: "Clients actifs", value: clients.filter(c => (c.commandes_count || 0) > 0).length },
    { label: "Total commandes", value: clients.reduce((s, c) => s + (c.commandes_count || 0), 0) },
    { label: "Dépenses totales", value: `${clients.reduce((s, c) => s + (c.total_depense || 0), 0).toLocaleString()}f` },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des clients</h1>
          <p className="text-gray-500">Consultez et gerez tous vos clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-4 lg:p-6">
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, telephone ou email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun client trouvé. Si tu as des clients dans Supabase, vérifie les policies RLS sur `clients` (SELECT).
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
                  <th className="p-4 font-medium">Nom</th>
                  <th className="p-4 font-medium hidden md:table-cell">Contact</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Inscription</th>
                  <th className="p-4 font-medium">Commandes</th>
                  <th className="p-4 font-medium hidden lg:table-cell">Total depense</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map((client) => (
                  <tr key={client.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{client.nom_complet}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-gray-900">{client.telephone}</p>
                      {client.email && <p className="text-gray-500 text-sm">{client.email}</p>}
                    </td>
                    <td className="p-4 hidden sm:table-cell text-gray-600">
                      {new Date(client.date_inscription).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {client.commandes_count}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell font-semibold text-gray-900">
                      {(client.total_depense ?? 0).toLocaleString()} f
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <p className="text-gray-500 text-sm">
              Affichage {(currentPage - 1) * clientsPerPage + 1}-
              {Math.min(currentPage * clientsPerPage, filteredClients.length)} sur {filteredClients.length} clients
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className={`w-8 h-8 ${currentPage === page ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-transparent"}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 bg-transparent"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Details du client</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">
                    {selectedClient.nom_complet.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedClient.nom_complet}</h3>
                  <p className="text-gray-500">Client depuis {new Date(selectedClient.date_inscription).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <span>{selectedClient.telephone}</span>
                </div>
                {selectedClient.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <span>{selectedClient.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Inscrit le {new Date(selectedClient.date_inscription).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-orange-500">{selectedClient.commandes_count}</p>
                  <p className="text-gray-500 text-sm">Commandes</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-500">{(selectedClient.total_depense ?? 0).toLocaleString()} f</p>
                  <p className="text-gray-500 text-sm">Total depense</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
