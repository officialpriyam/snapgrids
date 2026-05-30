import "server-only"

import crypto from "node:crypto"
import type { NextRequest } from "next/server"
import { ADMIN_EMAIL, type AdminConfig } from "./admin-config"

export const ADMIN_COOKIE = "snapgrids_admin"

const PASSWORD_ITERATIONS = 310000
const PASSWORD_KEY_LENGTH = 32
const SESSION_TTL_SECONDS = 8 * 60 * 60

const loginAttempts = new Map<string, { count: number; lockUntil: number; firstAttempt: number }>()

export function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("base64url")
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, "sha256", (error, hash) => {
      if (error) {
        reject(error)
        return
      }
      resolve(`pbkdf2_sha256:${PASSWORD_ITERATIONS}:${salt}:${hash.toString("base64url")}`)
    })
  })
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, iterationsText, salt, hashText] = storedHash.split(":")
  const iterations = Number(iterationsText)

  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !hashText) {
    return false
  }

  const expected = Buffer.from(hashText, "base64url")
  const actual = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, expected.length, "sha256", (error, hash) => {
      if (error) {
        reject(error)
        return
      }
      resolve(hash)
    })
  })

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url")
}

function passwordFingerprint(config: AdminConfig) {
  return crypto.createHash("sha256").update(config.passwordHash).digest("base64url")
}

export function createSessionToken(config: AdminConfig) {
  const payload = Buffer.from(
    JSON.stringify({
      email: ADMIN_EMAIL,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      pwd: passwordFingerprint(config),
    })
  ).toString("base64url")

  return `${payload}.${sign(payload, config.sessionSecret)}`
}

export function verifySessionToken(token: string | undefined, config: AdminConfig) {
  if (!token) {
    return false
  }

  const [payload, signature] = token.split(".")
  if (!payload || !signature) {
    return false
  }

  const expected = sign(payload, config.sessionSecret)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return false
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string
      exp?: number
      pwd?: string
    }

    return (
      data.email === ADMIN_EMAIL &&
      typeof data.exp === "number" &&
      data.exp > Math.floor(Date.now() / 1000) &&
      data.pwd === passwordFingerprint(config)
    )
  } catch {
    return false
  }
}

export function getAdminCookieOptions(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto")
  const secure = forwardedProto === "https" || request.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production"

  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  }
}

export function assertSameOrigin(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return true
  }

  const origin = request.headers.get("origin")
  if (!origin) {
    return true
  }

  return origin === request.nextUrl.origin
}

export function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function isLoginLocked(ip: string) {
  const attempt = loginAttempts.get(ip)
  if (!attempt) {
    return false
  }

  if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
    return true
  }

  if (attempt.lockUntil && attempt.lockUntil <= Date.now()) {
    loginAttempts.delete(ip)
  }

  return false
}

export function recordLoginFailure(ip: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt || now - attempt.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lockUntil: 0, firstAttempt: now })
    return
  }

  const next = { ...attempt, count: attempt.count + 1 }
  if (next.count >= 5) {
    next.lockUntil = now + 15 * 60 * 1000
  }
  loginAttempts.set(ip, next)
}

export function clearLoginFailures(ip: string) {
  loginAttempts.delete(ip)
}
