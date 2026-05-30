"use client"

import { useEffect, useMemo, useState } from "react"
import type { PaymenterPlanCard, PaymenterPlansResponse } from "../types/paymenter"

const emptyResponse: PaymenterPlansResponse = {
  configured: false,
  categoryId: null,
  plans: [],
}

export function usePaymenterPlans(surface: "homepage" | "page" | "game", key: string) {
  const [data, setData] = useState<PaymenterPlansResponse>(emptyResponse)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlans() {
      if (!key) {
        setData(emptyResponse)
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({ surface, key })
        const response = await fetch(`/api/paymenter/plans?${params.toString()}`, {
          signal: controller.signal,
        })
        const json = (await response.json()) as PaymenterPlansResponse
        setData(json)
      } catch {
        if (!controller.signal.aborted) {
          setData(emptyResponse)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadPlans()

    return () => controller.abort()
  }, [surface, key])

  return { data, isLoading }
}

export function usePaymenterPlanMap(surface: "homepage" | "page" | "game", keys: string[]) {
  const stableKeys = useMemo(() => Array.from(new Set(keys.filter(Boolean))).sort(), [keys])
  const dependency = stableKeys.join("|")
  const [data, setData] = useState<Record<string, PaymenterPlansResponse>>({})

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlans() {
      if (stableKeys.length === 0) {
        setData({})
        return
      }

      const entries = await Promise.all(
        stableKeys.map(async (key) => {
          try {
            const params = new URLSearchParams({ surface, key })
            const response = await fetch(`/api/paymenter/plans?${params.toString()}`, {
              signal: controller.signal,
            })
            return [key, (await response.json()) as PaymenterPlansResponse] as const
          } catch {
            return [key, emptyResponse] as const
          }
        })
      )

      if (!controller.signal.aborted) {
        setData(Object.fromEntries(entries))
      }
    }

    loadPlans()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, dependency])

  return data
}

export function describePaymenterPlan(plan: PaymenterPlanCard) {
  return plan.description || "Configured in Paymenter"
}

export function paymenterStockLabel(stock: number | null) {
  if (stock === null) {
    return "Available"
  }

  if (stock === 0) {
    return "Out of stock"
  }

  return `${stock} in stock`
}
