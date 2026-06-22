"use client";
import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TrackVisit({ slug }: { slug: string }) {
  useEffect(() => {
    // Skip tracking when loaded inside the editor preview iframe
    if (new URLSearchParams(window.location.search).get("preview") === "1") return;
    fetch(`${API_URL}/website/visit/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referrer: document.referrer || "" }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
