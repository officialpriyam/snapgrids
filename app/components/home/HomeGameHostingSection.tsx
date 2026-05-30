import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Gamepad2 } from "lucide-react"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { visibleGames } from "../../lib/site-content"

export default async function HomeGameHostingSection() {
  const site = await readPublicSiteContent()
  const games = visibleGames(site)
  const featuredGames = games.filter((game) => game.featured).slice(0, site.homeGameSection.maxItems)
  const cards = featuredGames.length ? featuredGames : games.slice(0, site.homeGameSection.maxItems)

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-gray-50 px-4 py-24 dark:bg-[#0a0b0f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
            <span className="h-px w-9 bg-blue-500" />
            <Gamepad2 className="h-4 w-4" />
            {site.homeGameSection.eyebrow}
          </div>
          <h2 className="orbitron-font text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {site.homeGameSection.title}
          </h2>
          {site.homeGameSection.description && (
            <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              {site.homeGameSection.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--game-color)] dark:border-white/10 dark:bg-[#10131a]"
              style={{ "--game-color": game.primaryColor } as React.CSSProperties}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black">
                <Image
                  src={game.banner || "/placeholder.svg"}
                  alt={game.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                <div className="absolute left-4 top-4 h-12 w-12 overflow-hidden rounded-md border border-white/20 bg-black/40">
                  <Image
                    src={game.icon || "/placeholder.svg"}
                    alt={`${game.name} logo`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">{game.name}</h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  From <span className="font-semibold text-emerald-500">{game.startingAt}</span>
                </p>
                <span className="flex items-center justify-center rounded-md border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:text-blue-300">
                  View Plans
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-blue-500 hover:text-blue-500 dark:border-white/15 dark:text-white"
          >
            {site.homeGameSection.buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
