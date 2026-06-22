import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleProvider from "@/components/GoogleProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiteForge AI — Build Your Business Website in Minutes",
  description: "Create your business website using voice or text in minutes. Free. No coding required.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleProvider>{children}</GoogleProvider>
      </body>
    </html>
  );
}
