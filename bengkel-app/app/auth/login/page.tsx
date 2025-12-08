"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: any) => {
        e.preventDefault(); // HENTIKAN AUTO REFRESH

        setError("");

        try {
            const res = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
                return;
            }

            // Simpan token ke localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect ke dashboard
            window.location.href = "/dashboard";

        } catch (err: any) {
            setError("Terjadi kesalahan server");
        }
    };

    return (
        <div className="p-10 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Login</h1>

            {error && (
                <p className="text-red-500 bg-red-100 p-2 mb-3 rounded">{error}</p>
            )}

            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label>Email</label>
                    <input
                        type="email"
                        className="border p-2 w-full"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label>Password</label>
                    <input
                        type="password"
                        className="border p-2 w-full"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
