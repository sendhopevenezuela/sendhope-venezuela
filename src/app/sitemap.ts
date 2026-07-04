import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sendhope-venezuela.online";
  const currentDate = new Date();

  // Rutas públicas de la plataforma
  const routes = ["", "/transparencia", "/galeria", "/contacto", "/donar"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: "hourly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
