import { NextResponse } from "next/server"
import { readPublicSiteContent } from "@/lib/public-site-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const site = await readPublicSiteContent()
  return NextResponse.json(site, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  })
}
