import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hawa Weather — instrumen cuaca",
  description: "Hawa Weather: Instrumen cuaca glassmorphism & visual atmosferik — didukung Open-Meteo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
