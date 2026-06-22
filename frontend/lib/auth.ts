import type { User } from "@/types";

export function saveAuth(token: string, user: User) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}
