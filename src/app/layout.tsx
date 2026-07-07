import type { Metadata, Viewport } from "next";
import { PwaRegistration } from "@/components/layout/pwa-registration";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "TrackPaisa",
  title: "TrackPaisa",
  description: "Track every rupee, without the clutter.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TrackPaisa",
  },
  icons: {
    icon: "/trackpaisa-logo.svg",
    apple: "/trackpaisa-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
