import type { Metadata } from "next"
import { lazy, Suspense } from 'react'
import Navbar from "../components/Navbar"
import VDSPricingSection from "../components/dedicated/VDSPricingSection"
import ComingSoonSection from "../components/ComingSoonSection"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findServicePage } from "../lib/site-content"

const OSSelectionSection = lazy(() => import("../components/vps/OSSelectionSection"))
const FeaturesSection = lazy(() => import("../components/FeaturesSection"))
const LocationsSection = lazy(() => import("../components/LocationsSection"))
const FAQSection = lazy(() => import("../components/FAQSection"))
const Footer = lazy(() => import("../components/Footer"))
const PanelShowcase = lazy(() => import("../components/PanelShowcase"))


export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "dedicated")

  return {
    title: `Dedicated Server Hosting from ${pageConfig?.startingAt || "\u20b98,349/mo"}`,
    description:
      pageConfig?.description ||
      "Dedicated server hosting with bare-metal performance, NVMe storage options, DDoS protection, and INR pricing from SnapGrids.",
    alternates: {
      canonical: "/dedicated",
    },
    openGraph: {
      title: "Dedicated Server Hosting | SnapGrids",
      description: "Bare-metal dedicated server hosting with high performance infrastructure and INR pricing.",
      url: "/dedicated",
    },
  }
}

export default async function DedicatedPage() {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "dedicated")

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
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
      <VDSPricingSection pageConfig={pageConfig} />
      <Suspense fallback={null}>
        <OSSelectionSection />
      </Suspense>
      
      <Suspense fallback={null}>
        <FeaturesSection />
      </Suspense>
      
      <Suspense fallback={null}>
        <LocationsSection />
      </Suspense>
      
      <Suspense fallback={null}>
        <FAQSection />
      </Suspense>

       <Suspense fallback={null}>
        <PanelShowcase />
      </Suspense>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}
