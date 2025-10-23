// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://starnet.ajirikenya.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.5,
    },
    {
      url: "https://starnet.ajirikenya.com/about",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
