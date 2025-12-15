"use client";

import { useState, useEffect } from "react";
import { User, Mail, Pencil, LogOut, Save, XCircle, ShieldCheck } from "lucide-react";
import { alertSuccess, alertError, alertLoginRequired } from "@/components/Alert";

interface UserData {
    id?: number;
    name: string;
    email: string;
    role?: string;
}

// Fungsi helper cookie
const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<UserData>({ name: "Guest", email: "guest@example.com" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cookieUser = getCookie("user");
        const token = getCookie("token");

        if (cookieUser) {
            const parsed = JSON.parse(cookieUser);
            setUser(parsed);
            setFormData(parsed);
        } else if (token) {
            fetch("http://localhost:8000/api/user", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(r=>r.json())
            .then(d=>{
                setUser(d.user ?? {name:"Guest", email:"guest@example.com"});
                setFormData(d.user ?? {name:"Guest", email:"guest@example.com"});
            })
            .catch(()=> setUser({name:"Guest User", email:"No Login Detected"}));
        } else {
            setUser({name:"Guest User", email:"No Login Detected"});
        }
        setLoading(false);
    }, []);

    const handleSave = () => {
        setUser(formData);
        alertSuccess("Profil disimpan lokal (tidak update DB)");
        setEditing(false);
    };

    const handleLogout = () => {
        document.cookie="token=; path=/; max-age=0";
        document.cookie="user=; path=/; max-age=0";
        setUser({ name:"Guest User", email:"No Login Detected"});
        setEditing(false);
        alertSuccess("Logout berhasil!");
    };

    if (loading) return <p className="text-center py-20 text-lg">Memuat profil...</p>;

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center py-10 px-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 border-t-8 border-[#234C6A]">

                {/* Avatar */}
                <div className="flex flex-col items-center border-b pb-6 mb-6">
                    <div className="w-28 h-28 rounded-full bg-[#FF6D1F] flex items-center justify-center text-white text-5xl font-bold shadow-md">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <h2 className="text-3xl font-extrabold text-gray-900 mt-3 tracking-wide">
                        {user?.name}
                    </h2>

                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck size={16}/> {user?.name === "Guest User" ? "Guest Mode" : "Akun Terverifikasi"}
                    </div>
                </div>

                {/* Detail */}
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#234C6A]">
                    <Pencil size={20}/> Informasi Akun
                </h3>

                {["name","email"].map((field)=>(
                    <div key={field} className="mb-4 font-semibold text-gray-900">
                        <label className="block mb-1 text-gray-700 font-bold">
                            {field === "name" ? "Nama Lengkap" : "Email"}
                        </label>

                        <input
                            type="text"
                            disabled={!editing}
                            value={(formData as any)[field]}
                            onChange={(e)=>setFormData({...formData,[field]:e.target.value})}
                            className={`p-3 w-full rounded-xl border text-gray-900
                                ${editing ? "border-[#FF6D1F] bg-white shadow-sm" : "bg-gray-100 border-gray-300 cursor-not-allowed"}`}
                        />
                    </div>
                ))}

                {/* Tombol */}
                <div className="flex flex-col gap-3 mt-6 border-t pt-6">

                    {!editing ? (
                        <button onClick={()=>setEditing(true)}
                            className="py-3 rounded-xl font-bold bg-[#234C6A] text-white hover:bg-[#1c3d54] transition">
                            Edit Profil
                        </button>
                    ) : (
                        <>
                            <button onClick={handleSave}
                                className="py-3 rounded-xl font-bold bg-green-600 text-white flex justify-center gap-2 hover:bg-green-700 transition">
                                <Save size={18}/> Simpan Perubahan
                            </button>

                            <button onClick={()=>setEditing(false)}
                                className="py-3 rounded-xl font-bold text-red-600 border border-red-400 hover:bg-red-50 transition flex justify-center gap-2">
                                <XCircle size={18}/> Batal
                            </button>
                        </>
                    )}

                    <button onClick={handleLogout}
                        className="py-3 rounded-xl font-semibold text-gray-600 hover:text-red-600 flex gap-2 justify-center transition">
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
