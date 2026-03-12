"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { Search, ChevronDown, ChevronLeft, ChevronRight, Plus, Eye, Pencil, Trash2, X, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDishes } from "@/contexts/dishes-context"
import type { Plat, StatutPlat } from "@/lib/types"

const categoriesAdmin = [
  "Toutes categories",
  "Plat-menus",
  "Bases",
  "Accompagnements",
  "Supplements",
  "Boissons",
  "Desserts",
]
const statuses = ["Tous statuts", "Actif", "Inactif"]

function getCategoryStyle(category: string) {
  switch (category) {
    case "Plat-menus":
      return "bg-orange-100 text-orange-700"
    case "Bases":
      return "bg-red-100 text-red-700"
    case "Accompagnements":
      return "bg-green-100 text-green-700"
    case "Supplements":
      return "bg-purple-100 text-purple-700"
    case "Boissons":
      return "bg-blue-100 text-blue-700"
    case "Desserts":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function AdminPlats() {
  const { platsMenu, platsBase, platsAccompagnement, platsSupplements, addPlat, updatePlat, deletePlat } = useDishes()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes categories")
  const [selectedStatus, setSelectedStatus] = useState("Tous statuts")
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [selectedDish, setSelectedDish] = useState<Plat | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const dishesPerPage = 6

  const allDishes: Plat[] = [
    ...platsMenu,
    ...platsBase,
    ...platsAccompagnement,
    ...platsSupplements,
  ]

  const filteredDishes = allDishes.filter((dish) => {
    const matchesSearch =
      dish.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Toutes categories" || dish.categorie === selectedCategory
    const matchesStatus =
      selectedStatus === "Tous statuts" ||
      (selectedStatus === "Actif" && dish.statut === "actif") ||
      (selectedStatus === "Inactif" && dish.statut === "inactif")
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalPages = Math.ceil(filteredDishes.length / dishesPerPage)
  const paginatedDishes = filteredDishes.slice((currentPage - 1) * dishesPerPage, currentPage * dishesPerPage)

  const toggleDishStatus = (id: string) => {
    const dish = allDishes.find((d) => d.id === id)
    if (!dish) return
    updatePlat(id, { statut: dish.statut === "actif" ? "inactif" : "actif" })
  }

  const handleDeleteDish = (id: string) => {
    deletePlat(id)
    setDeleteConfirm(null)
  }

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    target: "menu" as "menu" | "personnalisation",
    categorie: "Plat-menus",
    prix_base: 0,
    petit_prix: 0,
    moyen_prix: 0,
    grand_prix: 0,
    image: "",
    statut: "actif" as StatutPlat,
  })

  const openModal = (mode: "add" | "edit" | "view", dish?: Plat) => {
    setModalMode(mode)
    setSelectedDish(dish || null)
    if (dish && mode === "edit") {
      const petit = (dish.variations || []).find((v) => v.taille === "petit")
      const moyen = (dish.variations || []).find((v) => v.taille === "moyen")
      const grand = (dish.variations || []).find((v) => v.taille === "grand")

      setFormData({
        nom: dish.nom,
        description: dish.description,
        target: dish.type === "menu" ? "menu" : "personnalisation",
        categorie: dish.categorie,
        prix_base: dish.prix_base,
        petit_prix: petit ? petit.prix : 0,
        moyen_prix: moyen ? moyen.prix : 0,
        grand_prix: grand ? grand.prix : 0,
        image: dish.image ?? "",
        statut: dish.statut,
      })
      setImagePreview(dish.image ?? null)
    } else {
      setFormData({
        nom: "",
        description: "",
        target: "menu",
        categorie: "Plat-menus",
        prix_base: 0,
        petit_prix: 0,
        moyen_prix: 0,
        grand_prix: 0,
        image: "",
        statut: "actif",
      })
      setImagePreview(null)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDish(null)
    setImagePreview(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData((prev) => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const personalizationCategories = ["Bases", "Accompagnements", "Supplements"]
  const menuCategories = categoriesAdmin.filter((c) => c !== "Toutes categories" && !personalizationCategories.includes(c))

  const determineType = (target: string, categorie: string) => {
    if (target === "menu") return "menu"
    if (categorie === "Bases") return "base"
    if (categorie === "Accompagnements") return "accompagnement"
    if (categorie === "Supplements") return "supplement"
    return "menu"
  }

  const buildVariationsFromForm = () => {
    const petit = Number(formData.petit_prix) || 0
    const moyen = Number(formData.moyen_prix) || 0
    const grand = Number(formData.grand_prix) || 0
    return [
      { taille: "petit" as const, prix: petit },
      { taille: "moyen" as const, prix: moyen },
      { taille: "grand" as const, prix: grand },
    ]
  }

  const handleSave = () => {
    const type = determineType(formData.target, formData.categorie)
    const isPersonalization = formData.target === "personnalisation" && personalizationCategories.includes(formData.categorie)

    if (modalMode === "add") {
      const vars = isPersonalization ? buildVariationsFromForm() : []
      const nonZero = vars.filter((v) => v.prix > 0)
      const prixBase = nonZero.length > 0 ? Math.min(...nonZero.map((v) => v.prix)) : formData.prix_base

      const newDish: Plat = {
        id: `menu-${Date.now()}`,
        nom: formData.nom,
        description: formData.description,
        type: type as Plat["type"],
        prix_base: prixBase,
        categorie: formData.categorie,
        image: formData.image || "/placeholder.svg",
        statut: formData.statut,
        variations: vars.length > 0 ? vars.map((v) => ({ id: `var-${Date.now()}-${v.taille}`, id_plat: "", taille: v.taille, prix: v.prix })) : undefined,
      }
      addPlat(newDish)
    } else if (modalMode === "edit" && selectedDish) {
      const vars = isPersonalization ? buildVariationsFromForm() : undefined
      const nonZeroEdit = vars ? vars.filter((v) => v.prix > 0) : undefined
      const prixBase = nonZeroEdit && nonZeroEdit.length > 0 ? Math.min(...nonZeroEdit.map((v) => v.prix)) : formData.prix_base

      updatePlat(selectedDish.id, {
        nom: formData.nom,
        description: formData.description,
        categorie: formData.categorie,
        prix_base: prixBase,
        image: formData.image || selectedDish.image,
        statut: formData.statut,
        variations: vars ? vars.map((v, i) => ({ id: selectedDish.variations?.[i]?.id || `var-${Date.now()}-${i}`, id_plat: selectedDish.id, taille: v.taille, prix: v.prix })) : undefined,
      })
    }
    closeModal()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des plats</h1>
          <p className="text-gray-500">Gerer le menu de votre restaurant</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => openModal("add")}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un plat
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher un plat..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select
              className="appearance-none border rounded-lg px-4 py-2 pr-10 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
            >
              {categoriesAdmin.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="appearance-none border rounded-lg px-4 py-2 pr-10 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dishes Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b bg-gray-50">
                  <th className="p-4 font-medium">Image</th>
                  <th className="p-4 font-medium">Nom du plat</th>
                  <th className="p-4 font-medium hidden md:table-cell">Categorie</th>
                  <th className="p-4 font-medium">Prix</th>
                  <th className="p-4 font-medium hidden lg:table-cell">Statut</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDishes.map((dish) => (
                  <tr key={dish.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <Image
                        src={dish.image || "/placeholder.svg"}
                        alt={dish.nom}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{dish.nom}</p>
                      <p className="text-gray-500 text-sm line-clamp-1">{dish.description}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`px-3 py-1 rounded-full text-sm ${getCategoryStyle(dish.categorie)}`}>
                        {dish.categorie}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">{dish.prix_base.toFixed(2)} f</td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${dish.statut === "actif" ? "text-gray-900" : "text-gray-400"}`}>
                          {dish.statut === "actif" ? "Actif" : "Inactif"}
                        </span>
                        <Switch checked={dish.statut === "actif"} onCheckedChange={() => toggleDishStatus(dish.id)} />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {deleteConfirm === dish.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                              onClick={() => handleDeleteDish(dish.id)}
                            >
                              Confirmer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 text-xs"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Annuler
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(dish.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => openModal("edit", dish)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                              onClick={() => openModal("view", dish)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
            <p className="text-gray-500 text-sm">
              Affichage {(currentPage - 1) * dishesPerPage + 1}-
              {Math.min(currentPage * dishesPerPage, filteredDishes.length)} sur {filteredDishes.length} plats
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

      {/* Modal Add/Edit/View */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {modalMode === "add"
                  ? "Ajouter un plat"
                  : modalMode === "edit"
                    ? "Modifier le plat"
                    : "Details du plat"}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              {modalMode === "view" && selectedDish ? (
                <div className="space-y-6">
                  <div className="flex gap-6">
                    <Image
                      src={selectedDish.image || "/placeholder.svg"}
                      alt={selectedDish.nom}
                      width={150}
                      height={150}
                      className="rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedDish.nom}</h3>
                      <p className="text-gray-500 mt-1">{selectedDish.description}</p>
                      <div className="flex gap-2 mt-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${getCategoryStyle(selectedDish.categorie)}`}>
                          {selectedDish.categorie}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-500 text-sm">Prix de base</p>
                      <p className="text-2xl font-bold text-orange-500">{selectedDish.prix_base.toFixed(2)} f</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-500 text-sm">Statut</p>
                      <p className="text-2xl font-bold">{selectedDish.statut === "actif" ? "Actif" : "Inactif"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du plat *</Label>
                      <Input
                        id="name"
                        value={formData.nom}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                        placeholder="Ex: Burger Signature"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ajouter pour</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${formData.target === "menu" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                          onClick={() => setFormData((prev) => ({ ...prev, target: "menu", categorie: "Plat-menus" }))}
                        >
                          Plat du menu
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${formData.target === "personnalisation" ? "bg-orange-500 text-white" : "bg-gray-100"}`}
                          onClick={() => setFormData((prev) => ({ ...prev, target: "personnalisation", categorie: "Bases" }))}
                        >
                          Pour personnalisation
                        </button>
                      </div>

                      <Label htmlFor="category">Categorie *</Label>
                      <select
                        id="category"
                        className="w-full border rounded-lg px-3 py-2"
                        value={formData.categorie}
                        onChange={(e) => setFormData((prev) => ({ ...prev, categorie: e.target.value }))}
                      >
                        {(formData.target === "personnalisation" ? personalizationCategories : menuCategories).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du plat..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.target === "personnalisation" && personalizationCategories.includes(formData.categorie) ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="petit">Prix Petit (f) *</Label>
                          <Input
                            id="petit"
                            type="number"
                            step="0.01"
                            value={formData.petit_prix}
                            onChange={(e) => setFormData((prev) => ({ ...prev, petit_prix: Number(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="moyen">Prix Moyen (f) *</Label>
                          <Input
                            id="moyen"
                            type="number"
                            step="0.01"
                            value={formData.moyen_prix}
                            onChange={(e) => setFormData((prev) => ({ ...prev, moyen_prix: Number(e.target.value) || 0 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grand">Prix Grand (f) *</Label>
                          <Input
                            id="grand"
                            type="number"
                            step="0.01"
                            value={formData.grand_prix}
                            onChange={(e) => setFormData((prev) => ({ ...prev, grand_prix: Number(e.target.value) || 0 }))}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="price">Prix (f) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.prix_base}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, prix_base: Number.parseFloat(e.target.value) || 0 }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Image du plat (optionnel)</Label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Upload className="w-8 h-8 mx-auto text-gray-400" />
                            <p className="text-xs text-gray-500 mt-2">Cliquez pour uploader</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Formats acceptes: JPG, PNG, GIF</p>
                        <p className="text-sm text-gray-500">Taille maximale: 5 MB</p>
                        {imagePreview && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-transparent"
                            onClick={() => {
                              setImagePreview(null)
                              setFormData((prev) => ({ ...prev, image: "" }))
                            }}
                          >
                            Supprimer l&apos;image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.statut === "actif"}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, statut: checked ? "actif" : "inactif" }))
                      }
                    />
                    <Label>Plat actif (visible dans le menu)</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={closeModal}>
                      Annuler
                    </Button>
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>
                      {modalMode === "add" ? "Ajouter" : "Enregistrer"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
