// This file simulates API calls - in production, replace with real API endpoints

import { platsBase, platsAccompagnement, platsSupplements, platsMenu } from "./data"
import type { Plat, Commande, Admin, Role, StatutCommande, Client, LigneCommande } from "./types"
import { OrderStatus } from "./types"
import { supabase } from "./supabase-client"

// Types for API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PlatResponse extends Plat {}

export interface CommandeResponse extends Commande {}

// Helpers de normalisation pour les colonnes JSON (compatibilité avec anciens schémas texte)
function parseJsonSafe<T>(value: any, fallback: T): T {
  if (value == null) return fallback
  if (Array.isArray(value) || typeof value === "object") return value as T
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return (parsed ?? fallback) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

function normalizeCommandeRow(row: any): CommandeResponse {
  const lignes = parseJsonSafe<LigneCommande[]>(row.lignes, [])
  const client = parseJsonSafe<Client | null>(row.client, row.client ?? null) as Client | null
  const paiement = parseJsonSafe<any | null>(row.paiement, row.paiement ?? null)

  return {
    ...(row as Commande),
    lignes,
    client: client as any,
    paiement,
  } as CommandeResponse
}

let mockCommandes: Commande[] = [
  {
    id: "cmd-001",
    client: {
      id: "client-1",
      nom_complet: "Jean Dupont",
      telephone: "+243 812 345 678",
      email: "jean@email.com",
      date_inscription: "2024-01-15",
    },
    lignes: [
      { id: "l1", id_plat: "menu-1", nom_plat: "Menu Poulet Complet", quantite: 2, prix_unitaire: 5500, prix_total: 11000 },
    ],
    sous_total: 11000,
    frais_livraison: 2000,
    tva: 2080,
    total: 15080,
    statut_commande: OrderStatus.PENDING,
    adresse_livraison: "123 Avenue de la Paix",
    commune: "Gombe",
    ville: "Kinshasa",
    date_commande: new Date().toISOString(),
  },
  {
    id: "cmd-002",
    client: {
      id: "client-2",
      nom_complet: "Marie Kanga",
      telephone: "+243 999 888 777",
      date_inscription: "2024-02-10",
    },
    lignes: [
      { id: "l2", id_plat: "menu-2", nom_plat: "Menu Poisson Royal", quantite: 1, prix_unitaire: 6000, prix_total: 6000 },
      { id: "l3", id_plat: "menu-4", nom_plat: "Menu Végétarien", quantite: 1, prix_unitaire: 3500, prix_total: 3500 },
    ],
    sous_total: 9500,
    frais_livraison: 2500,
    tva: 1920,
    total: 13920,
    statut_commande: OrderStatus.PREPARING,
    adresse_livraison: "45 Rue du Commerce",
    commune: "Lingwala",
    ville: "Kinshasa",
    date_commande: new Date(Date.now() - 3600000).toISOString(),
  },
]

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Settings API (Supabase)
export const settingsApi = {
  async getDefault(): Promise<ApiResponse<{
    frais_livraison_defaut: number
    tva_pourcentage: number
    commande_minimum: number
    livraison_gratuite_seuil: number
  }>> {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle()

    if (error || !data) {
      console.error("Erreur Supabase settings.getDefault:", error)
      return {
        success: false,
        error: "Impossible de charger les paramètres",
      }
    }

    return {
      success: true,
      data: {
        frais_livraison_defaut: data.frais_livraison_defaut ?? 2000,
        tva_pourcentage: data.tva_pourcentage ?? 16,
        commande_minimum: data.commande_minimum ?? 0,
        livraison_gratuite_seuil: data.livraison_gratuite_seuil ?? 0,
      },
    }
  },
}

// Clients API (Supabase)
export const clientsApi = {
  async register(data: {
    nom_complet: string
    telephone: string
    email?: string
    mot_de_passe: string
  }): Promise<ApiResponse<Client>> {
    const requireEmailConfirmation = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION 

    // On utilise Supabase Auth pour gérer le mot de passe.
    // - Mode sans confirmation email: si l’email n’est pas fourni, on génère un email technique basé sur le téléphone.
    // - Mode avec confirmation email: on exige un vrai email (sinon pas de confirmation possible).
    const emailInput = data.email?.trim()
    if (requireEmailConfirmation && (!emailInput || emailInput === "")) {
      return { success: false, error: "Un email est requis pour créer un compte (confirmation email activée)." }
    }

    const authEmail = emailInput && emailInput !== "" ? emailInput : `${data.telephone}@cube.local`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password: data.mot_de_passe,
      options: {
        data: {
          user_type: "client",
          nom_complet: data.nom_complet,
          telephone: data.telephone,
        },
      },
    })

    if (authError || !authData.user) {
      const msg = String((authError as any)?.message || "")
      console.error("Erreur Supabase auth.signUp (client):", authError)
      if (msg.toLowerCase().includes("email signups are disabled")) {
        return {
          success: false,
          error:
            "Les inscriptions par email sont désactivées côté Supabase. Active Email provider + 'Enable signups' dans Authentication, puis réessaie.",
        }
      }
      if (msg.toLowerCase().includes("user already registered")) {
        return {
          success: false,
          error: "Ce compte existe déjà. Connecte-toi plutôt via la page Connexion.",
        }
      }
      return { success: false, error: "Impossible de créer le compte. Veuillez réessayer." }
    }

    const userId = authData.user.id

    // Selon la config Supabase (confirmation email), signUp peut ne pas créer de session.
    // Sans session, les RLS bloquent souvent l'insert dans `clients`.
    if (!authData.session) {
      if (requireEmailConfirmation) {
        return {
          success: false,
          error:
            "Compte créé. Veuillez confirmer votre email (lien envoyé) puis connectez-vous pour finaliser l'inscription.",
        }
      }

      const { error: signInAfterSignUpError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: data.mot_de_passe,
      })

      if (signInAfterSignUpError) {
        console.error("Erreur Supabase client signIn après signUp:", {
          message: (signInAfterSignUpError as any)?.message,
          status: (signInAfterSignUpError as any)?.status,
          name: (signInAfterSignUpError as any)?.name,
        })
        return {
          success: false,
          error:
            "Compte créé, mais la session n'a pas pu être ouverte. Vérifie si la confirmation email est activée dans Supabase Auth, puis réessaie après validation.",
        }
      }
    }

    // IMPORTANT:
    // Le profil client doit être créé côté DB (trigger `handle_new_user()` sur `auth.users`)
    // pour éviter les erreurs 403/RLS lors d'insert depuis le navigateur.
    // On tente de récupérer le profil; si la policy SELECT n'est pas en place, on renvoie un profil minimal.
    const { data: clientRow, error: fetchError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (fetchError) {
      console.error("Erreur Supabase clients.register (fetch profil):", {
        message: (fetchError as any)?.message,
        code: (fetchError as any)?.code,
        details: (fetchError as any)?.details,
        hint: (fetchError as any)?.hint,
        status: (fetchError as any)?.status,
        raw: fetchError,
      })
    }

    const fallbackProfile: Client = {
      id: userId,
      nom_complet: data.nom_complet,
      telephone: data.telephone,
      email: data.email,
      date_inscription: new Date().toISOString(),
    }

    return { success: true, data: (clientRow as Client) ?? fallbackProfile }
  },

  async login(identifier: string, password: string): Promise<ApiResponse<Client>> {
    // Si l'identifiant contient un @ -> email direct,
    // sinon on le considère comme téléphone et on reconstruit l'email technique.
    const isEmail = identifier.includes("@")
    const authEmail = isEmail ? identifier : `${identifier}@cube.local`

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    })

    if (authError || !authData.user) {
      console.error("Erreur Supabase auth.signIn (client):", authError)
      return { success: false, error: "Identifiants incorrects" }
    }

    const userId = authData.user.id

    const { data: client, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      console.error("Erreur Supabase clients.login (fetch profil):", error)
      return { success: false, error: "Impossible de récupérer le profil client" }
    }

    if (!client) {
      // Profil manquant : on en crée un minimal à partir des données auth
      const profile: Partial<Client> = {
        id: userId,
        nom_complet: authData.user.user_metadata?.nom_complet || "Client",
        telephone: authData.user.user_metadata?.telephone || identifier,
        email: authData.user.email || (isEmail ? identifier : undefined),
        date_inscription: new Date().toISOString(),
      }

      const { data: created, error: createError } = await supabase
        .from("clients")
        .insert(profile)
        .select("*")
        .maybeSingle()

      if (createError || !created) {
        console.error("Erreur Supabase clients.login (create profil):", createError)
        return { success: false, error: "Impossible de créer le profil client" }
      }

      return { success: true, data: created as Client }
    }

    return { success: true, data: client as Client }
  },

  async updateProfile(clientId: string, data: {
    nom_complet: string
    telephone: string
    email?: string
  }): Promise<ApiResponse<Client>> {
    const { data: updated, error } = await supabase
      .from("clients")
      .update({
        nom_complet: data.nom_complet,
        telephone: data.telephone,
        email: data.email ?? null,
      })
      .eq("id", clientId)
      .select("*")
      .maybeSingle()

    if (error || !updated) {
      console.error("Erreur Supabase clients.updateProfile:", error)
      return { success: false, error: "Impossible de mettre à jour le profil" }
    }

    return { success: true, data: updated as Client }
  },

  async getAll(): Promise<ApiResponse<Client[]>> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("date_inscription", { ascending: false })

    if (error) {
      console.error("Erreur Supabase clients.getAll:", error)
      return { success: false, error: "Impossible de charger les clients" }
    }

    return { success: true, data: (data || []) as Client[] }
  },
}

