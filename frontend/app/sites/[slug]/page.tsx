import { notFound } from "next/navigation";
import RetailStore from "@/components/templates/RetailStore";
import Restaurant from "@/components/templates/Restaurant";
import Bakery from "@/components/templates/Bakery";
import TrackVisit from "./TrackVisit";
import type { PublicWebsite } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchSite(slug: string): Promise<PublicWebsite | null> {
  try {
    const res = await fetch(`${API_URL}/website/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await fetchSite(slug);

  if (!site) return notFound();

  const props = { data: site.website_json, businessName: site.business.name };

  return (
    <>
      <TrackVisit slug={slug} />
      {site.template_id === "restaurant" ? <Restaurant {...props} /> :
       site.template_id === "bakery" ? <Bakery {...props} /> :
       <RetailStore {...props} />}
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await fetchSite(slug);
  const logoUrl = site?.website_json.logo_url ?? null;
  const seoTitle = site?.website_json.seo_title || site?.business.name || "Business Website";
  const seoDesc = site?.website_json.seo_description || site?.website_json.about?.content || "";
  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: { title: seoTitle, description: seoDesc },
    ...(logoUrl && {
      icons: {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      },
    }),
  };
}
