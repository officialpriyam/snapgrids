import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Server } from "lucide-react"
import { readPublicSiteContent } from "@/lib/public-site-config"
import { visibleServices } from "../../lib/site-content"

export default async function HomeOtherHostingSection() {
  const site = await readPublicSiteContent()
  const services = visibleServices(site)
  const featuredServices = services.filter((service) => service.featured).slice(0, site.homeServiceSection.maxItems)
  const cards = featuredServices.length ? featuredServices : services.slice(0, site.homeServiceSection.maxItems)

  if (cards.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-gray-50 px-4 pb-24 dark:bg-[#0a0b0f] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
            <span className="h-px w-9 bg-blue-500" />
            <Server className="h-4 w-4" />
            {site.homeServiceSection.eyebrow}
          </div>
          <h2 className="orbitron-font text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {site.homeServiceSection.title}
          </h2>
          {site.homeServiceSection.description && (
            <p className="mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              {site.homeServiceSection.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((service) => (
            <Link
              key={service.slug}
              href={service.route}
              className="group overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--service-color)] dark:border-white/10 dark:bg-[#10131a]"
              style={{ "--service-color": service.primaryColor } as React.CSSProperties}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <Image
                  src={service.banner || "/placeholder.svg"}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                <div className="absolute left-4 top-4 h-12 w-12 overflow-hidden rounded-md border border-white/20 bg-black/40">
                  <Image
                    src={service.icon || "/placeholder.svg"}
                    alt={`${service.name} logo`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                {service.comingSoon && (
                  <span className="absolute right-4 top-4 rounded-md bg-yellow-400 px-2 py-1 text-xs font-semibold text-black">
                    Coming Soon
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">{service.name}</h3>
                <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                  From <span className="font-semibold text-emerald-500">{service.startingAt}</span>
                </p>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                <span className="flex items-center justify-center rounded-md border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white dark:text-blue-300">
                  View Plans
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/otherhosting"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-blue-500 hover:text-blue-500 dark:border-white/15 dark:text-white"
          >
            {site.homeServiceSection.buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
