"use client"

import type React from "react"

import { motion } from "framer-motion"
import Image from "next/image"
import { Cpu, HardDrive, MemoryStick, Shield } from "lucide-react"
import gamesConfig from "../../config/sections/games.json"
import type { Game, GamesConfig } from "../../types/games"
import type { PaymenterPlanCard } from "../../types/paymenter"
import type { CmsGamePage } from "../../types/site"
import { parsePaymenterPlanSpecs } from "../../lib/plan-specs"
import { CurrencySelector, useCurrency } from "../ui/CurrencySelector"
import { useLanguage } from "../../contexts/LanguageContext"
import { describePaymenterPlan, usePaymenterPlans } from "../../hooks/usePaymenterPlans"

const config = gamesConfig as GamesConfig

type GameServerListProps = {
  gameId?: string
  gamePage?: CmsGamePage
}

type DisplayPlan = {
  id: string
  name: string
  type: "budget" | "premium" | "paymenter"
  memory: string
  cpu: string
  storage: string
  ddos: string
  port: string
  features: string[]
  price: number | string
  period: string
  orderLink: string
  description?: string
}

function toStaticPlans(game: Game): DisplayPlan[] {
  return [...game.plans.budget, ...game.plans.premium].map((plan) => ({
    id: plan.id,
    name: plan.name,
    type: plan.type,
    memory: `${plan.ram} RAM`,
    cpu: `${plan.cpu} CPU`,
    storage: plan.storage,
    ddos: "Included",
    port: "",
    features: [],
    price: plan.price,
    period: "/mo",
    orderLink: plan.orderLink,
  }))
}

function toPaymenterPlans(plans: PaymenterPlanCard[]): DisplayPlan[] {
  return plans.map((plan) => {
    const specs = parsePaymenterPlanSpecs(plan)

    return {
      id: plan.id,
      name: specs.displayName,
      type: "paymenter",
      memory: specs.ram,
      cpu: specs.cpu,
      storage: specs.storage,
      ddos: specs.ddos,
      port: specs.port,
      features: specs.features,
      price: plan.price,
      period: plan.period,
      orderLink: plan.orderLink,
      description: specs.description || describePaymenterPlan(plan),
    }
  })
}

export default function GameServerList({ gameId, gamePage }: GameServerListProps) {
  const selectedGameId = gamePage?.slug || gameId || config.games[0]?.id || ""
  const staticGame = config.games.find((game: Game) => game.id === selectedGameId)
  const currentGame = gamePage ?? staticGame
  const { selectedCurrency, setSelectedCurrency, convertPrice } = useCurrency()
  const { t } = useLanguage()
  const paymenterPlans = usePaymenterPlans("game", selectedGameId)

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const translated = (key: string, fallback: string) => {
    const value = t(key)
    return value && value !== key ? value : fallback
  }

  const paymenterDisplayPlans = toPaymenterPlans(paymenterPlans.data.plans)
  const staticFallbackPlans = staticGame ? toStaticPlans(staticGame) : []
  const displayPlans = paymenterDisplayPlans.length
    ? paymenterDisplayPlans
    : !paymenterPlans.isLoading && !paymenterPlans.data.configured
      ? staticFallbackPlans
      : []
  const showEmptyState = !paymenterPlans.isLoading && paymenterPlans.data.configured && paymenterDisplayPlans.length === 0

  return (
    <div className="bg-gray-50 dark:bg-[#0a0b0f] relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${currentGame.banner}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/40 to-transparent dark:from-[#0a0b0f] dark:via-[#0a0b0f]/60 dark:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-gray-50/40 dark:from-[#0a0b0f] dark:via-[#0a0b0f]/95 dark:to-[#0a0b0f]/60" />
      </div>

      <div className="relative z-10 mt-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-left mb-8"
          style={
            {
              "--game-color": currentGame.primaryColor || "#3b82f6",
            } as React.CSSProperties
          }
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="inline-flex items-left gap-2 bg-[var(--game-color)]/10 px-4 py-2 rounded-tl-xl rounded-br-xl mb-4">
                <span className="text-[var(--game-color)] text-sm">
                  {translated("gameServerList.badge", "Game Servers")}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={currentGame.icon || "/placeholder.svg"}
                    alt={currentGame.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    priority
                  />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white orbitron-font">
                  {currentGame.name} <span className="text-[var(--game-color)]">Hosting</span>
                </h1>
              </div>
              <p className="text-md text-gray-600 max-w-3xl dark:text-gray-300">
                {currentGame.description}
              </p>
            </div>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
              className="w-full sm:w-64 mt-4 sm:mt-0"
            />
          </div>
        </motion.div>

        <div
          className="mb-5"
          style={
            {
              "--game-color": currentGame.primaryColor || "#3b82f6",
            } as React.CSSProperties
          }
        >
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {translated("gameServerList.step4", "Choose Plan").replace(/^\d+\.\s*/, "")}
          </h2>
        </div>

        {paymenterPlans.isLoading && displayPlans.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm p-8 text-center text-gray-600 dark:text-gray-300">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--game-color)] border-t-transparent" />
            Loading products...
          </div>
        )}

        {showEmptyState && (
          <div className="rounded-xl border border-white/10 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm p-8 text-center text-gray-600 dark:text-gray-300">
            No products are available for {currentGame.name} right now.
          </div>
        )}

        {displayPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPlans.map((plan, index: number) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ "--game-color": currentGame.primaryColor } as React.CSSProperties}
                className="relative overflow-hidden rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm border border-[var(--game-color)]/30 hover:border-[var(--game-color)]/30 dark:hover:border-[var(--game-color)]/40 transition-all duration-300 hover:bg-[radial-gradient(50%_50%_at_50%_100%,rgba(255,255,255,0.05)_0%,transparent_100%)] dark:hover:bg-[radial-gradient(50%_50%_at_50%_100%,rgba(255,255,255,0.03)_0%,transparent_100%)]"
              >
                {plan.type === "premium" && (
                  <div className="absolute top-4 right-4">
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 dark:bg-[var(--game-color)]/10 backdrop-blur-sm text-[var(--game-color)]">
                      {translated("gameServerList.premium", "Premium")}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-8 h-8 rounded-md overflow-hidden">
                      <Image
                        src={currentGame.icon || "/placeholder.svg"}
                        alt={currentGame.name}
                        fill
                        sizes="32px"
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  </div>

                  {plan.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {plan.description}
                    </p>
                  )}

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <MemoryStick className="w-5 h-5 text-[var(--game-color)]" />
                      <span className="text-gray-600 dark:text-gray-300">{plan.memory}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-[var(--game-color)]" />
                      <span className="text-gray-600 dark:text-gray-300">{plan.cpu}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-[var(--game-color)]" />
                      <span className="text-gray-600 dark:text-gray-300">{plan.storage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-[var(--game-color)]" />
                      <span className="text-gray-600 dark:text-gray-300">
                        DDoS Protection: {plan.ddos}
                      </span>
                    </div>
                    {plan.port && (
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-5 h-5 text-[var(--game-color)]" />
                        <span className="text-gray-600 dark:text-gray-300">Port: {plan.port}</span>
                      </div>
                    )}
                    {plan.features.slice(0, 2).map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-[var(--game-color)]" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-bold text-[var(--game-color)]">
                      {convertPrice(typeof plan.price === "number" ? `$${plan.price}` : plan.price)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>

                  <a
                    href={plan.orderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="orbitron-font w-full bg-[var(--game-color)] hover:opacity-90 dark:bg-[var(--game-color)]/30 text-white dark:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                  >
                    {translated("gameServerList.orderNow", "Order Now")}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
