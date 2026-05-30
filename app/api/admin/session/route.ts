import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth"
import { readAdminConfig, sanitizeAdminSettings } from "@/lib/admin-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  let config
  try {
    config = await readAdminConfig()
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        settings: null,
        error: error instanceof Error ? error.message : "Unable to read admin settings.",
      },
      { status: 503 }
    )
  }

  const authenticated = verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, config)

  return NextResponse.json({
    authenticated,
    settings: authenticated ? sanitizeAdminSettings(config) : null,
  })
}
