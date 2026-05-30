import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Gamepad2 } from "lucide-react"
import FeaturesSection from "../components/FeaturesSection"
import LocationsSection from "../components/LocationsSection"
import FAQSection from "../components/FAQSection"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar"
import PanelShowcase from "../components/PanelShowcase"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { visibleGames } from "../lib/site-content"

export const dynamic = "force-dynamic"

export default async function GamesPage() {
  const site = await readPublicSiteContent()
  const games = visibleGames(site)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
      <main className="relative overflow-hidden px-4 pt-36 pb-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(59,130,246,0.12)_0%,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl bg-blue-500/10 px-4 py-2 text-sm text-blue-500">
              <Gamepad2 className="h-4 w-4" />
              Game Servers
            </div>
            <h1 className="orbitron-font mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Pick a <span className="text-blue-500">Game</span>
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300">
              High-performance servers tuned for popular multiplayer games and bot hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group relative min-h-[260px] overflow-hidden rounded-xl border border-white/10 bg-white/10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--game-color)]/50 dark:bg-gray-900/20"
                style={{ "--game-color": game.primaryColor } as React.CSSProperties}
                prefetch
              >
                <Image
                  src={game.banner || "/placeholder.svg"}
                  alt={game.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                {game.comingSoon && (
                  <span className="absolute right-4 top-4 rounded-md bg-yellow-400 px-2 py-1 text-xs font-semibold text-black">
                    Coming Soon
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/20">
                      <Image
                        src={game.icon || "/placeholder.svg"}
                        alt={`${game.name} icon`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{game.name}</h2>
                      <p className="text-sm text-white/70">Starting at {game.startingAt}</p>
                    </div>
                  </div>
                  <p className="mb-5 line-clamp-2 text-sm text-white/80">{game.description}</p>
                  <span className="inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl bg-[var(--game-color)] px-4 py-2 text-sm font-semibold text-white transition-opacity group-hover:opacity-90">
                    View Plans
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  )
}
