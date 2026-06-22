const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: "GET" }, auth),
  post: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, auth),
  patch: <T>(path: string, body: unknown, auth = true) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, auth),
  delete: <T>(path: string, auth = true) => request<T>(path, { method: "DELETE" }, auth),
  postForm: async <T>(path: string, form: FormData): Promise<T> => {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "Request failed");
    }
    return res.json();
  },
};
