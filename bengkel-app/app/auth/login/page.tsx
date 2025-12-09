"use client";

import { useState } from "react";

// --- MOCK IKON LUCID ---
const EyeIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a1.8 1.8 0 0 1 .32-.69M14.93 11.23a3 3 0 1 1-3.6-3.6M12 9a3 3 0 0 0-3 3M1 1l22 22"/></svg>;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal login. Periksa email dan password.");
        return;
      }

      // ============================
      //   SIMPAN TOKEN KE COOKIES
      // ============================
      document.cookie = `token=${data.token}; path=/;`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.user))}; path=/;`;

      // ============================
      //       PENENTUAN ROLE
      // ============================
      const userRole = data.user.role;
      let redirectPath = "/";

      if (userRole === "super_admin" || userRole === "admin") {
        redirectPath = "/admin/dashboard";
      }

      // ============================
      //       REDIRECT PAKSA
      // ============================
      setTimeout(() => {
        window.location.assign(redirectPath);
      }, 50);

    } catch (err) {
      setError("Terjadi kesalahan jaringan. Pastikan Laravel berjalan.");
      console.error("Login Error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6">Masuk ke Sistem</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 mb-4 rounded-lg text-sm">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
