import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrackPaisa",
    short_name: "TrackPaisa",
    description: "Track every rupee, without the clutter.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#166534",
    orientation: "portrait",
    categories: ["finance", "productivity"],
    icons: [
      {
        src: "/trackpaisa-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Add transaction",
        short_name: "Add",
        description: "Record income or expense quickly.",
        url: "/transactions/new",
        icons: [{ src: "/trackpaisa-logo.svg", sizes: "any" }],
      },
      {
        name: "Reports",
        short_name: "Reports",
        description: "Review spending and income trends.",
        url: "/reports",
        icons: [{ src: "/trackpaisa-logo.svg", sizes: "any" }],
      },
    ],
  };
}
