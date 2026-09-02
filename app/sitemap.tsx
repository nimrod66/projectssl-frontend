import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://starnet.ajirikenya.com";
  const lastMod = new Date();

  return [
    { url: base, lastModified: lastMod, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/opportunities`, lastModified: lastMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/registration`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/staff`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/applicant/login`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
  ];
}
