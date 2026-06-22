import { api } from "@/lib/api";
import type { Website, PublicWebsite, WebsiteJSON } from "@/types";

export async function getMyWebsite(businessId: number): Promise<Website | null> {
  try {
    return await api.get<Website>(`/website/business/${businessId}`);
  } catch {
    return null;
  }
}

export async function generateWebsite(businessId: number, templateId: string): Promise<Website> {
  return api.post<Website>("/website/generate", {
    business_id: businessId,
    template_id: templateId,
  });
}

export async function getPublicWebsite(slug: string): Promise<PublicWebsite> {
  return api.get<PublicWebsite>(`/website/${slug}`, false);
}

export async function editWebsite(businessId: number, instruction: string): Promise<Website> {
  return api.post<Website>("/website/edit", {
    business_id: businessId,
    instruction,
  });
}

export async function publishWebsite(businessId: number): Promise<Website> {
  return api.post<Website>(`/website/publish/${businessId}`, {});
}

export async function unpublishWebsite(businessId: number): Promise<Website> {
  return api.post<Website>(`/website/unpublish/${businessId}`, {});
}

export async function updateWebsiteField(
  businessId: number,
  section: string,
  field: string,
  value: unknown,
): Promise<Website> {
  return api.patch<Website>("/website/field", { business_id: businessId, section, field, value });
}

export async function updateProduct(
  businessId: number,
  productId: string,
  updates: { name?: string; description?: string; price?: number | null; badge?: string; image_url?: string },
): Promise<Website> {
  return api.patch<Website>("/website/product", { business_id: businessId, product_id: productId, ...updates });
}

export async function uploadImage(businessId: number, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const result = await api.postForm<{ url: string }>(`/website/upload-image/${businessId}`, form);
  return result.url;
}

export interface VisitDay {
  date: string;
  count: number;
}

export interface AnalyticsData {
  total_visits: number;
  visits_today: number;
  visits_this_week: number;
  visits_by_day: VisitDay[];
}

export interface ReferrerSource {
  source: string;
  count: number;
  percentage: number;
}

export interface HourlyBucket {
  hour: number;
  count: number;
}

export interface DetailedAnalytics extends AnalyticsData {
  visits_by_day_30: VisitDay[];
  device_breakdown: { mobile: number; desktop: number; tablet: number; unknown: number };
  referrer_sources: ReferrerSource[];
  hourly_heatmap: HourlyBucket[];
  peak_hour: number;
  avg_daily_visits: number;
}

export async function getAnalytics(businessId: number): Promise<AnalyticsData> {
  return api.get<AnalyticsData>(`/website/analytics/${businessId}`);
}

export async function getDetailedAnalytics(businessId: number): Promise<DetailedAnalytics> {
  return api.get<DetailedAnalytics>(`/website/analytics/${businessId}/detailed`);
}

export interface SiteOverviewEntry {
  business_id: number;
  name: string;
  category: string;
  slug: string;
  total_visits: number;
  visits_today: number;
}

export interface OverviewAnalytics extends DetailedAnalytics {
  per_site: SiteOverviewEntry[];
}

export async function getOverviewAnalytics(): Promise<OverviewAnalytics> {
  return api.get<OverviewAnalytics>("/website/analytics/overview");
}

export interface EditHistoryEntry {
  index: number;
  instruction: string;
  saved_at: string;
}

export async function getEditHistory(businessId: number): Promise<EditHistoryEntry[]> {
  return api.get<EditHistoryEntry[]>(`/website/history/${businessId}`);
}

export async function undoLastEdit(businessId: number): Promise<Website> {
  return api.post<Website>(`/website/undo/${businessId}`, {});
}
