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
  viewportFit: "cover",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = window.localStorage.getItem("trackpaisa-theme") === "dark" ? "dark" : "light";
                  var palette = window.localStorage.getItem("trackpaisa-color-theme") === "colorful" ? "colorful" : "green";
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.dataset.palette = palette;
                  document.documentElement.classList.toggle("dark", theme === "dark");
                  document.documentElement.style.colorScheme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = "light";
                  document.documentElement.dataset.palette = "green";
                  document.documentElement.style.colorScheme = "light";
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
