import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import PanelShowcase from "./components/PanelShowcase"
import LocationsSection from "./components/LocationsSection"
import FAQSection from "./components/FAQSection"
import HomeGameHostingSection from "./components/home/HomeGameHostingSection"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] transition-colors duration-300">
      <Navbar />
        <HeroSection />
        <FeaturesSection />
        <LocationsSection />
        <HomeGameHostingSection />
        <FAQSection />
        <PanelShowcase />
        <Footer />
    </div>
  )
}
