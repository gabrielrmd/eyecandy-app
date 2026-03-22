import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://advertisingunplugged.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/account/", "/api/", "/strategy/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
