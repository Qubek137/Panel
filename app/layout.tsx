import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false, // Dla eksportu statycznego
})

export const metadata: Metadata = {
  title: "Panel Sterowania - Wieluń (Offline)",
  description: "Mobilny panel sterowania z pogodą dla regionu Wieluń. Działa offline bez potrzeby serwera.",
  keywords: "panel sterowania, pogoda, Wieluń, mobile, offline, static",
  authors: [{ name: "Panel Control System" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Panel Sterowania",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  generator: "Next.js Static Export",
  applicationName: "Panel Sterowania Offline",
  referrer: "origin-when-cross-origin",
  creator: "Panel Control System",
  publisher: "Panel Control System",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" className="h-full">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Panel Sterowania" />
        <meta name="application-name" content="Panel Sterowania" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Preload critical resources */}
        <link rel="preload" href="./globals.css" as="style" />

        {/* Offline manifest */}
        <link rel="manifest" href="./manifest.json" />

        {/* Favicon for offline use */}
        <link rel="icon" type="image/x-icon" href="./favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
      </head>
      <body className={`${inter.className} h-full overflow-hidden`}>
        <noscript>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#3b82f6",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            Ta aplikacja wymaga JavaScript do działania.
            <br />
            Włącz JavaScript w swojej przeglądarce.
            <br />
            <small style={{ marginTop: "20px", opacity: 0.8 }}>
              Aplikacja działa offline - nie potrzebuje internetu.
            </small>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  )
}
