import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const publicRoutes = [
  "",
  "/about",
  "/events",
  "/members",
  "/signup",
  "/login",
  "/terms",
  "/privacy",
  "/policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
