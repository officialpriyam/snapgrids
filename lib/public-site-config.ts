import "server-only"

import type { AdminMappings } from "@/app/types/paymenter"
import type { SiteContent } from "@/app/types/site"
import { defaultSiteContent } from "@/app/lib/site-content"
import { readAdminConfig } from "@/lib/admin-config"

const emptyMappings: AdminMappings = {
  homepage: {},
  pages: {},
  games: {},
}

export async function readPublicSiteContent(): Promise<SiteContent> {
  try {
    return (await readAdminConfig()).site
  } catch {
    return defaultSiteContent(emptyMappings)
  }
}
