import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  assertSameOrigin,
  clearLoginFailures,
  clientIp,
  createSessionToken,
  getAdminCookieOptions,
  isLoginLocked,
  recordLoginFailure,
  verifyPassword,
} from "@/lib/admin-auth"
import { ADMIN_EMAIL, readAdminConfig } from "@/lib/admin-config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 })
  }

  const ip = clientIp(request)
  if (isLoginLocked(ip)) {
    return NextResponse.json({ error: "Too many failed attempts. Try again later." }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password ?? ""

  if (email !== ADMIN_EMAIL || !password) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 })
  }

  let config
  try {
    config = await readAdminConfig()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read admin settings." },
      { status: 503 }
    )
  }

  const validPassword = await verifyPassword(password, config.passwordHash)

  if (!validPassword) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 })
  }

  clearLoginFailures(ip)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, createSessionToken(config), getAdminCookieOptions(request))
  return response
}
