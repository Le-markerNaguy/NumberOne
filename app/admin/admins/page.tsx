"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminsApi, rolesApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Shield, Plus, Trash2, Copy } from "lucide-react";

export default function AdminsPage() {
  const { role, isLoading } = useAuth();
  const { toast } = useToast();

  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    mot_de_passe: "",
    role_id: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [aRes, rRes] = await Promise.all([
        adminsApi.getAll(),
        rolesApi.getAll(),
      ]);
      if (aRes.success && aRes.data) setAdmins(aRes.data);
      if (rRes.success && rRes.data) setRoles(rRes.data);
      setLoading(false);
    };
    load();
  }, []);

  // Only superadmin can access this page
  if (isLoading) return null;
  if (role !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Acces refuse</h1>
        <p className="text-gray-500">
          Seul le super administrateur peut acceder a cette page.
        </p>
      </div>
    );
  }

  const createAdmin = async () => {
    if (!form.nom || !form.email || !form.mot_de_passe) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }
    const res = await adminsApi.create({
      nom: form.nom,
      email: form.email,
      mot_de_passe: form.mot_de_passe,
      role_id: form.role_id,
    });
    if (res.success && res.data) {
      setAdmins((prev) => [res.data!, ...prev]);
      setShowCreate(false);
      toast({
        title: "Succes",
        description: "Administrateur cree avec succes",
      });
      setForm({ nom: "", email: "", mot_de_passe: "", role_id: "" });
    } else {
      toast({
        title: "Erreur",
        description: res.error || "Impossible de creer l'admin",
      });
    }
  };

  const removeAdmin = async (id: string) => {
    if (!confirm("Supprimer cet administrateur ?")) return;
    const res = await adminsApi.delete(id);
    if (res.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Supprime", description: "Administrateur supprime" });
    } else {
      toast({ title: "Erreur", description: res.error });
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
      title: "Copie",
      description: "Email copie dans le presse-papiers",
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Gestion des administrateurs
          </h1>
          <p className="text-gray-500">
            Creer, modifier ou supprimer des administrateurs et leur role
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setShowCreate(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel administrateur
        </Button>
      </div>

      {/* Create Admin Form */}
      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Creer un administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Nom *"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
              <Input
                placeholder="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="relative">
                <Input
                  placeholder="Mot de passe *"
                  type={showPassword ? "text" : "password"}
                  value={form.mot_de_passe}
                  onChange={(e) =>
                    setForm({ ...form, mot_de_passe: e.target.value })
                  }
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <select
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                className="p-2 rounded border bg-white"
              >
                <option value="">Aucun role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={createAdmin}
              >
                Creer
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admins List */}
      <Card>
        <CardHeader>
          <CardTitle>Administrateurs ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 font-medium">
                        {admin.nom?.substring(0, 2).toUpperCase() || "AD"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {admin.nom}
                      </div>
                      <div className="text-xs text-gray-500">{admin.email}</div>
                      <div className="text-xs text-orange-500 capitalize">
                        {admin.role || "admin"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => copyEmail(admin.email)}
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </Button>
                    {admin.role !== "superadmin" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeAdmin(admin.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Roles disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div key={r.id} className="p-4 border rounded-lg">
                <h3 className="font-medium text-gray-900">{r.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.permissions.map((p: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-100 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
