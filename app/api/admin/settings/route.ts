import { NextRequest, NextResponse } from "next/server"
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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("response" in auth) {
    return auth.response
  }

  return NextResponse.json(sanitizeAdminSettings(auth.config))
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

  return NextResponse.json(sanitizeAdminSettings(config))
}
