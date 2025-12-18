"use client";

import { useEffect, useState } from "react";
import { Plus, X, Edit, Trash, Loader2, RefreshCw, UserCircle, ShieldCheck } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";

// --- INTERFACES ---
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// --- HELPER ---
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

const API_URL = "http://localhost:8000";

export default function ManageUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state (Tambah/Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Modal state (Hapus)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "admin",
  });

  // --- LOGIC FUNCTIONS ---

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getCookie("token");
      const res = await fetch(`${API_URL}/api/staff`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Gagal memuat data (HTTP ${res.status})`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
      alertError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAdd = () => {
    setIsEditing(false);
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", password_confirmation: "", role: "admin" });
    setModalOpen(true);
  };

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

  const openDelete = (u: User) => {
    setToDelete(u);
    setDeleteOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEditingUser(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");

    // Validasi Password
    if (!isEditing || form.password) {
      if (form.password !== form.password_confirmation) {
        alertError("Konfirmasi password tidak cocok!");
        return;
      }
    }

    try {
      let res: Response;
      if (!isEditing) {
        res = await fetch(`${API_URL}/api/staff/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      } else {
        const payload: any = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        res = await fetch(`${API_URL}/api/staff/${editingUser?.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Terjadi kesalahan");
      }

      alertSuccess(isEditing ? "User diperbarui!" : "User berhasil dibuat!");
      closeModal();
      loadUsers();
    } catch (err: any) {
      alertError(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const token = getCookie("token");
    try {
      const res = await fetch(`${API_URL}/api/staff/${toDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      alertSuccess("User berhasil dihapus");
      setDeleteOpen(false);
      loadUsers();
    } catch (err) {
      alertError("Gagal menghapus user");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#234C6A] flex items-center gap-2">
            <UserCircle size={32} /> Manajemen Pengguna
          </h1>
          <p className="text-sm text-gray-500 mt-1">Total {users.length} staff terdaftar</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={openAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FF6D1F] text-white px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition-all font-semibold text-sm shadow-sm"
          >
            <Plus size={18} /> Tambah User
          </button>
          <button 
            onClick={loadUsers} 
            className="p-2.5 rounded-xl border bg-white hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw size={20} />}
          </button>
        </div>
      </div>

      {/* TABLE/CARD CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Staff</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tgl Bergabung</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-gray-200" /></td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-400 font-mono text-xs">#{u.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEdit(u)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all"><Edit size={18}/></button>
                        <button onClick={() => openDelete(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden divide-y divide-gray-100">
          {users.map((u) => (
            <div key={u.id} className="p-4 space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{u.name}</h3>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="text-[10px] font-mono text-gray-300">#{u.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{u.role}</span>
                <span className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(u)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl text-xs font-bold"><Edit size={14}/> Edit</button>
                <button onClick={() => openDelete(u)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-bold"><Trash size={14}/> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative animate-in slide-in-from-bottom duration-300">
            <button className="absolute top-4 right-4 p-2 text-gray-400" onClick={closeModal}><X size={20} /></button>
            <h2 className="text-xl font-bold mb-6 text-[#234C6A]">{isEditing ? "Edit Profil Staff" : "Daftarkan Staff Baru"}</h2>

            <form onSubmit={submitForm} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nama Lengkap</label>
                  <input name="name" value={form.name} onChange={handleInput} className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleInput} className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Role</label>
                  <select name="role" value={form.role} onChange={handleInput} className="w-full border-gray-200 border p-3 rounded-xl bg-white" required>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="kasir">Kasir</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Password {isEditing && "(Kosongkan jika tidak diubah)"}</label>
                  <input name="password" type="password" value={form.password} onChange={handleInput} className="w-full border-gray-200 border p-3 rounded-xl" {...(!isEditing && { required: true })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Konfirmasi Password</label>
                  <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleInput} className="w-full border-gray-200 border p-3 rounded-xl" {...(!isEditing && { required: true })} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors">Batal</button>
                <button type="submit" className="flex-[2] py-3 bg-[#234C6A] text-white rounded-xl font-bold shadow-lg shadow-blue-900/20">
                  {isEditing ? "Update Staff" : "Simpan Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteOpen && toDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Hapus Staff?</h3>
            <p className="text-gray-500 mb-6 text-sm">Akun milik <strong>{toDelete.name}</strong> tidak akan bisa mengakses panel lagi setelah dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-500">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}