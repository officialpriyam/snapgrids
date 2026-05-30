import { NextRequest, NextResponse } from "next/server"
import { getPaymenterApiKey, readAdminConfig, resolveMappedCategory } from "@/lib/admin-config"
import { fetchPaymenterPlansByCategory } from "@/lib/paymenter"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  let config
  try {
    config = await readAdminConfig()
  } catch (error) {
    return NextResponse.json({
      configured: false,
      categoryId: null,
      plans: [],
      error: error instanceof Error ? error.message : "Unable to read admin settings.",
    })
  }

  const surface = request.nextUrl.searchParams.get("surface")
  const key = request.nextUrl.searchParams.get("key")
  const categoryId = resolveMappedCategory(config, surface, key)
  const apiKey = getPaymenterApiKey(config)
  const billingUrl = config.paymenter.billingUrl

  if (!categoryId || !apiKey || !billingUrl) {
    return NextResponse.json({
      configured: false,
      categoryId: categoryId || null,
      plans: [],
    })
  }

  try {
    const plans = await fetchPaymenterPlansByCategory(billingUrl, apiKey, categoryId)
    return NextResponse.json({
      configured: true,
      categoryId,
      plans,
    })
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        categoryId,
        plans: [],
        error: error instanceof Error ? error.message : "Unable to fetch Paymenter plans.",
      },
      { status: 502 }
    )
  }
}
