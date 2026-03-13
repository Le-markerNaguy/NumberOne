"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { commandesApi, type CommandeResponse } from "@/lib/api"
import { OrderStatus } from "@/lib/types"
import Image from "next/image"
import { ADMIN_PERMISSIONS } from "@/lib/types"

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "En attente",
  [OrderStatus.CONFIRMED]: "Confirmee",
  [OrderStatus.PREPARING]: "En preparation",
  [OrderStatus.READY]: "Pret",
  [OrderStatus.DELIVERING]: "En livraison",
  [OrderStatus.DELIVERED]: "Livree",
  [OrderStatus.CANCELLED]: "Annulee",
}

function getStatusStyle(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-blue-100 text-blue-700"
    case OrderStatus.CONFIRMED:
      return "bg-cyan-100 text-cyan-700"
    case OrderStatus.PREPARING:
      return "bg-orange-100 text-orange-700"
    case OrderStatus.READY:
      return "bg-yellow-100 text-yellow-700"
    case OrderStatus.DELIVERING:
      return "bg-purple-100 text-purple-700"
    case OrderStatus.DELIVERED:
      return "bg-green-100 text-green-700"
    case OrderStatus.CANCELLED:
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getRowHighlight(status: OrderStatus) {
  return status === OrderStatus.PENDING ? "bg-orange-50 border-l-4 border-l-orange-500" : ""
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  return `Il y a ${Math.floor(hours / 24)}j`
}

export default function AdminCommandes() {
  const [orders, setOrders] = useState<CommandeResponse[]>([])
  const [activeFilter, setActiveFilter] = useState("Toutes")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<CommandeResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 6

  const orderStats = [
    {
      label: "Nouvelles",
      value: orders.filter((o) => o.statut_commande === OrderStatus.PENDING).length,
      highlight: "+3 depuis 1h",
      highlightColor: "text-orange-500",
    },
    { label: "En preparation", value: orders.filter((o) => o.statut_commande === OrderStatus.PREPARING).length },
    { label: "En livraison", value: orders.filter((o) => o.statut_commande === OrderStatus.DELIVERING).length },
    { label: "Livrees aujourd'hui", value: orders.filter((o) => o.statut_commande === OrderStatus.DELIVERED).length },
  ]

  const filters = [
    { label: "Toutes", count: orders.length },
    { label: "Nouvelles", count: orders.filter((o) => o.statut_commande === OrderStatus.PENDING).length },
    {
      label: "En cours",
      count: orders.filter((o) =>
        [
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
          OrderStatus.DELIVERING,
        ].includes(o.statut_commande as OrderStatus),
      ).length,
    },
    { label: "Livrees", count: orders.filter((o) => o.statut_commande === OrderStatus.DELIVERED).length },
  ]

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.client?.nom_complet || "").toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (activeFilter === "Nouvelles") matchesFilter = order.statut_commande === OrderStatus.PENDING
    else if (activeFilter === "En cours")
      matchesFilter = [
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERING,
      ].includes(order.statut_commande as OrderStatus)
    else if (activeFilter === "Livrees") matchesFilter = order.statut_commande === OrderStatus.DELIVERED

    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage)

  const { hasPermission } = useAuth()
  const { toast } = useToast()

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
   
     // Vérifier la permission applicative
  if (!hasPermission(ADMIN_PERMISSIONS.ORDERS_UPDATE)) {
    toast({ title: "Accès refusé", description: "Vous n'avez pas la permission de modifier les commandes." })
    return
  }

    try {

      const res = await commandesApi.updateStatus(orderId, newStatus as any)
      if (res.success && res.data) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, statut_commande: newStatus as any } : o)))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, statut_commande: newStatus as any } : null))
        }
        toast({ title: "Succes", description: "Statut mis a jour" })
      } else if (res.error) {
        toast({ title: "Erreur", description: res.error })
      }
    } catch (e) {
      console.error("Failed to update order status:", e)
    }
  }

  useEffect(() => {
    let mounted = true
    async function loadOrders() {
      try {
        const res = await commandesApi.getAll()
        if (mounted && res.success) {
          const data = res.data || []
          // Ne pas afficher les commandes livrées ou annulées dans la liste principale
          setOrders(
            data.filter(
              (o) =>
                o.statut_commande !== OrderStatus.DELIVERED &&
                o.statut_commande !== OrderStatus.CANCELLED,
            ),
          )
        }
      } catch (e) {
        console.error("Failed to load commandes:", e)
      }
    }
    loadOrders()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des commandes</h1>
          <p className="text-gray-500">Suivez et gerez toutes les commandes en temps reel</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          {orders.filter((o) => o.statut_commande === OrderStatus.PENDING).length} nouvelles
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {orderStats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-4 lg:p-6">
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl lg:text-4xl font-bold text-gray-900">{stat.value}</p>
              {stat.highlight && <p className={`text-sm mt-1 ${stat.highlightColor}`}>{stat.highlight}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par ID ou client..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              variant={activeFilter === filter.label ? "default" : "outline"}
              className={
                activeFilter === filter.label ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-gray-700"
              }
              onClick={() => {
                setActiveFilter(filter.label)
                setCurrentPage(1)
              }}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium hidden md:table-cell">Articles</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Heure</th>
                  <th className="p-4 font-medium">Etat</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className={`border-b last:border-0 ${getRowHighlight(order.statut_commande as OrderStatus)}`}>
                    <td className="p-4 text-orange-500 font-medium">#{order.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{order.client?.nom_complet}</p>
                      <p className="text-gray-500 text-sm">{order.client?.telephone}</p>
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell">
                      {order.lignes
                        .slice(0, 2)
                        .map((i) => `${i.quantite}x ${i.nom_plat || "Plat"}`)
                        .join(", ")}
                      {order.lignes.length > 2 && "..."}
                    </td>
                    <td className="p-4 font-semibold text-gray-900">{Number(order.total).toFixed(2)} f</td>
                    <td className="p-4 hidden sm:table-cell">
                      <p className="text-gray-900">{formatTimeAgo(new Date(order.date_commande))}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(order.date_commande).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="p-4">
                      <select
                        className={`px-2 py-1 rounded-full text-xs lg:text-sm border-0 cursor-pointer ${getStatusStyle(
                          order.statut_commande as OrderStatus,
                        )}`}
                        value={order.statut_commande}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <p className="text-gray-500 text-sm">
              Affichage {(currentPage - 1) * ordersPerPage + 1}-
              {Math.min(currentPage * ordersPerPage, filteredOrders.length)} sur {filteredOrders.length} commandes
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Commande #{selectedOrder.id.slice(0, 8)}</h2>
                <p className="text-gray-500">{new Date(selectedOrder.date_commande).toLocaleString("fr-FR")}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h3 className="font-semibold mb-2">Informations client</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p>
                    <span className="text-gray-500">Nom:</span> {selectedOrder.client?.nom_complet}
                  </p>
                  <p>
                    <span className="text-gray-500">Telephone:</span> {selectedOrder.client?.telephone}
                  </p>
                  <p>
                    <span className="text-gray-500">Adresse:</span> {selectedOrder.adresse_livraison}, {selectedOrder.commune}
                  </p>
                  {selectedOrder.instructions && (
                    <p>
                      <span className="text-gray-500">Instructions:</span> {selectedOrder.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Articles commandes</h3>
                {(() => {
                  const lignes = selectedOrder.lignes || []

                  // Plats du menu = lignes sans type_element
                  const platsMenu = lignes.filter((l) => !l.type_element)

                  // Plats personnalisés = lignes avec type_element, groupées par préfixe d'id
                  const getGroupKey = (id: string) => {
                    if (id.endsWith("-base")) return id.slice(0, -"-base".length)
                    const accIdx = id.indexOf("-acc-")
                    if (accIdx !== -1) return id.slice(0, accIdx)
                    const supIdx = id.indexOf("-sup-")
                    if (supIdx !== -1) return id.slice(0, supIdx)
                    return id
                  }

                  const groups: Record<string, any[]> = {}
                  lignes
                    .filter((l) => !!l.type_element)
                    .forEach((l) => {
                      const k = getGroupKey(String(l.id || ""))
                      groups[k] = groups[k] || []
                      groups[k].push(l)
                    })

                  const personalized = Object.entries(groups).map(([key, group]) => {
                    const base = group.find((l) => l.type_element === "base")
                    const acc = group.filter((l) => l.type_element === "accompagnement")
                    const sup = group.filter((l) => l.type_element === "supplement")
                    const total = group.reduce((s, l) => s + Number(l.prix_total || 0), 0)
                    return { key, base, acc, sup, total }
                  })

                  const ItemRow = ({ item }: { item: any }) => (
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                      <Image
                        src={item.image_plat || "/placeholder.svg"}
                        alt={item.nom_plat || "Plat"}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.nom_plat}</p>
                        <p className="text-sm text-gray-500">
                          Quantite: {item.quantite}
                          {item.taille && ` • ${item.taille}`}
                        </p>
                      </div>
                      <p className="font-semibold text-orange-500">{Number(item.prix_total).toFixed(2)} f</p>
                    </div>
                  )

                  return (
                    <div className="space-y-6">
                      {platsMenu.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Plats du menu</p>
                          <div className="space-y-3">
                            {platsMenu.map((item, idx) => (
                              <ItemRow key={`menu-${idx}`} item={item} />
                            ))}
                          </div>
                        </div>
                      )}

                      {personalized.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Plats personnalisés</p>
                          <div className="space-y-4">
                            {personalized.map((p) => (
                              <div key={p.key} className="border rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="font-semibold text-gray-900">Plat personnalisé</p>
                                  <p className="font-bold text-orange-500">{Number(p.total).toFixed(2)} f</p>
                                </div>

                                {p.base && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Base</p>
                                    <ItemRow item={p.base} />
                                  </div>
                                )}

                                {p.acc.length > 0 && (
                                  <div className="space-y-2 mt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Accompagnements</p>
                                    <div className="space-y-3">
                                      {p.acc.map((item, idx) => (
                                        <ItemRow key={`${p.key}-acc-${idx}`} item={item} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {p.sup.length > 0 && (
                                  <div className="space-y-2 mt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Suppléments</p>
                                    <div className="space-y-3">
                                      {p.sup.map((item, idx) => (
                                        <ItemRow key={`${p.key}-sup-${idx}`} item={item} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{Number(selectedOrder.sous_total).toFixed(2)} f</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span>{Number(selectedOrder.frais_livraison).toFixed(2)} f</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">TVA (16%)</span>
                  <span>{Number(selectedOrder.tva).toFixed(2)} f</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-orange-500">{selectedOrder.total.toFixed(2)} f</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
