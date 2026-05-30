import crypto from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  createSessionToken,
  getAdminCookieOptions,
  hashPassword,
  verifyPassword,
} from "@/lib/admin-auth"
import { writeAdminConfig } from "@/lib/admin-config"
import { jsonError, requireAdmin } from "../_utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("response" in auth) {
    return auth.response
  }

  const body = (await request.json().catch(() => null)) as {
    currentPassword?: string
    newPassword?: string
  } | null

  if (!body?.currentPassword || !body.newPassword) {
    return jsonError("Current password and new password are required.")
  }

  const currentPasswordValid = await verifyPassword(body.currentPassword, auth.config.passwordHash)
  if (!currentPasswordValid) {
    return jsonError("Current password is incorrect.", 401)
  }

  if (body.newPassword.length < 10) {
    return jsonError("New password must be at least 10 characters.")
  }

  if (!/[a-z]/i.test(body.newPassword) || !/[0-9]/.test(body.newPassword)) {
    return jsonError("New password must include letters and numbers.")
  }

  auth.config.passwordHash = await hashPassword(body.newPassword)
  auth.config.passwordChangedAt = new Date().toISOString()
  auth.config.sessionSecret = crypto.randomBytes(32).toString("base64url")
  await writeAdminConfig(auth.config)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, createSessionToken(auth.config), getAdminCookieOptions(request))
  return response
}
