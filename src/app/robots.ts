import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/login", "/login/"],
    },
    sitemap: "https://sendhope-venezuela.online/sitemap.xml",
  };
}
