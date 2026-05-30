import { NextRequest, NextResponse } from "next/server"
import { assertSameOrigin, ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth"
import { readAdminConfig, type AdminConfig } from "@/lib/admin-config"

export async function requireAdmin(request: NextRequest): Promise<{ config: AdminConfig } | { response: NextResponse }> {
  if (!assertSameOrigin(request)) {
    return { response: NextResponse.json({ error: "Invalid request origin." }, { status: 403 }) }
  }

  let config
  try {
    config = await readAdminConfig()
  } catch (error) {
    return {
      response: NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to read admin settings." },
        { status: 503 }
      ),
    }
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value

  if (!verifySessionToken(token, config)) {
    return { response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }

  return { config }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
