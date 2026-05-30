"use client"

import { useEffect, useState } from "react"
import { defaultSiteContent } from "../lib/site-content"
import type { SiteContent } from "../types/site"

const fallbackSite = defaultSiteContent({
  homepage: {},
  pages: {},
  games: {},
})

export function useSiteContent() {
  const [site, setSite] = useState<SiteContent>(fallbackSite)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSiteContent() {
      try {
        const response = await fetch("/api/site-config", {
          signal: controller.signal,
        })
        if (!response.ok) {
          return
        }
        setSite((await response.json()) as SiteContent)
      } catch {
        if (!controller.signal.aborted) {
          setSite(fallbackSite)
        }
      }
    }

    loadSiteContent()

    return () => controller.abort()
  }, [])

  return site
}