// Plats API (Supabase)
export const platsApi = {
  async getBases(): Promise<ApiResponse<PlatResponse[]>> {
    const { data, error } = await supabase
      .from("plats")
      .select("*")
      .eq("type", "base")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase plats.getBases:", error)
      return { success: false, error: "Impossible de charger les plats de base" }
    }

    return { success: true, data: (data || []) as PlatResponse[] }
  },

  async getAccompagnements(): Promise<ApiResponse<PlatResponse[]>> {
    const { data, error } = await supabase
      .from("plats")
      .select("*")
      .eq("type", "accompagnement")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase plats.getAccompagnements:", error)
      return { success: false, error: "Impossible de charger les accompagnements" }
    }

    return { success: true, data: (data || []) as PlatResponse[] }
  },

  async getSupplements(): Promise<ApiResponse<PlatResponse[]>> {
    const { data, error } = await supabase
      .from("plats")
      .select("*")
      .eq("type", "supplement")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase plats.getSupplements:", error)
      return { success: false, error: "Impossible de charger les suppléments" }
    }

    return { success: true, data: (data || []) as PlatResponse[] }
  },

  async getMenu(): Promise<ApiResponse<PlatResponse[]>> {
    const { data, error } = await supabase
      .from("plats")
      .select("*")
      .eq("type", "menu")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase plats.getMenu:", error)
      return { success: false, error: "Impossible de charger les menus" }
    }

    return { success: true, data: (data || []) as PlatResponse[] }
  },

  async getAll(): Promise<ApiResponse<PlatResponse[]>> {
    const { data, error } = await supabase
      .from("plats")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase plats.getAll:", error)
      return { success: false, error: "Impossible de charger les plats" }
    }

    return { success: true, data: (data || []) as PlatResponse[] }
  },

  async create(data: Partial<Plat>): Promise<ApiResponse<PlatResponse>> {
    const { data: inserted, error } = await supabase
      .from("plats")
      .insert({
        nom: data.nom,
        description: data.description ?? "",
        type: data.type,
        prix_base: data.prix_base ?? 0,
        categorie: data.categorie,
        image: data.image ?? null,
        statut: data.statut ?? "actif",
        variations: data.variations ?? null,
      })
      .select("*")
      .maybeSingle()

    if (error || !inserted) {
      console.error("Erreur Supabase plats.create:", error)
      return { success: false, error: "Impossible de créer le plat" }
    }

    return { success: true, data: inserted as PlatResponse }
  },

  async update(id: string, data: Partial<Plat>): Promise<ApiResponse<PlatResponse>> {
    const updatePayload: Record<string, any> = {
      nom: data.nom,
      description: data.description,
      type: data.type,
      prix_base: data.prix_base,
      categorie: data.categorie,
      image: data.image,
      statut: data.statut,
    }
    if (data.variations !== undefined) {
      updatePayload.variations = data.variations
    }

    const { data: updated, error } = await supabase
      .from("plats")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error || !updated) {
      console.error("Erreur Supabase plats.update:", error)
      return { success: false, error: "Impossible de mettre à jour le plat" }
    }

    return { success: true, data: updated as PlatResponse }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase.from("plats").delete().eq("id", id)

    if (error) {
      console.error("Erreur Supabase plats.delete:", error)
      return { success: false, error: "Impossible de supprimer le plat" }
    }

    return { success: true }
  },
}

