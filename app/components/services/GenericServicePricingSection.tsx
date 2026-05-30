"use client"

import type React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Cpu, HardDrive, MemoryStick, Shield, Wifi } from "lucide-react"
import type { CmsServicePage } from "../../types/site"
import { parsePaymenterPlanSpecs } from "../../lib/plan-specs"
import { CurrencySelector, useCurrency } from "../ui/CurrencySelector"
import { describePaymenterPlan, paymenterStockLabel, usePaymenterPlans } from "../../hooks/usePaymenterPlans"

type GenericServicePricingSectionProps = {
  page: CmsServicePage
}

export default function GenericServicePricingSection({ page }: GenericServicePricingSectionProps) {
  const { selectedCurrency, setSelectedCurrency, convertPrice } = useCurrency()
  const paymenterPlans = usePaymenterPlans("page", page.slug)

  const plans = paymenterPlans.data.plans.map((plan) => {
    const specs = parsePaymenterPlanSpecs(plan)
    return {
      id: plan.id,
      name: specs.displayName,
      badge: paymenterStockLabel(plan.stock),
      description: specs.description || describePaymenterPlan(plan),
      cpu: specs.cpu,
      ram: specs.ram,
      storage: specs.storage,
      bandwidth: specs.bandwidth,
      ddos: specs.ddos,
      port: specs.port,
      features: specs.features,
      price: plan.price,
      period: plan.period,
      orderLink: plan.orderLink,
    }
  })

  return (
    <section className="relative overflow-hidden bg-gray-50 px-4 py-16 dark:bg-[#0a0b0f] sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('${page.banner || "/placeholder.svg"}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/50 to-gray-50 dark:from-[#0a0b0f] dark:via-[#0a0b0f]/70 dark:to-[#0a0b0f]" />
      </div>

      <div
        className="relative z-10 mx-auto mt-16 max-w-7xl"
        style={{ "--service-color": page.primaryColor || "#3b82f6" } as React.CSSProperties}
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl bg-[var(--service-color)]/10 px-4 py-2 text-sm text-[var(--service-color)]">
              {page.label}
            </div>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                <Image src={page.icon || "/placeholder.svg"} alt={page.name} fill sizes="48px" className="object-cover" />
              </div>
              <h1 className="orbitron-font text-4xl font-bold text-gray-900 dark:text-white">
                {page.name}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{page.description}</p>
          </div>
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            className="w-full sm:w-64"
          />
        </div>

        {paymenterPlans.isLoading && (
          <div className="rounded-xl border border-white/10 bg-white/10 p-8 text-center text-gray-600 backdrop-blur-sm dark:text-gray-300">
            Loading products...
          </div>
        )}

        {!paymenterPlans.isLoading && plans.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/10 p-8 text-center text-gray-600 backdrop-blur-sm dark:text-gray-300">
            No products are available for {page.name} right now.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-md border border-[var(--service-color)]/25 bg-white/80 p-6 backdrop-blur-sm dark:bg-gray-950/30"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                </div>
                {plan.badge && (
                  <span className="rounded-tl-xl rounded-br-xl bg-[var(--service-color)]/10 px-2 py-1 text-xs text-[var(--service-color)]">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
                <Spec icon={MemoryStick} label="RAM" value={plan.ram} />
                <Spec icon={Cpu} label="CPU" value={plan.cpu} />
                <Spec icon={HardDrive} label="Storage" value={plan.storage} />
                <Spec icon={Wifi} label={plan.port ? "Port" : "Bandwidth"} value={plan.port || plan.bandwidth} />
                <Spec icon={Shield} label="DDoS" value={plan.ddos} />
              </div>

              {plan.features.length > 0 && (
                <div className="mb-6 space-y-2">
                  {plan.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Shield className="h-4 w-4 text-[var(--service-color)]" />
                      {feature}
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-5 flex items-baseline justify-center gap-1">
                <span className="orbitron-font text-3xl font-bold text-gray-900 dark:text-white">
                  {convertPrice(plan.price)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
              </div>

              <a
                href={plan.orderLink}
                className="orbitron-font flex w-full items-center justify-center rounded-lg bg-[var(--service-color)] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                Order Now
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  if (!value) {
    return null
  }

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-gray-900/40">
      <div className="mb-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Icon className="h-4 w-4 text-[var(--service-color)]" />
        {label}
      </div>
      <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}
