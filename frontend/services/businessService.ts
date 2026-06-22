import { api } from "@/lib/api";
import type { Business } from "@/types";

export async function deleteBusiness(businessId: number): Promise<void> {
  await api.delete(`/business/${businessId}`);
}

export async function createBusiness(data: {
  name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  timings?: string;
}): Promise<Business> {
  return api.post<Business>("/business/create", data);
}

export async function transcribeText(transcript: string): Promise<{
  business: Business;
  extracted: Record<string, unknown>;
}> {
  return api.post("/business/transcribe", { transcript });
}

export async function transcribeAudio(audioBlob: Blob): Promise<{
  business: Business;
  extracted: Record<string, unknown>;
}> {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.webm");
  return api.postForm("/business/transcribe-audio", form);
}

export async function listBusinesses(): Promise<Business[]> {
  return api.get<Business[]>("/business/list");
}
