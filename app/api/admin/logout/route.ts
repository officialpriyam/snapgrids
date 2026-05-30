import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE, assertSameOrigin, getAdminCookieOptions } from "@/lib/admin-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, "", {
    ...getAdminCookieOptions(request),
    maxAge: 0,
  })
  return response
}
