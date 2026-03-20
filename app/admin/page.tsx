"use client"

import React, { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { statsApi } from "@/lib/api"
import { OrderStatus } from "@/lib/types"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<{ day: string; value: number }[]>([])
  const [popularDishes, setPopularDishes] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    async function loadDashboard() {
      setLoading(true)
      try {
        const res = await statsApi.getDashboard()
        if (res.success && mounted && res.data) {
          const d = res.data

          // Stats cards
          const cards = [
            {
              label: "Commandes aujourd'hui",
              value: String(d.commandes_jour ?? 0),
              change: "+12%",
              positive: true,
            },
            {
              label: "Revenus du jour",
              value: `${(d.revenus_jour ?? 0).toLocaleString()}f`,
              change: "+8%",
              positive: true,
            },
            {
              label: "Plats au menu",
              value: String(d.plats_menu ?? 0),
              change: "0%",
              positive: true,
            },
            {
              label: "Inscriptions du mois",
              value: String(d.inscriptions_mois ?? 0),
              change: "+5%",
              positive: true,
            },
          ]

          setStats(cards)

          // Revenue chart data
          let revenus = d.revenus_semaine || []
          if (!revenus || revenus.length === 0) {
            const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
            revenus = jours.map((jour) => ({ jour, montant: 0 }))
          }

          const max = Math.max(...revenus.map((r: any) => Number(r.montant) || 0), 1)
          setRevenueData(
            revenus.map((r: any) => ({ day: r.jour.substring(0, 3), value: Math.round(((Number(r.montant) || 0) / max) * 100) })),
          )

          // Popular dishes
          const colors = ["bg-orange-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-red-500", "bg-yellow-500"]
          const top = (d.plats_populaires || []).slice(0, 6).map((p: any, i: number) => ({
            name: p.nom,
            percentage: Math.round(p.pourcentage ?? (p.commandes ? (p.commandes / 1) * 100 : 0)),
            color: colors[i % colors.length],
          }))
          setPopularDishes(top)

          // Recent orders
          const recents = (d.commandes_recentes || []).map((c: any) => ({
            id: c.id,
            createdAt: c.date_commande,
            total: c.total,
            items: (c.lignes || []).map((l: any) => ({ quantity: l.quantite, name: l.nom_plat })),
            deliveryInfo: { fullName: c.client?.nom_complet ?? "Client" },
            status: c.statut_commande,
          }))
          setRecentOrders(recents)
        }
      } catch (e) {
        console.error("Failed to load dashboard:", e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadDashboard()
    return () => {
      mounted = false
    }
  }, [])

  const statusLabels: Record<string, string> = {
    [OrderStatus.PENDING]: "En attente",
    [OrderStatus.CONFIRMED]: "Confirmee",
    [OrderStatus.PREPARING]: "En preparation",
    [OrderStatus.READY]: "Pret",
    [OrderStatus.DELIVERING]: "En livraison",
    [OrderStatus.DELIVERED]: "Livree",
    [OrderStatus.CANCELLED]: "Annulee",
  }

  function getStatusStyle(status: string) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500">Vue d&apos;ensemble de votre restaurant</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                  <span className="text-2xl">
                    {index === 0 ? "📦" : index === 1 ? "💰" : index === 2 ? "🍽️" : "👥"}
                  </span>
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${stat.positive ? "text-green-600" : "text-red-600"}`}
                >
                  {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus de la semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-orange-500 rounded-t-md transition-all hover:bg-orange-600"
                    style={{ height: `${item.value}%` }}
                  />
                  <span className="text-xs text-gray-500">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Dishes */}
        <Card>
          <CardHeader>
            <CardTitle>Plats populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {
                    popularDishes.reduce(
                      (acc, dish, index) => {
                        const circumference = 2 * Math.PI * 40
                        const strokeDasharray = (dish.percentage / 100) * circumference
                        const strokeDashoffset = -acc.offset
                        acc.elements.push(
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={
                              dish.color === "bg-orange-500"
                                ? "#f97316"
                                : dish.color === "bg-green-500"
                                  ? "#22c55e"
                                  : dish.color === "bg-blue-500"
                                    ? "#3b82f6"
                                    : dish.color === "bg-purple-500"
                                      ? "#a855f7"
                                      : "#ef4444"
                            }
                            strokeWidth="20"
                            strokeDasharray={`${strokeDasharray} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                          />,
                        )
                        acc.offset += strokeDasharray
                        return acc
                      },
                      { elements: [] as React.ReactNode[], offset: 0 },
                    ).elements
                  }
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {popularDishes.map((dish, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dish.color}`} />
                  <span className="text-sm text-gray-600">
                    {dish.name} ({dish.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commandes recentes</CardTitle>
          <Link href="/admin/commandes" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
            Voir tout
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Articles</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Etat</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-4 text-orange-500 font-medium">#{String(order.id).slice(0, 8)}</td>
                    <td className="py-4 text-gray-900 hidden sm:table-cell">{order.deliveryInfo?.fullName}</td>
                    <td className="py-4 text-gray-600 hidden md:table-cell">
                      {order.items
                        .map((i: any) => `${i.quantity}x ${i.name || "Plat"}`)
                        .join(", ")
                        .slice(0, 30)}
                      ...
                    </td>
                    <td className="py-4 font-medium text-gray-900">{Number(order.total || 0).toFixed(2)} f</td>
                    <td className="py-4">
                      <span
                        className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm ${getStatusStyle(order.status)}`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link href={`/admin/commandes?id=${order.id}`}>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
