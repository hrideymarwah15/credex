import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "SpendLens — Audit your AI tool spend in 90 seconds",
  description:
    "Free audit for startups overpaying on Cursor, Copilot, Claude, ChatGPT, and API bills. See exactly where to cut without losing capability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.05)_0%,_transparent_50%)] pointer-events-none" aria-hidden="true" />
          <div className="relative z-10 flex flex-col min-h-full">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
