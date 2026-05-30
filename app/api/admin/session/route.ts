import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth"
import { readAdminConfig, sanitizeAdminSettings } from "@/lib/admin-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  headers.set("Pragma", "no-cache")
  headers.set("Expires", "0")
  return NextResponse.json(body, { ...init, headers })
}

export async function GET(request: NextRequest) {
  let config
  try {
    config = await readAdminConfig()
  } catch (error) {
    return noStoreJson(
      {
        authenticated: false,
        settings: null,
        error: error instanceof Error ? error.message : "Unable to read admin settings.",
      },
      { status: 503 }
    )
  }

  const authenticated = verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, config)

  return noStoreJson({
    authenticated,
    settings: authenticated ? sanitizeAdminSettings(config) : null,
  })
}
