import type { MetadataRoute } from "next"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { visibleGames, visibleServices } from "./lib/site-content"

export const dynamic = "force-dynamic"

const siteUrl = "https://snapgrids.store"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await readPublicSiteContent()
  const now = new Date()
  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/games", priority: 0.9 },
    { path: "/otherhosting", priority: 0.9 },
    { path: "/vps", priority: 0.85 },
    { path: "/webhosting", priority: 0.85 },
    { path: "/discord", priority: 0.85 },
    { path: "/dedicated", priority: 0.85 },
    { path: "/privacy-policy", priority: 0.5 },
    { path: "/terms-of-services", priority: 0.5 },
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...visibleGames(site).map((game) => ({
      url: `${siteUrl}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...visibleServices(site).map((service) => ({
      url: `${siteUrl}${service.route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ]
}
