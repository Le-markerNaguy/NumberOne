"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Client, Admin, UserRole } from "@/lib/types"
import { adminsApi, clientsApi } from "@/lib/api"
import { supabase } from "@/lib/supabase-client"

interface AuthContextType {
  // Client auth
  isAuthenticated: boolean
  isLoading: boolean
  client: Client | null
  commandeEnCours: { id: string; statut_commande: string } | null
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    nom_complet: string
    telephone: string
    email?: string
    mot_de_passe: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: {
    nom_complet: string
    telephone: string
    email?: string
  }) => Promise<{ success: boolean; error?: string }>
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  
  // Admin auth
  isAdminAuthenticated: boolean
  admin: Admin | null
  role: UserRole | null
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogout: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Client state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [commandeEnCours, setCommandeEnCours] = useState<{ id: string; statut_commande: string } | null>(null)

  // Admin state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    // Check for stored client session
    const storedClient = localStorage.getItem("cube_client")
    if (storedClient) {
      try {
        const parsed = JSON.parse(storedClient)
        setClient(parsed)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem("cube_client")
      }
    }

    // Check for stored admin session
    const storedAdmin = localStorage.getItem("cube_admin")
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin)
        setAdmin(parsed)
        setRole(parsed.role)
        setIsAdminAuthenticated(true)
      } catch {
        localStorage.removeItem("cube_admin")
      }
    }

    setIsLoading(false)
  }, [])

  // Client login (Supabase)
  const login = async (identifier: string, password: string) => {
    const res = await clientsApi.login(identifier, password)

    if (res.success && res.data) {
      setClient(res.data)
      setIsAuthenticated(true)
      localStorage.setItem("cube_client", JSON.stringify(res.data))
      return { success: true }
    }

    return { success: false, error: res.error || "Identifiants incorrects" }
  }

  // Client register (Supabase)
  const register = async (data: {
    nom_complet: string
    telephone: string
    email?: string
    mot_de_passe: string
  }) => {
    const res = await clientsApi.register(data)

    if (res.success && res.data) {
      setClient(res.data)
      setIsAuthenticated(true)
      localStorage.setItem("cube_client", JSON.stringify(res.data))
      return { success: true }
    }

    return { success: false, error: res.error || "Erreur lors de l'inscription" }
  }

  // Client logout
  const logout = () => {
    setClient(null)
    setIsAuthenticated(false)
    setCommandeEnCours(null)
    localStorage.removeItem("cube_client")
  }

  // Update client profile (Supabase)
  const updateProfile = async (data: {
    nom_complet: string
    telephone: string
    email?: string
  }) => {
    if (!client) {
      return { success: false, error: "Non connecté" }
    }

    const res = await clientsApi.updateProfile(client.id, data)

    if (res.success && res.data) {
      setClient(res.data)
      localStorage.setItem("cube_client", JSON.stringify(res.data))
      return { success: true }
    }

    return { success: false, error: res.error || "Impossible de mettre à jour le profil" }
  }

  // Change client password (Supabase Auth)
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user
      if (!currentUser || !currentUser.email) {
        return { success: false, error: "Non connecté" }
      }

      // Vérifier l'ancien mot de passe
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: oldPassword,
      })
      if (signInError) {
        return { success: false, error: "Ancien mot de passe incorrect" }
      }

      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) {
        console.error("Erreur changement mot de passe:", updateError)
        return { success: false, error: "Impossible de changer le mot de passe" }
      }

      return { success: true }
    } catch (e) {
      console.error("Erreur changePassword:", e)
      return { success: false, error: "Erreur lors du changement de mot de passe" }
    }
  }

  // Admin login
  const adminLogin = async (email: string, password: string) => {
    const response = await adminsApi.login(email, password)
    
    if (response.success && response.data) {
      setAdmin(response.data)
      setRole(response.data.role)
      setIsAdminAuthenticated(true)
      localStorage.setItem("cube_admin", JSON.stringify(response.data))
      return { success: true }
    }

    return { success: false, error: response.error || "Identifiants incorrects" }
  }

  // Admin logout
  const adminLogout = () => {
    setAdmin(null)
    setRole(null)
    setIsAdminAuthenticated(false)
    localStorage.removeItem("cube_admin")
  }

  // Check permission
  const hasPermission = (permission: string): boolean => {
    if (!admin) return false
    if (role === "superadmin") return true
    if (admin.permissions?.includes("*")) return true
    return admin.permissions?.includes(permission) || false
  }

  return (
    <AuthContext.Provider
      value={{
        // Client
        isAuthenticated,
        isLoading,
        client,
        commandeEnCours,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        // Admin
        isAdminAuthenticated,
        admin,
        role,
        adminLogin,
        adminLogout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
