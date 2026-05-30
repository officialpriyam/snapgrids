import type { Metadata } from "next"
import WebHostingPricingSection from '../components/webhosting/WebHostingPricingSection';
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
  const pageConfig = findServicePage(site, "webhosting")

  return {
    title: `Cheap ${pageConfig?.name || "Web Hosting"} from ${pageConfig?.startingAt || "\u20b9249/mo"}`,
    description:
      pageConfig?.description ||
      "Fast web hosting for websites, apps, and business projects with NVMe-backed infrastructure and INR pricing from SnapGrids.",
    alternates: {
      canonical: "/webhosting",
    },
    openGraph: {
      title: "Cheap Web Hosting | SnapGrids",
      description: "Fast web hosting for websites, apps, and business projects with INR pricing.",
      url: "/webhosting",
    },
  }
}

export default async function WebHostingPage() {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "webhosting")

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
      <WebHostingPricingSection pageConfig={pageConfig} />
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  );
}
