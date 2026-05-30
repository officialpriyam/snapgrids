import "server-only"

import type { PaymenterCategoryOption, PaymenterPlanCard } from "@/app/types/paymenter"

type JsonApiResource = {
  id: string
  type: string
  attributes?: Record<string, unknown>
  relationships?: Record<string, { data?: { id: string; type: string } | Array<{ id: string; type: string }> | null }>
}

type JsonApiResponse = {
  data?: JsonApiResource | JsonApiResource[]
  included?: JsonApiResource[]
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  GBP: "\u00a3",
  EUR: "\u20ac",
  INR: "\u20b9",
  JPY: "\u00a5",
  CAD: "C$",
  AUD: "A$",
}

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function asNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function periodLabel(period: number | null, unit: string | null) {
  if (!unit) {
    return "/mo"
  }

  const shortUnit =
    unit === "month" ? "mo" : unit === "year" ? "yr" : unit === "week" ? "wk" : unit === "day" ? "day" : unit

  if (!period || period === 1) {
    return `/${shortUnit}`
  }

  return `/${period} ${shortUnit}`
}

function formatMoney(value: number | null, currencyCode: string | null) {
  if (value === null) {
    return "$0.00"
  }

  const symbol = currencyCode ? currencySymbols[currencyCode.toUpperCase()] : "$"
  return `${symbol ?? ""}${value.toFixed(2)}`
}

function absolutePaymenterUrl(billingUrl: string, pathValue: string) {
  return new URL(pathValue, `${billingUrl.replace(/\/+$/, "")}/`).toString()
}

async function paymenterFetch<T>(billingUrl: string, apiKey: string, path: string, params?: Record<string, string>) {
  const url = new URL(path, `${billingUrl.replace(/\/+$/, "")}/`)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) {
      url.searchParams.set(key, value)
    }
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Paymenter API returned ${response.status}`)
  }

  return (await response.json()) as T
}

export async function fetchPaymenterCategories(billingUrl: string, apiKey: string): Promise<PaymenterCategoryOption[]> {
  const data = await paymenterFetch<JsonApiResponse>(billingUrl, apiKey, "/api/v1/admin/categories", {
    per_page: "100",
    sort: "name",
  })

  const resources = Array.isArray(data.data) ? data.data : data.data ? [data.data] : []

  return resources.map((resource) => ({
    id: resource.id,
    name: asString(resource.attributes?.name) || `Category ${resource.id}`,
    parentId:
      resource.attributes?.parent_id === null || resource.attributes?.parent_id === undefined
        ? null
        : String(resource.attributes.parent_id),
  }))
}

export async function fetchPaymenterPlansByCategory(
  billingUrl: string,
  apiKey: string,
  categoryId: string
): Promise<PaymenterPlanCard[]> {
  const data = await paymenterFetch<JsonApiResponse>(billingUrl, apiKey, "/api/v1/admin/products", {
    include: "category,plans.prices",
    per_page: "100",
    sort: "sort,name",
    "filter[category_id]": categoryId,
    "filter[hidden]": "0",
  })

  return normalizePaymenterPlans(data, billingUrl)
}

function resourceKey(resource: { type: string; id: string }) {
  return `${resource.type}:${resource.id}`
}

function relatedIds(resource: JsonApiResource, name: string) {
  const relationship = resource.relationships?.[name]?.data
  if (!relationship) {
    return []
  }

  return Array.isArray(relationship) ? relationship : [relationship]
}

function normalizePaymenterPlans(payload: JsonApiResponse, billingUrl: string): PaymenterPlanCard[] {
  const resources = new Map<string, JsonApiResource>()
  for (const resource of payload.included ?? []) {
    resources.set(resourceKey(resource), resource)
  }

  const products = Array.isArray(payload.data) ? payload.data : payload.data ? [payload.data] : []
  const plans: PaymenterPlanCard[] = []

  for (const product of products) {
    if (product.type !== "products") {
      continue
    }

    const productName = asString(product.attributes?.name) || `Product ${product.id}`
    const productSlug = asString(product.attributes?.slug) || slugify(productName)
    const description = stripHtml(asString(product.attributes?.description))
    const stock = asNumber(product.attributes?.stock)
    const categoryRef = relatedIds(product, "category")[0]
    const category = categoryRef ? resources.get(resourceKey(categoryRef)) : undefined
    const categoryName = asString(category?.attributes?.name) || "products"
    const categorySlug = slugify(categoryName)
    const productLink = absolutePaymenterUrl(billingUrl, `/products/${categorySlug}/${productSlug}`)
    const checkoutBase = `${productLink}/checkout`
    const productPlans = relatedIds(product, "plans")

    if (productPlans.length === 0) {
      plans.push({
        id: `product-${product.id}`,
        productId: product.id,
        planId: null,
        productName,
        planName: null,
        name: productName,
        description,
        price: "$0.00",
        numericPrice: null,
        setupFee: null,
        currencyCode: null,
        period: "/mo",
        billingPeriod: null,
        billingUnit: null,
        stock,
        orderLink: productLink,
        productLink,
      })
      continue
    }

    for (const planRef of productPlans) {
      const plan = resources.get(resourceKey(planRef))
      if (!plan) {
        continue
      }

      const priceRef = relatedIds(plan, "prices")[0]
      const price = priceRef ? resources.get(resourceKey(priceRef)) : undefined
      const numericPrice = asNumber(price?.attributes?.price)
      const setupFee = asNumber(price?.attributes?.setup_fee)
      const currencyCode = asString(price?.attributes?.currency_code).toUpperCase() || null
      const billingPeriod = asNumber(plan.attributes?.billing_period)
      const billingUnit = asString(plan.attributes?.billing_unit) || null
      const planName = asString(plan.attributes?.name) || null
      const name = planName ? `${productName} - ${planName}` : productName
      const checkoutUrl = new URL(checkoutBase)
      checkoutUrl.searchParams.set("plan", plan.id)

      plans.push({
        id: `${product.id}-${plan.id}`,
        productId: product.id,
        planId: plan.id,
        productName,
        planName,
        name,
        description,
        price: formatMoney(numericPrice, currencyCode),
        numericPrice,
        setupFee: setupFee && setupFee > 0 ? formatMoney(setupFee, currencyCode) : null,
        currencyCode,
        period: periodLabel(billingPeriod, billingUnit),
        billingPeriod,
        billingUnit,
        stock,
        orderLink: checkoutUrl.toString(),
        productLink,
      })
    }
  }

  return plans.sort((left, right) => {
    const leftPrice = left.numericPrice ?? Number.MAX_SAFE_INTEGER
    const rightPrice = right.numericPrice ?? Number.MAX_SAFE_INTEGER
    return leftPrice - rightPrice || left.name.localeCompare(right.name)
  })
}
