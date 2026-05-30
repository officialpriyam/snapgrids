import type { Metadata } from "next"
import { notFound } from "next/navigation"
import GameServerListWrapper from "../../components/games/GameServerListWrapper"
import FeaturesSection from "../../components/FeaturesSection"
import LocationsSection from "../../components/LocationsSection"
import FAQSection from "../../components/FAQSection"
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import PanelShowcase from "../../components/PanelShowcase"
import ComingSoonSection from "../../components/ComingSoonSection"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findGamePage, visibleGames } from "../../lib/site-content"

export const dynamic = "force-dynamic"
const siteUrl = "https://snapgrids.store"

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
    title: `Cheap ${game.name} Server Hosting from ${game.startingAt}`,
    description: `${game.description} Get high-performance ${game.name} server hosting from ${game.startingAt} with NVMe storage, DDoS protection, and fast global connectivity.`,
    alternates: {
      canonical: `/games/${game.slug}`,
    },
    openGraph: {
      title: `${game.name} Server Hosting | SnapGrids`,
      description: `${game.description} Starting from ${game.startingAt}.`,
      url: `${siteUrl}/games/${game.slug}`,
      images: game.banner ? [{ url: game.banner, alt: `${game.name} server hosting` }] : undefined,
    },
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { game: gameSlug } = await params
  const site = await readPublicSiteContent()
  const game = findGamePage(site, gameSlug)

  if (!game || !visibleGames(site).some((item) => item.slug === game.slug)) {
    notFound()
  }

  if (game.comingSoon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
        <Navbar />
        <ComingSoonSection
          title={`${game.name} Hosting`}
          description={game.comingSoonMessage || game.description}
          image={game.banner}
          color={game.primaryColor}
          backHref="/games"
          backLabel="Back to games"
        />
        <Footer />
      </div>
    )
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
