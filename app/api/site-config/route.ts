import { NextResponse } from "next/server"
import { readPublicSiteContent } from "@/lib/public-site-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const site = await readPublicSiteContent()
  return NextResponse.json(site, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
