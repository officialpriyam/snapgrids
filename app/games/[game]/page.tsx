import type { Metadata } from "next"
import { notFound } from "next/navigation"
import GameServerListWrapper from "../../components/games/GameServerListWrapper"
import FeaturesSection from "../../components/FeaturesSection"
import LocationsSection from "../../components/LocationsSection"
import FAQSection from "../../components/FAQSection"
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import PanelShowcase from "../../components/PanelShowcase"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findGamePage, visibleGames } from "../../lib/site-content"

export const dynamic = "force-dynamic"

type GamePageProps = {
  params: Promise<{
    game: string
  }>
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { game: gameSlug } = await params
  const site = await readPublicSiteContent()
  const game = findGamePage(site, gameSlug)

  if (!game) {
    return {
      title: "Game Hosting",
    }
  }

  return {
    title: `${game.name} Hosting`,
    description: game.description,
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: gameSlug } = await params
  const site = await readPublicSiteContent()
  const game = findGamePage(site, gameSlug)

  if (!game || !visibleGames(site).some((item) => item.slug === game.slug)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
      <GameServerListWrapper gameId={game.slug} gamePage={game} />
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  )
}