// Commandes API (Supabase)
export const commandesApi = {
  async getAll(limit = 200): Promise<ApiResponse<CommandeResponse[]>> {
    const { data, error } = await supabase
      .from("commandes")
      .select("*")
      .order("date_commande", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erreur Supabase commandes.getAll:", error)
      return { success: false, error: "Impossible de charger les commandes" }
    }

    const rows = (data || []).map(normalizeCommandeRow)
    return { success: true, data: rows }
  },

  async getMine(limit = 200): Promise<ApiResponse<CommandeResponse[]>> {
    // Pour l'instant, cette méthode renvoie simplement les commandes triées.
    // Tu pourras la filtrer par client (ex: colonne client_id) quand tu auras
    // branché Supabase Auth côté clients.
    const { data, error } = await supabase
      .from("commandes")
      .select("*")
      .order("date_commande", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erreur Supabase commandes.getMine:", error)
      return { success: false, error: "Impossible de charger les commandes" }
    }

    const rows = (data || []).map(normalizeCommandeRow)
    return { success: true, data: rows }
  },

  async getById(id: string): Promise<ApiResponse<CommandeResponse>> {
    const { data, error } = await supabase
      .from("commandes")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      console.error("Erreur Supabase commandes.getById:", error)
      return { success: false, error: "Impossible de charger la commande" }
    }

    if (!data) {
      return { success: false, error: "Commande non trouvée" }
    }

    return { success: true, data: normalizeCommandeRow(data) }
  },

  async updateStatus(id: string, status: StatutCommande): Promise<ApiResponse<CommandeResponse>> {
    const { data, error } = await supabase
      .from("commandes")
      .update({ statut_commande: status })
      .eq("id", id)
      .select("*")
      .maybeSingle()

    if (error) {
      console.error("Erreur Supabase commandes.updateStatus:", error)
      return { success: false, error: "Impossible de mettre à jour le statut" }
    }

    if (!data) {
      return { success: false, error: "Commande non trouvée" }
    }

    return { success: true, data: data as CommandeResponse }
  },

  async create(data: Partial<Commande>): Promise<ApiResponse<CommandeResponse>> {
    // On suppose un schéma avec:
    // - colonnes primitives (sous_total, total, etc.)
    // - colonnes JSONB pour client, lignes, paiement
    const payload = {
      client: data.client,
      lignes: data.lignes || [],
      sous_total: data.sous_total || 0,
      frais_livraison: data.frais_livraison ?? 2000,
      tva: data.tva || 0,
      total: data.total || 0,
      statut_commande: data.statut_commande || OrderStatus.PENDING,
      adresse_livraison: data.adresse_livraison || "",
      commune: data.commune || "",
      ville: data.ville || "Kinshasa",
      instructions: data.instructions ?? null,
      paiement: data.paiement ?? null,
      date_commande: data.date_commande || new Date().toISOString(),
    }

    const { data: inserted, error } = await supabase
      .from("commandes")
      .insert(payload)
      .select("*")
      .maybeSingle()

    if (error || !inserted) {
      console.error("Erreur Supabase commandes.create:", error)
      return { success: false, error: "Impossible de créer la commande" }
    }

    return { success: true, data: inserted as CommandeResponse }
  },
}

