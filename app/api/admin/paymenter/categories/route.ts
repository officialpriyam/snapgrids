import { NextRequest, NextResponse } from "next/server"
import { getPaymenterApiKey } from "@/lib/admin-config"
import { fetchPaymenterCategories } from "@/lib/paymenter"
import { jsonError, requireAdmin } from "../../_utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("response" in auth) {
    return auth.response
  }

  const apiKey = getPaymenterApiKey(auth.config)
  const billingUrl = auth.config.paymenter.billingUrl

  if (!billingUrl || !apiKey) {
    return jsonError("Paymenter billing URL and API key are required.")
  }

  try {
    const categories = await fetchPaymenterCategories(billingUrl, apiKey)
    return NextResponse.json({ categories })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to fetch Paymenter categories.", 502)
  }
}
