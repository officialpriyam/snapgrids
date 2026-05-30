import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Navbar from "../../components/Navbar"
import FeaturesSection from "../../components/FeaturesSection"
import LocationsSection from "../../components/LocationsSection"
import FAQSection from "../../components/FAQSection"
import PanelShowcase from "../../components/PanelShowcase"
import Footer from "../../components/Footer"
import GenericServicePricingSection from "../../components/services/GenericServicePricingSection"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findServicePage, visibleServices } from "../../lib/site-content"

export const dynamic = "force-dynamic"

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
    title: page ? page.name : "Hosting",
    description: page?.description,
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params
  const site = await readPublicSiteContent()
  const page = findServicePage(site, service)

  if (!page || !visibleServices(site).some((item) => item.slug === page.slug)) {
    notFound()
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
