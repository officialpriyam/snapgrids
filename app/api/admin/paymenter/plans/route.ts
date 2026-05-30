import { NextRequest, NextResponse } from "next/server"
import { getPaymenterApiKey } from "@/lib/admin-config"
import { fetchPaymenterPlansByCategory } from "@/lib/paymenter"
import { jsonError, requireAdmin } from "../../_utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("response" in auth) {
    return auth.response
  }

  const categoryId = request.nextUrl.searchParams.get("categoryId")?.trim()
  if (!categoryId) {
    return jsonError("categoryId is required.")
  }

  const apiKey = getPaymenterApiKey(auth.config)
  const billingUrl = auth.config.paymenter.billingUrl

  if (!billingUrl || !apiKey) {
    return jsonError("Paymenter billing URL and API key are required.")
  }

  try {
    const plans = await fetchPaymenterPlansByCategory(billingUrl, apiKey, categoryId)
    return NextResponse.json({ plans })
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to fetch Paymenter plans.", 502)
  }
}
