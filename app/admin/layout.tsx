"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, UtensilsCrossed, ShoppingBag, Users, Settings, LogOut, Menu, X, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { href: "/admin", label: "Statistiques", icon: BarChart3 },
  { href: "/admin/plats", label: "Plats", icon: UtensilsCrossed },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/parametres", label: "Parametres", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAdminAuthenticated, isLoading, admin, role, adminLogout } = useAuth()

  // Don't apply layout to connexion page
  const isConnexionPage = pathname === "/admin/connexion"

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated && !isConnexionPage) {
      router.push("/admin/connexion")
    }
  }, [isAdminAuthenticated, isLoading, isConnexionPage, router])

  // Show connexion page without layout
  if (isConnexionPage) {
    return <>{children}</>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Not authenticated
  if (!isAdminAuthenticated) {
    return null
  }

  const handleLogout = () => {
    adminLogout()
    router.push("/")
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white flex flex-col fixed h-full z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="p-6">
          <Link href="/admin">
            <h1 className="text-2xl font-bold">CUBE Admin</h1>
          </Link>
          <p className="text-orange-200 text-sm">Tableau de bord</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-white text-orange-500 font-medium" : "text-white hover:bg-orange-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}

          {/* Superadmin only - Admins management */}
          {role === "superadmin" && (
            <Link
              href="/admin/admins"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === "/admin/admins" ? "bg-white text-orange-500 font-medium" : "text-white hover:bg-orange-400"
              }`}
            >
              <Shield className="w-5 h-5" />
              Administrateurs
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-300 flex items-center justify-center">
              <span className="text-orange-700 font-medium">
                {admin?.nom?.substring(0, 2).toUpperCase() || "AD"}
              </span>
            </div>
            <div>
              <p className="font-medium">{admin?.nom || "Admin"}</p>
              <p className="text-orange-200 text-sm capitalize">{role || "Admin"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-orange-200 hover:text-white transition-colors text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            Deconnexion
          </button>
          <Link href="/" className="flex items-center gap-2 text-orange-200 hover:text-white transition-colors text-sm mt-2">
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  )
}
