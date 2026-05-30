import WebHostingPricingSection from '../components/webhosting/WebHostingPricingSection';
import FeaturesSection from "../components/FeaturesSection"
import FAQSection from "../components/FAQSection"
import Footer from "../components/Footer"
import Navbar from "../components/Navbar";
import PanelShowcase from "../components/PanelShowcase"
import LocationsSection from '../components/LocationsSection';
import { readPublicSiteContent } from "@/lib/public-site-config"
import { findServicePage } from "../lib/site-content"

export const dynamic = "force-dynamic"

export default async function WebHostingPage() {
  const site = await readPublicSiteContent()
  const pageConfig = findServicePage(site, "webhosting")

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
