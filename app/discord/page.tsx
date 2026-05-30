import type { Metadata } from "next"
import DiscordPricingSection from '../components/discord/DiscordPricingSection';
import FeaturesSection from "../components/FeaturesSection"
import FAQSection from "../components/FAQSection"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar";
import PanelShowcase from "../components/PanelShowcase"
import LocationsSection from '../components/LocationsSection';
import ComingSoonSection from "../components/ComingSoonSection"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findServicePage } from "../lib/site-content"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "discord")

  return {
    title: `Cheap ${pageConfig?.name || "Discord Bot Hosting"} from ${pageConfig?.startingAt || "\u20b975/mo"}`,
    description:
      pageConfig?.description ||
      "Reliable Discord bot hosting for Node.js bots and lightweight apps with INR pricing, NVMe storage, and DDoS protection.",
    alternates: {
      canonical: "/discord",
    },
    openGraph: {
      title: "Cheap Discord Bot Hosting | SnapGrids",
      description: "Reliable Discord bot hosting for Node.js bots and lightweight apps with INR pricing.",
      url: "/discord",
    },
  }
}

export default async function DiscordPage() {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "discord")

  if (pageConfig?.comingSoon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
        <Navbar />
        <ComingSoonSection
          title={pageConfig.name}
          description={pageConfig.comingSoonMessage || pageConfig.description}
          image={pageConfig.banner}
          color={pageConfig.primaryColor}
        />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
      <DiscordPricingSection pageConfig={pageConfig} />
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  );
}
