"use client";

import { useState, useEffect } from "react";
import { User, Mail, Pencil, LogOut, Camera, Save, XCircle, ShieldCheck } from "lucide-react";

interface UserData {
    id?: number;
    name: string;
    email: string;
    role?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>({ name: "Guest", email: "guest@example.com" });
    const [loading, setLoading] = useState(true);

    // ================================ FETCH USER TANPA WAJIB LOGIN ================================
    useEffect(() => {
        const token = localStorage.getItem("token");

        // Jika tidak ada token → tampil mode guest, tanpa redirect login
        if (!token) {
            setUser({ name: "Guest User", email: "No Login Detected" });
            setLoading(false);
            return;
        }

        fetch("http://localhost:8000/api/user", {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                setUser(data.user);
                setFormData(data.user);
            } else {
                setUser({ name: "Guest", email: "guest@example.com" });
            }
        })
        .catch(() => setUser({ name: "Guest", email: "guest@example.com" }))
        .finally(() => setLoading(false));
    }, []);

    // =========================== SIMPAN EDIT (LOCAL SAJA) ===========================
    const handleSave = () => {
        setUser(formData);
        localStorage.setItem("profileUser", JSON.stringify(formData));
        alert("Profil disimpan lokal! (Tidak update DB)");
        setEditing(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        alert("Logout berhasil!");
        location.reload();       // kembali ke Guest Mode
    };

    if (loading) return <p className="text-center py-20 text-lg">Memuat profil...</p>;

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-8 px-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 border-t-8 border-[#234C6A]">

                <div className="flex flex-col items-center border-b pb-6 mb-6">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full bg-[#FF6D1F] flex items-center justify-center text-white text-5xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-[#234C6A]">{user?.name}</h2>

                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-600 rounded-full flex items-center gap-2 text-sm font-medium">
                        <ShieldCheck size={16}/> {user?.name === "Guest User" ? "Guest Mode" : "Akun Terverifikasi"}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#234C6A]">
                    <Pencil size={20}/> Detail Akun {editing && "(Editing)"}
                </h3>

                {["name","email"].map((field) => (
                    <div key={field} className="mb-4">
                        <label className="font-medium">{field === "name" ? "Nama" : "Email"}</label>
                        <input
                            type="text"
                            disabled={!editing}
                            className={`p-3 w-full rounded-xl border mt-1 ${editing ? "border-orange-400" : "bg-gray-200"}`}
                            value={(formData as any)[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        />
                    </div>
                ))}

                <div className="flex flex-col gap-4 mt-6 border-t pt-6">

                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="bg-gray-200 py-3 rounded-xl font-semibold">
                            Edit Profil
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSave} className="bg-green-600 text-white py-3 rounded-xl font-semibold flex justify-center gap-2">
                                <Save size={18}/> Simpan
                            </button>
                            <button onClick={() => setEditing(false)} className="border border-red-400 text-red-500 py-3 rounded-xl">
                                <XCircle size={18}/> Batal
                            </button>
                        </>
                    )}

                    {/* Logout juga aman meski tidak login */}
                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 flex justify-center gap-2 py-3">
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
