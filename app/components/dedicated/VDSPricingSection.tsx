"use client"

import type React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Check, Cpu, HardDrive, MemoryStick, Server, Wifi } from "lucide-react"
import dediConfig from "../../config/sections/dedicated.json"
import type { DediConfig } from "../../types/dedicated"
import type { CmsServicePage } from "../../types/site"
import { parsePaymenterPlanSpecs } from "../../lib/plan-specs"
import { CurrencySelector, useCurrency } from "../ui/CurrencySelector"
import { useLanguage } from "../../contexts/LanguageContext"
import { describePaymenterPlan, paymenterStockLabel, usePaymenterPlans } from "../../hooks/usePaymenterPlans"

const config = dediConfig as DediConfig

type VDSPricingSectionProps = {
  pageConfig?: CmsServicePage
}

export default function VDSPricingSection({ pageConfig }: VDSPricingSectionProps) {
  const { selectedCurrency, setSelectedCurrency, convertPrice } = useCurrency()
  const { t } = useLanguage()
  const paymenterPlans = usePaymenterPlans("page", pageConfig?.slug || "dedicated")
  const firstPlanGroup = config.plans[config.planTypes[0]?.id] ?? []

  const plans = paymenterPlans.data.plans.length
    ? paymenterPlans.data.plans.map((plan) => {
        const specs = parsePaymenterPlanSpecs(plan)
        return {
          id: plan.id,
          name: specs.displayName,
          badge: paymenterStockLabel(plan.stock),
          cpu: specs.cpu,
          cpuDetail: "CPU",
          ram: specs.ram,
          ramDetail: "RAM",
          storage: specs.storage,
          storageDetail: "Storage",
          bandwidth: specs.bandwidth,
          bandwidthDetail: "Bandwidth",
          price: plan.price,
          period: plan.period,
          features: [specs.description || describePaymenterPlan(plan), `DDoS Protection: ${specs.ddos}`, ...specs.features],
          orderLink: plan.orderLink,
        }
      })
    : firstPlanGroup

  return (
    <div
      className="relative overflow-hidden bg-gray-50 px-4 py-16 dark:bg-[#0a0b0f] sm:px-6 lg:px-8"
      style={
        pageConfig
          ? ({
              "--icon-primary": pageConfig.primaryColor,
              "--button-primary": pageConfig.primaryColor,
              "--icon-text-primary": pageConfig.primaryColor,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${pageConfig?.banner || "/dedicated.webp"}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/40 to-transparent dark:from-[#0a0b0f] dark:via-[#0a0b0f]/60 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-gray-50/40 dark:from-[#0a0b0f] dark:via-[#0a0b0f]/95 dark:to-[#0a0b0f]/60" />
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-tl-xl rounded-br-2xl border border-secondary px-4 py-2">
              <Server className="h-4 w-4 icon-text-primary" />
              <span className="icon-text-primary text-sm">{pageConfig?.label || t("dedicated.badge")}</span>
            </div>
            <h1 className="orbitron-font mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              {pageConfig?.name || t("dedicated.title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">{pageConfig?.description || t("dedicated.description")}</p>
          </div>
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            className="w-full sm:w-64"
          />
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative overflow-hidden rounded-md border border-secondary bg-white p-6 backdrop-blur-xl transition-all duration-300 hover:hover-gradient dark:bg-gray-950/20"
              >
                {plan.badge && (
                  <span className="absolute right-4 top-4 rounded-md button-primary px-3 py-1 text-xs font-medium text-white">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6 flex items-center gap-4">
                  <Image src={pageConfig?.icon || "/dedicated.webp"} alt={plan.name} width={48} height={48} className="rounded-lg object-cover" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pageConfig?.label || "Dedicated Server"}</p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <Spec icon={Cpu} label={plan.cpuDetail} value={plan.cpu} />
                  <Spec icon={MemoryStick} label={plan.ramDetail} value={plan.ram} />
                  <Spec icon={HardDrive} label={plan.storageDetail} value={plan.storage} />
                  <Spec icon={Wifi} label={plan.bandwidthDetail} value={plan.bandwidth} />
                </div>

                <div className="mb-6 space-y-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 icon-primary" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-4 flex items-baseline justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{convertPrice(plan.price)}</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">{plan.period}</span>
                </div>
                <a
                  href={plan.orderLink}
                  className="orbitron-font flex w-full items-center justify-center rounded-lg button-primary px-6 py-3 font-medium text-button-primary"
                >
                  {t("common.orderNow")}
                </a>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Server className="mb-6 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{t("dedicated.noStock")}</h2>
            <p className="max-w-md text-gray-600 dark:text-gray-400">{t("dedicated.noStockDescription")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Spec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 icon-primary" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-lg font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}
