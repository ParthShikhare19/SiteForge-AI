"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe, Plus, Edit, ExternalLink, LogOut, Loader2,
  BarChart2, LayoutGrid, TrendingUp, Eye, Monitor, Smartphone, Tablet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listBusinesses } from "@/services/businessService";
import { getDetailedAnalytics, getOverviewAnalytics, type DetailedAnalytics, type OverviewAnalytics } from "@/services/websiteService";
import { logout } from "@/services/authService";
import { getStoredUser, isAuthenticated } from "@/lib/auth";
import type { Business } from "@/types";

type MainTab = "websites" | "analytics";

// ─── Mini analytics panel (shared between overview + per-site) ───────────────
function AnalyticsPanel({ data, title }: { data: DetailedAnalytics | OverviewAnalytics; title: string }) {
  const maxDay = Math.max(...(data.visits_by_day ?? []).map(d => d.count), 1);

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Visits",  value: data.total_visits,       color: "text-purple-400", sub: "all time" },
          { label: "Today",         value: data.visits_today,        color: "text-green-400",  sub: "last 24 h" },
          { label: "This Week",     value: data.visits_this_week,    color: "text-blue-400",   sub: "last 7 days" },
          { label: "Daily Avg",     value: data.avg_daily_visits,    color: "text-amber-400",  sub: "last 30 days" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
        <p className="text-sm font-semibold text-white/70 mb-5">{title} — Last 7 Days</p>
        {(data.visits_by_day?.length ?? 0) > 0 ? (
          <div className="flex items-end gap-2" style={{ height: 96 }}>
            {data.visits_by_day.map(day => {
              const pct = day.count > 0 ? Math.max((day.count / maxDay) * 100, 6) : 2;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-1">
                  {day.count > 0 && <span className="text-[10px] font-semibold text-purple-400">{day.count}</span>}
                  <div className="w-full rounded-t-md transition-all"
                    style={{ height: `${pct}%`, background: day.count > 0 ? "linear-gradient(to top,#7c3aed,#a78bfa)" : "rgba(255,255,255,0.06)" }} />
                  <span className="text-[10px] text-white/25 whitespace-nowrap">{day.date.split(" ")[1]}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-white/25 text-center py-8">No visits yet.</p>
        )}
      </div>

      {/* Device + referrers row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Devices */}
        {data.device_breakdown && (
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white/70 mb-4">Devices</p>
            <div className="space-y-3">
              {(Object.entries(data.device_breakdown) as [string, number][])
                .filter(([, c]) => c > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([dev, cnt]) => {
                  const pct = Math.round((cnt / (data.total_visits || 1)) * 100);
                  const Icon = dev === "mobile" ? Smartphone : dev === "tablet" ? Tablet : Monitor;
                  const color: Record<string, string> = { mobile: "#a78bfa", desktop: "#60a5fa", tablet: "#34d399", unknown: "#6b7280" };
                  return (
                    <div key={dev}>
                      <div className="flex justify-between text-xs mb-1.5 items-center">
                        <span className="flex items-center gap-1.5 text-white/50 capitalize">
                          <Icon className="w-3 h-3" /> {dev}
                        </span>
                        <span className="text-white/60 font-medium">{cnt} <span className="text-white/25">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color[dev] || "#7c3aed" }} />
                      </div>
                    </div>
                  );
                })}
              {Object.values(data.device_breakdown).every(v => v === 0) && (
                <p className="text-sm text-white/25 text-center py-4">No data yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Traffic sources */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white/70 mb-4">Traffic Sources</p>
          {(data.referrer_sources?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {data.referrer_sources.map(r => {
                const icons: Record<string, string> = { google: "G", instagram: "IG", facebook: "FB", twitter: "X", direct: "→", whatsapp: "WA", youtube: "YT", other: "?" };
                return (
                  <div key={r.source} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[9px] font-bold text-white/40 flex-shrink-0">
                      {icons[r.source] ?? r.source.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50 capitalize">{r.source}</span>
                        <span className="text-white/40">{r.count} ({r.percentage}%)</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500/50" style={{ width: `${r.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-white/25 text-center py-4">No data yet.</p>
          )}
        </div>
      </div>

      {/* Hourly heatmap */}
      {data.total_visits > 0 && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white/70 mb-4">Hourly Activity (Last 7 Days)</p>
          <div className="flex items-end gap-0.5" style={{ height: 48 }}>
            {(data.hourly_heatmap ?? []).map(h => {
              const maxH = Math.max(...(data.hourly_heatmap ?? []).map(x => x.count), 1);
              const pct = h.count > 0 ? Math.max((h.count / maxH) * 100, 8) : 3;
              const isDay = h.hour >= 8 && h.hour <= 20;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-full rounded-sm" style={{ height: `${pct}%`, background: h.count > 0 ? (isDay ? "#a78bfa" : "#4f46e5") : "rgba(255,255,255,0.05)" }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-white/25">12 AM</span>
            <span className="text-[10px] text-white/40">Peak: {data.peak_hour}:00</span>
            <span className="text-[10px] text-white/25">11 PM</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const user = getStoredUser();

  const [mainTab, setMainTab] = useState<MainTab>("websites");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics state
  const [selectedSiteId, setSelectedSiteId] = useState<number | "all">("all");
  const [overviewData, setOverviewData] = useState<OverviewAnalytics | null>(null);
  // Per-site cache: business_id → DetailedAnalytics
  const [siteCache, setSiteCache] = useState<Map<number, DetailedAnalytics>>(new Map());
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Guard: redirect unauthenticated users, including BFCache page restores
  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }

    // Fires when the browser restores this page from BFCache (back button after logout)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !isAuthenticated()) router.replace("/login");
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  // Fetch businesses + overview analytics in parallel on mount
  useEffect(() => {
    if (!isAuthenticated()) return;
    Promise.all([listBusinesses(), getOverviewAnalytics()])
      .then(([biz, overview]) => {
        setBusinesses(biz);
        setOverviewData(overview);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  // Load per-site analytics on demand; skip if already cached
  useEffect(() => {
    if (mainTab !== "analytics" || selectedSiteId === "all") return;
    const id = selectedSiteId as number;
    if (siteCache.has(id)) return;
    setAnalyticsLoading(true);
    getDetailedAnalytics(id)
      .then(data => setSiteCache(prev => new Map(prev).set(id, data)))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, [mainTab, selectedSiteId, siteCache]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="bg-[#050510] min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
      </div>
    );
  }

  const published = businesses.filter(b => b.is_published).length;
  const activeAnalyticsData: DetailedAnalytics | null =
    selectedSiteId === "all"
      ? (overviewData as DetailedAnalytics | null)
      : siteCache.get(selectedSiteId as number) ?? null;
  const activeTitle = selectedSiteId === "all"
    ? "All Websites"
    : businesses.find(b => b.id === selectedSiteId)?.name ?? "Website";
  const isAnalyticsLoading =
    analyticsLoading ||
    (selectedSiteId !== "all" && !siteCache.has(selectedSiteId as number) && mainTab === "analytics");

  return (
    <div className="bg-[#050510] min-h-screen">

      {/* ── Header ── */}
      <header className="bg-[#050510]/90 backdrop-blur-xl border-b border-white/6 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">SiteForge AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/30 hidden sm:block">
              {user?.name || user?.email?.split("@")[0]}
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white/60 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Top tabs ── */}
      <div className="border-b border-white/6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0">
            {(["websites", "analytics"] as MainTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                  mainTab === tab
                    ? "border-purple-500 text-white"
                    : "border-transparent text-white/35 hover:text-white/60"
                }`}
              >
                {tab === "websites"
                  ? <LayoutGrid className="w-3.5 h-3.5" />
                  : <BarChart2 className="w-3.5 h-3.5" />}
                {tab === "websites" ? "Websites" : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ══════════════ WEBSITES TAB ══════════════ */}
        {mainTab === "websites" && (
          <>
            <div className="flex items-center justify-between mb-7">
              <div>
                <h1 className="text-xl font-bold text-white">My Websites</h1>
                <p className="text-white/30 text-sm mt-0.5">
                  {businesses.length === 0 ? "No websites yet" : `${published} of ${businesses.length} live`}
                </p>
              </div>
              <Link href="/create-business">
                <Button className="bg-purple-600 hover:bg-purple-500 rounded-xl h-9 px-4 text-sm font-medium shadow-lg shadow-purple-500/15">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> New Website
                </Button>
              </Link>
            </div>

            {businesses.length === 0 ? (
              <div className="border border-dashed border-white/8 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-white/25" />
                </div>
                <h3 className="font-semibold text-white mb-1.5">No websites yet</h3>
                <p className="text-white/30 text-sm mb-6 max-w-xs leading-relaxed">
                  Create your first business website using voice or text — it takes under 3 minutes.
                </p>
                <Link href="/create-business">
                  <Button className="bg-purple-600 hover:bg-purple-500 rounded-xl h-9 px-5 text-sm font-medium">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Create your first website
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {businesses.map(b => (
                  <div key={b.id}
                    className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/14 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                          {b.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold leading-tight">{b.name}</p>
                          <p className="text-white/30 text-xs capitalize mt-0.5">{b.category}</p>
                        </div>
                      </div>
                      {b.is_published ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-400 bg-green-500/10 border border-green-500/15 rounded-full px-2.5 py-0.5 flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-white/25 bg-white/4 border border-white/8 rounded-full px-2.5 py-0.5 flex-shrink-0">Draft</span>
                      )}
                    </div>

                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2 flex-1">
                      {b.description || "No description added yet."}
                    </p>
                    <p className="text-purple-400/40 text-[11px] font-mono truncate">/sites/{b.slug}</p>

                    <div className="flex gap-2 pt-1 border-t border-white/5">
                      <Link href={`/editor?business_id=${b.id}`} className="flex-1">
                        <Button variant="ghost" size="sm"
                          className="w-full h-8 text-xs text-white/40 hover:text-white hover:bg-white/6 rounded-lg">
                          <Edit className="w-3 h-3 mr-1.5" /> Edit
                        </Button>
                      </Link>
                      {b.is_published ? (
                        <Link href={`/sites/${b.slug}`} target="_blank" className="flex-1">
                          <Button size="sm"
                            className="w-full h-8 text-xs bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg shadow-none border-0">
                            <ExternalLink className="w-3 h-3 mr-1.5" /> View
                          </Button>
                        </Link>
                      ) : (
                        <div className="flex-1">
                          <Button size="sm" disabled
                            className="w-full h-8 text-xs rounded-lg opacity-20">
                            <ExternalLink className="w-3 h-3 mr-1.5" /> View
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════ ANALYTICS TAB ══════════════ */}
        {mainTab === "analytics" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" /> Analytics
                </h1>
                <p className="text-white/30 text-sm mt-0.5">Track visits across all your websites</p>
              </div>

              {/* Website selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedSiteId("all")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    selectedSiteId === "all"
                      ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/15"
                      : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> All Websites
                </button>
                {businesses.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedSiteId(b.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium border transition-all max-w-[160px] ${
                      selectedSiteId === b.id
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/15"
                        : "bg-white/[0.03] border-white/8 text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {isAnalyticsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : activeAnalyticsData ? (
              <>
                <AnalyticsPanel data={activeAnalyticsData} title={activeTitle} />

                {/* Per-site breakdown (only in All Websites view) */}
                {selectedSiteId === "all" && overviewData && overviewData.per_site.length > 0 && (
                  <div className="mt-4 bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                    <p className="text-sm font-semibold text-white/70 mb-4">Per-Website Breakdown</p>
                    <div className="space-y-3">
                      {overviewData.per_site
                        .sort((a, b) => b.total_visits - a.total_visits)
                        .map(site => {
                          const pct = overviewData.total_visits > 0
                            ? Math.round((site.total_visits / overviewData.total_visits) * 100)
                            : 0;
                          return (
                            <div key={site.business_id}>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-2 text-white/60">
                                  <span className="w-5 h-5 rounded-lg bg-purple-500/15 border border-purple-500/20 inline-flex items-center justify-center text-purple-300 font-bold text-[10px] flex-shrink-0">
                                    {site.name.charAt(0).toUpperCase()}
                                  </span>
                                  {site.name}
                                </span>
                                <span className="text-white/40">
                                  {site.total_visits} total · {site.visits_today} today
                                </span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-purple-500/50" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-white/25">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No analytics data yet.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
