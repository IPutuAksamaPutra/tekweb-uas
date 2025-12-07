import { useEffect, useState } from "react";
import { apiFetch } from "@/api/api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    return apiFetch("/login", { method: "POST", body: { email, password } });
  }
  async function logout() {
    return apiFetch("/logout", { method: "POST" }).then(() => setUser(null));
  }

  return { user, loading, login, logout };
}