// Stats API (Supabase)
export const statsApi = {
  async getDashboard(): Promise<ApiResponse<{
    commandes_jour: number
    revenus_jour: number
    plats_menu: number
    inscriptions_mois: number
    revenus_semaine: { jour: string; montant: number }[]
    plats_populaires: { nom: string; pourcentage: number; commandes: number }[]
    commandes_recentes: CommandeResponse[]
  }>> {
    try {
      // Commandes d'aujourd'hui
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      const { data: commandesToday, error: cmdTodayError } = await supabase
        .from("commandes")
        .select("*")
        .gte("date_commande", startOfDay)

      if (cmdTodayError) throw cmdTodayError

      const commandes_jour = (commandesToday || []).length
      const revenus_jour = (commandesToday || []).reduce((sum, c: any) => sum + (c.total || 0), 0)

      // Nombre de plats au menu
      const { data: platsMenuData, error: platsError } = await supabase
        .from("plats")
        .select("id")
        .eq("type", "menu")

      if (platsError) throw platsError
      const plats_menu = (platsMenuData || []).length

      // Inscriptions du mois (clients)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
      const { data: clientsMonth, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .gte("date_inscription", startOfMonth)

      if (clientsError) throw clientsError
      const inscriptions_mois = (clientsMonth || []).length

      // Revenus de la semaine (simple agrégat par jour à partir des commandes)
      const startOfWeek = new Date(today)
      startOfWeek.setHours(0, 0, 0, 0)
      startOfWeek.setDate(today.getDate() - 6)
      const endOfWeek = new Date(today)
      endOfWeek.setHours(23, 59, 59, 999)

      const { data: commandesWeek, error: weekError } = await supabase
        .from("commandes")
        .select("date_commande,total")
        .gte("date_commande", startOfWeek.toISOString())
        .lte("date_commande", endOfWeek.toISOString())

      if (weekError) throw weekError

      const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
      const revenusMap: Record<string, number> = {}

      ;(commandesWeek || []).forEach((c: any) => {
        const d = new Date(c.date_commande)
        if (Number.isNaN(d.getTime())) return
        const label = jours[d.getDay()]
        revenusMap[label] = (revenusMap[label] || 0) + (Number(c.total) || 0)
      })

      const revenus_semaine = jours.map((jour) => ({
        jour,
        montant: revenusMap[jour] || 0,
      }))

      // Plats populaires (basé sur les lignes de commande)
      const { data: commandesAll, error: cmdAllError } = await supabase
        .from("commandes")
        .select("lignes")

      if (cmdAllError) throw cmdAllError

      const countByPlat: Record<string, { nom: string; commandes: number }> = {}
      ;(commandesAll || []).forEach((c: any) => {
        const lignes = parseJsonSafe<LigneCommande[]>(c.lignes, [])
        lignes.forEach((l: any) => {
          const key = l.nom_plat || l.nom || "Autre"
          if (!countByPlat[key]) {
            countByPlat[key] = { nom: key, commandes: 0 }
          }
          countByPlat[key].commandes += l.quantite || 0
        })
      })

      const totalCommandesPlats = Object.values(countByPlat).reduce((sum, p) => sum + p.commandes, 0) || 1
      const plats_populaires = Object.values(countByPlat)
        .sort((a, b) => b.commandes - a.commandes)
        .slice(0, 5)
        .map((p) => ({
          nom: p.nom,
          commandes: p.commandes,
          pourcentage: Math.round((p.commandes / totalCommandesPlats) * 100),
        }))

      // Commandes récentes
      const { data: recent, error: recentError } = await supabase
        .from("commandes")
        .select("*")
        .order("date_commande", { ascending: false })
        .limit(5)

      if (recentError) throw recentError

      return {
        success: true,
        data: {
          commandes_jour,
          revenus_jour,
          plats_menu,
          inscriptions_mois,
          revenus_semaine,
          plats_populaires,
          commandes_recentes: (recent || []) as CommandeResponse[],
        },
      }
    } catch (error) {
      console.error("Erreur statsApi.getDashboard:", error)
      return { success: false, error: "Impossible de charger les statistiques" }
    }
  },
}

// Admins API
export const adminsApi = {
  async getAll(): Promise<ApiResponse<Admin[]>> {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur Supabase admins.getAll:", error)
      return { success: false, error: "Impossible de charger les administrateurs" }
    }

    return { success: true, data: (data || []) as Admin[] }
  },

  async create(data: { nom: string; email: string; mot_de_passe: string; role_id?: string }): Promise<ApiResponse<Admin>> {
    // 1) Créer le compte dans Supabase Auth (email + mot de passe)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.mot_de_passe,
      options: {
        data: {
          user_type: "admin",
          nom: data.nom,
        },
      },
    })

    if (authError || !authData.user) {
      console.error("Erreur Supabase auth.signUp (admin):", authError)
      return { success: false, error: "Impossible de créer le compte administrateur" }
    }

    const userId = authData.user.id

    // 2) Récupérer le rôle applicatif (cuisinier/caissier/manager)
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("*")
      .eq("id", data.role_id)
      .maybeSingle()

    if (roleError) {
      console.error("Erreur Supabase roles (create admin):", roleError)
    }

    // 3) Enregistrer dans la table admins (sans mot de passe)
    const { data: inserted, error } = await supabase
      .from("admins")
      .insert({
        id: userId,
        nom: data.nom,
        email: data.email,
        role: role?.name ?? "manager", // rôle par défaut si rien n'est trouvé
        role_id: data.role_id ?? null,
        permissions: role?.permissions ?? [],
      })
      .select("*")
      .maybeSingle()

    if (error || !inserted) {
      console.error("Erreur Supabase admins.create:", error)
      return { success: false, error: "Impossible de créer l'administrateur" }
    }

    return { success: true, data: inserted as Admin }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || "Erreur serveur" }
      }

      return { success: true }
    } catch (error) {
      console.error("Erreur adminsApi.delete:", error)
      return { success: false, error: "Impossible de supprimer l'administrateur" }
    }
  },

  async login(email: string, password: string): Promise<ApiResponse<Admin>> {
    // Authentification via Supabase Auth (email/password)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error("Erreur Supabase auth.signIn (admin):", authError)
      return { success: false, error: "Email ou mot de passe incorrect" }
    }

    // Vérifier que l'utilisateur est bien dans la table admins
    const { data: admin, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("Erreur Supabase admins.login:", error)
      return { success: false, error: "Erreur de connexion" }
    }

    if (!admin) {
      return { success: false, error: "Accès refusé" }
    }

    return { success: true, data: admin as Admin }
  },
}

// Roles API
export const rolesApi = {
  async getAll(): Promise<ApiResponse<Role[]>> {
    // On suppose une table "roles" dans Supabase:
    // id (uuid/text), name (text), permissions (text[])
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Erreur Supabase roles.getAll:", error)
      return { success: false, error: "Impossible de charger les rôles" }
    }

    return { success: true, data: (data || []) as Role[] }
  },
}
