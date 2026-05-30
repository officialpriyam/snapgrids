import type { Metadata } from "next"
import FeaturesSection from "../components/FeaturesSection"
import LocationsSection from "../components/LocationsSection"
import VPSPricingSection from "../components/vps/VPSPricingSection"
import OSSelectionSection from "../components/vps/OSSelectionSection"
import FAQSection from "../components/FAQSection"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar";
import PanelShowcase from "../components/PanelShowcase"
import ComingSoonSection from "../components/ComingSoonSection"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findServicePage } from "../lib/site-content"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "vps")

  return {
    title: `Cheap ${pageConfig?.name || "VPS Hosting"} from ${pageConfig?.startingAt || "\u20b9225/mo"}`,
    description:
      pageConfig?.description ||
      "High-performance VPS hosting with NVMe storage, DDoS protection, scalable resources, and INR pricing from SnapGrids.",
    alternates: {
      canonical: "/vps",
    },
    openGraph: {
      title: "Cheap VPS Hosting | SnapGrids",
      description: "High-performance VPS hosting with NVMe storage, DDoS protection, and INR pricing.",
      url: "/vps",
    },
  }
}

export default async function Home() {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "vps")

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
      <VPSPricingSection pageConfig={pageConfig} />
      <OSSelectionSection />
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  )
}
