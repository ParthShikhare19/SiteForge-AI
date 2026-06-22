import { api } from "@/lib/api";
import { saveAuth, clearAuth } from "@/lib/auth";
import type { AuthToken } from "@/types";

export async function register(email: string, password: string): Promise<AuthToken> {
  const data = await api.post<AuthToken>("/auth/register", { email, password }, false);
  saveAuth(data.access_token, data.user);
  return data;
}

export async function login(email: string, password: string): Promise<AuthToken> {
  const data = await api.post<AuthToken>("/auth/login", { email, password }, false);
  saveAuth(data.access_token, data.user);
  return data;
}

export function logout() {
  clearAuth();
}
