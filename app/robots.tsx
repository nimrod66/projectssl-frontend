import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/staff"],
      },
    ],
    sitemap: "https://starnet.ajirikenya.com/sitemap.xml",
  };
}
