import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Navbar from "../../components/Navbar"
import FeaturesSection from "../../components/FeaturesSection"
import LocationsSection from "../../components/LocationsSection"
import FAQSection from "../../components/FAQSection"
import PanelShowcase from "../../components/PanelShowcase"
import Footer from "../../components/Footer"
import GenericServicePricingSection from "../../components/services/GenericServicePricingSection"
import ComingSoonSection from "../../components/ComingSoonSection"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findServicePage, visibleServices } from "../../lib/site-content"

export const dynamic = "force-dynamic"
const siteUrl = "https://snapgrids.store"

type ServicePageProps = {
  params: Promise<{
    service: string
  }>
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { service } = await params
  const site = await readPublicSiteContent()
  const page = findServicePage(site, service)

  return {
    title: page ? `Cheap ${page.name} from ${page.startingAt}` : "Hosting",
    description: page
      ? `${page.description} Start ${page.name.toLowerCase()} from ${page.startingAt} with SnapGrids NVMe infrastructure, DDoS protection, and fast global connectivity.`
      : "Affordable high-performance hosting from SnapGrids.",
    alternates: {
      canonical: page?.route || `/hosting/${service}`,
    },
    openGraph: page
      ? {
          title: `${page.name} | SnapGrids`,
          description: `${page.description} Starting from ${page.startingAt}.`,
          url: `${siteUrl}${page.route}`,
          images: page.banner ? [{ url: page.banner, alt: `${page.name} by SnapGrids` }] : undefined,
        }
      : undefined,
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params
  const site = await readPublicSiteContent()
  const page = findServicePage(site, service)

  if (!page || !visibleServices(site).some((item) => item.slug === page.slug)) {
    notFound()
  }

  if (page.comingSoon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
        <Navbar />
        <ComingSoonSection
          title={page.name}
          description={page.comingSoonMessage || page.description}
          image={page.banner}
          color={page.primaryColor}
          backHref="/"
        />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
      <GenericServicePricingSection page={page} />
      <FeaturesSection />
      <LocationsSection />
      <FAQSection />
      <PanelShowcase />
      <Footer />
    </div>
  )
}
