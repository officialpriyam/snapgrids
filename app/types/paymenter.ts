export interface PaymenterCategoryOption {
  id: string
  name: string
  parentId: string | null
}

export interface PaymenterPlanCard {
  id: string
  productId: string
  planId: string | null
  productName: string
  planName: string | null
  name: string
  description: string
  price: string
  numericPrice: number | null
  setupFee: string | null
  currencyCode: string | null
  period: string
  billingPeriod: number | null
  billingUnit: string | null
  stock: number | null
  orderLink: string
  productLink: string
}

export interface PaymenterPlansResponse {
  configured: boolean
  categoryId: string | null
  plans: PaymenterPlanCard[]
  error?: string
}

export interface AdminMappings {
  homepage: Record<string, string>
  pages: Record<string, string>
  games: Record<string, string>
}
