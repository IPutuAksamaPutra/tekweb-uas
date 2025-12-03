// frontend/api/route.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string,string>;
  credentials?: RequestCredentials;
};

export async function apiFetch(path: string, opts: FetchOptions = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const { method = "GET", body, headers = {}, credentials = "include" } = opts;

  const res = await fetch(url, {
    method,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // baca body jika ada message
    let text = await res.text().catch(() => "");
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || `API error ${res.status}`);
    } catch {
      throw new Error(text || `API error ${res.status}`);
    }
  }

  // jika respons kosong, return null
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}
