"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Edit, Trash, Loader2, RefreshCw, UserCircle } from "lucide-react";
import { alertSuccess, alertError } from "@/components/Alert";
import { useRouter } from "next/navigation";

// --- INTERFACES ---
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tekweb-uas-production.up.railway.app";

export default function ManageUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMount, setIsMount] = useState(false);

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

  // --- HELPER: AMBIL TOKEN (DIPERKUAT) ---
  const getToken = useCallback((): string | null => {
    if (typeof document === "undefined") return null;
    const name = "token=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return null;
  }, []);

  // --- LOGIC: LOAD DATA ---
  const loadUsers = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      console.warn("Token belum siap atau tidak ditemukan");
      // Jangan langsung alertError di sini agar tidak spam saat refresh
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/staff`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        alertError("Sesi telah berakhir. Silakan login kembali.");
        router.push("/auth/login");
        return;
      }

      if (!res.ok) throw new Error(`Gagal memuat data (HTTP ${res.status})`);
      const data = await res.json();
      setUsers(data.users || data.data || []);
    } catch (err: any) {
      alertError(err.message || "Gagal memuat daftar staff");
    } finally {
      setLoading(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    setIsMount(true);
    // Berikan delay 150ms agar browser selesai memproses cookie sebelum dibaca
    const timer = setTimeout(() => {
      loadUsers();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  // --- MODAL HANDLERS ---
  const openAdd = () => {
    setIsEditing(false);
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

  // --- LOGIC: SUBMIT & DELETE ---
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();

    if (!token) {
        alertError("Sesi hilang, silakan login ulang.");
        return;
    }

    if (!isEditing || form.password) {
      if (form.password !== form.password_confirmation) {
        return alertError("Konfirmasi password tidak cocok!");
      }
    }

    try {
      let res: Response;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (!isEditing) {
        res = await fetch(`${API_URL}/api/staff/register`, {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
      } else {
        const payload: any = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        res = await fetch(`${API_URL}/api/staff/${editingUser?.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Terjadi kesalahan server");

      alertSuccess(isEditing ? "User berhasil diperbarui!" : "User baru terdaftar!");
      closeModal();
      loadUsers();
    } catch (err: any) {
      alertError(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const token = getToken();
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

  if (!isMount) return null;

  return (
    <div className="p-4 md:p-10 space-y-8 max-w-7xl mx-auto pb-24 bg-gray-50 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#234C6A] text-white rounded-2xl shadow-lg">
            <UserCircle size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#234C6A] tracking-tighter uppercase italic">Manajemen Staff</h1>
            <p className="text-sm text-gray-500 font-medium">Total {users.length} personil terdaftar</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={openAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FF6D1F] text-white px-6 py-3 rounded-2xl hover:bg-orange-600 transition-all font-black uppercase text-xs tracking-widest shadow-lg active:scale-95"
          >
            <Plus size={20} /> Tambah User
          </button>
          <button 
            onClick={loadUsers} 
            className="p-3 rounded-2xl border-2 border-gray-200 bg-white hover:border-[#234C6A] transition-all text-gray-400 shadow-sm"
          >
            <RefreshCw size={24} className={loading ? "animate-spin text-[#234C6A]" : ""} />
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-4xl shadow-xl shadow-blue-900/5 border-2 border-gray-100 overflow-hidden">
        
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b-2 border-gray-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Staff</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Informasi Dasar</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Jabatan / Role</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Bergabung</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-orange-500" size={40} /></td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 text-gray-300 font-black text-xs">#{u.id}</td>
                    <td className="p-6">
                      <p className="font-black text-[#234C6A] text-lg uppercase italic tracking-tighter">{u.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6 text-sm font-bold text-gray-500 italic">
                      {new Date(u.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEdit(u)} className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 border border-amber-100 transition-all shadow-sm"><Edit size={18}/></button>
                        <button onClick={() => openDelete(u)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition-all shadow-sm"><Trash size={18}/></button>
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
            <div key={u.id} className="p-6 space-y-4 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-[#234C6A] text-xl leading-tight uppercase italic">{u.name}</h3>
                  <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                </div>
                <span className="text-[10px] font-black text-gray-200">#{u.id}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <span className="px-3 py-1 bg-white border border-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">{u.role}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase italic">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => openEdit(u)} className="flex-1 py-4 bg-amber-50 text-amber-700 rounded-2xl text-xs font-black uppercase border border-amber-100"><Edit size={16} className="inline mr-1"/> Edit</button>
                <button onClick={() => openDelete(u)} className="flex-1 py-4 bg-red-50 text-red-700 rounded-2xl text-xs font-black uppercase border border-red-100"><Trash size={16} className="inline mr-1"/> Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FORM */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#234C6A]/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-4xl sm:rounded-4xl p-8 relative animate-in slide-in-from-bottom duration-300 border-t-8 border-[#FF6D1F]">
            <button className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors" onClick={closeModal}><X size={24} /></button>
            <h2 className="text-2xl font-black mb-8 text-[#234C6A] uppercase tracking-tighter italic">
                {isEditing ? "Update Data Staff" : "Daftarkan Staff Baru"}
            </h2>

            <form onSubmit={submitForm} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama Lengkap</label>
                <input name="name" value={form.name} onChange={handleInput} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#234C6A] p-4 rounded-2xl font-bold text-slate-800 outline-none transition-all" required placeholder="Contoh: Budi Santoso" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Email Address</label>
                      <input name="email" type="email" value={form.email} onChange={handleInput} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#234C6A] p-4 rounded-2xl font-bold text-slate-800 outline-none transition-all" required placeholder="email@bengkel.com" />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Otoritas / Role</label>
                      <select name="role" value={form.role} onChange={handleInput} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#234C6A] p-4 rounded-2xl font-bold text-slate-800 outline-none transition-all appearance-none cursor-pointer" required>
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="kasir">Kasir</option>
                      </select>
                  </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Katasandi {isEditing && "(Kosongkan jika tidak diubah)"}</label>
                <input name="password" type="password" value={form.password} onChange={handleInput} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#234C6A] p-4 rounded-2xl font-bold text-slate-800 outline-none" {...(!isEditing && { required: true })} placeholder="••••••••" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Ulangi Katasandi</label>
                <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleInput} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#234C6A] p-4 rounded-2xl font-bold text-slate-800 outline-none" {...(!isEditing && { required: true })} placeholder="••••••••" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Batal</button>
                <button type="submit" className="flex-2 px-8 py-4 bg-[#234C6A] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all">
                  {isEditing ? "Simpan Perubahan" : "Daftarkan Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteOpen && toDelete && (
        <div className="fixed inset-0 bg-[#234C6A]/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl p-10 w-full max-w-sm text-center shadow-2xl border-t-8 border-red-500 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><Trash size={32} /></div>
            <h3 className="text-2xl font-black mb-2 text-[#234C6A] uppercase tracking-tighter italic">Hapus Personil?</h3>
            <p className="text-gray-400 mb-8 text-sm font-medium">Akun milik <strong>{toDelete.name}</strong> akan dihapus permanen dari sistem.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteOpen(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 font-black text-gray-400 uppercase text-xs">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-xs active:scale-95 transition-all shadow-lg shadow-red-100">Hapus Sekarang</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}