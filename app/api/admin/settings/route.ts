import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import {
  normalizeBillingUrl,
  sanitizeAdminSettings,
  sanitizeMappings,
  setPaymenterApiKey,
  writeAdminConfig,
} from "@/lib/admin-config"
import { sanitizeSiteContent, syncMappingsFromSite } from "@/app/lib/site-content"
import { jsonError, requireAdmin } from "../_utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
  headers.set("Pragma", "no-cache")
  headers.set("Expires", "0")
  return NextResponse.json(body, { ...init, headers })
}

function revalidatePublicSite() {
  const staticPaths = [
    "/",
    "/games",
    "/otherhosting",
    "/vps",
    "/dedicated",
    "/discord",
    "/webhosting",
    "/privacy-policy",
    "/terms-of-services",
    "/sitemap.xml",
  ]

  for (const path of staticPaths) {
    revalidatePath(path)
  }

  revalidatePath("/games/[game]", "page")
  revalidatePath("/hosting/[service]", "page")
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("response" in auth) {
    return auth.response
  }

  return noStoreJson(sanitizeAdminSettings(auth.config))
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("response" in auth) {
    return auth.response
  }

  const body = (await request.json().catch(() => null)) as {
    billingUrl?: string
    apiKey?: string
    clearApiKey?: boolean
    mappings?: unknown
    site?: unknown
  } | null

  if (!body) {
    return jsonError("Invalid JSON body.")
  }

  const config = auth.config

  try {
    if (typeof body.billingUrl === "string") {
      config.paymenter.billingUrl = normalizeBillingUrl(body.billingUrl)
    }
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid billing URL.")
  }

  if (body.clearApiKey) {
    setPaymenterApiKey(config, "")
  } else if (typeof body.apiKey === "string" && body.apiKey.trim()) {
    try {
      setPaymenterApiKey(config, body.apiKey.trim())
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Unable to encrypt Paymenter API key.")
    }
  }

  if (body.mappings && typeof body.mappings === "object") {
    config.mappings = sanitizeMappings(body.mappings as Parameters<typeof sanitizeMappings>[0])
  }

  if (body.site && typeof body.site === "object") {
    config.site = sanitizeSiteContent(body.site as Parameters<typeof sanitizeSiteContent>[0], config.mappings)
    config.mappings = syncMappingsFromSite(config.mappings, config.site)
  }

  await writeAdminConfig(config)
  revalidatePublicSite()

  return noStoreJson(sanitizeAdminSettings(config))
}
