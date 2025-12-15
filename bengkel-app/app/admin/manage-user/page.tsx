"use client";

import { useEffect, useState } from "react";
import { Plus, X, Edit, Trash, Loader2 } from "lucide-react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

const API_URL = "http://localhost:8000";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function ManageUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // modal state (reuse for add & edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  // form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin",
  });

  // load users
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getCookie("token");
      if (!token) {
        alertError("Token tidak ditemukan di cookie.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/staff`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
      alertError(err.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // open add modal
  const openAdd = () => {
    setIsEditing(false);
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "admin",
    });
    setModalOpen(true);
  };

  // open edit modal
  const openEdit = (u: User) => {
    setIsEditing(true);
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      password_confirmation: "",
      role: u.role,
    });
    setModalOpen(true);
  };

  // close modal
  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingUser(null);
  };

  // handle form input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // submit (create or update)
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");
    if (!token) {
      alertError("Token tidak ditemukan. Silakan login ulang.");
      return;
    }

    // basic validation: passwords match when creating or when user changed it on edit
    if (!isEditing) {
      if (!form.password || form.password !== form.password_confirmation) {
        alertError("Password kosong atau konfirmasi password tidak cocok.");
        return;
      }
    } else {
      // editing: if password fields filled, require match
      if (form.password || form.password_confirmation) {
        if (form.password !== form.password_confirmation) {
          alertError("Password dan konfirmasi tidak cocok.");
          return;
        }
      }
    }

    try {
      let res: Response;
      if (!isEditing) {
        // create: POST /api/staff/register
        res = await fetch(`${API_URL}/api/staff/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      } else {
        // update: PUT /api/staff/{id}
        // NOTE: backend must implement this route. If not present, return error.
        if (!editingUser) {
          alertError("Tidak ada user yang diedit.");
          return;
        }
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        // only send password if user provided one
        if (form.password) payload.password = form.password;

        res = await fetch(`${API_URL}/api/staff/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        // show server message if available
        const msg = data?.message || JSON.stringify(data) || `HTTP ${res.status}`;
        alertError("Gagal: " + msg);
        return;
      }

      alertSuccess(isEditing ? "User berhasil diperbarui." : "User berhasil dibuat.");
      closeModal();
      loadUsers();
    } catch (err: any) {
      console.error(err);
      alertError("Terjadi kesalahan saat menyimpan user.");
    }
  };

  // open delete popup
  const openDelete = (u: User) => {
    setToDelete(u);
    setDeleteOpen(true);
  };

  // cancel delete
  const cancelDelete = () => {
    setToDelete(null);
    setDeleteOpen(false);
  };

  // confirm delete
  const confirmDelete = async () => {
    if (!toDelete) return;
    const token = getCookie("token");
    if (!token) {
      alertError("Token tidak ditemukan.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/staff/${toDelete.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        alertError(data?.message || `Gagal hapus (HTTP ${res.status})`);
        return;
      }
      alertSuccess("User berhasil dihapus.");
      cancelDelete();
      loadUsers();
    } catch (err) {
      console.error(err);
      alertError("Terjadi kesalahan saat menghapus.");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#234C6A]">👥 Manajemen Pengguna</h1>
        <div className="flex gap-2">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#FF6D1F] text-white px-4 py-2 rounded-lg hover:bg-[#e65a10]"
          >
            <Plus size={16} /> Tambah
          </button>
          <button onClick={loadUsers} className="px-4 py-2 rounded border">
            {loading ? <Loader2 className="animate-spin" /> : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">ID</th>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Dibuat</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Tidak ada pengguna.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">#{u.id}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-2"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => openDelete(u)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash size={14} /> Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-3 right-3" onClick={closeModal}>
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-3">{isEditing ? "Edit Pengguna" : "Tambah Pengguna"}</h2>

            <form onSubmit={submitForm} className="space-y-3">
              <div>
                <label className="block text-sm">Nama</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInput}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm">Role</label>
                <select name="role" value={form.role} onChange={handleInput} className="w-full border p-2 rounded" required>
                  <option value="">-- Pilih role --</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="kasir">Kasir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm">Password {isEditing ? "(kosongkan jika tidak diubah)" : ""}</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInput}
                  className="w-full border p-2 rounded"
                  {...(!isEditing && { required: true })}
                />
              </div>

              <div>
                <label className="block text-sm">Konfirmasi Password</label>
                <input
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={handleInput}
                  className="w-full border p-2 rounded"
                  {...(!isEditing && { required: true })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-300">Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                  {isEditing ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteOpen && toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-2">Hapus Pengguna</h3>
            <p className="mb-4">Yakin ingin menghapus <strong>{toDelete.name}</strong>?</p>
            <div className="flex justify-center gap-3">
              <button onClick={cancelDelete} className="px-4 py-2 rounded bg-gray-300">Batal</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
