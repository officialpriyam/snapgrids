import gamesConfig from "../config/sections/games.json"
import legalConfig from "../config/sections/legal.json"
import pricingConfig from "../config/sections/pricing.json"
import type { GamesConfig } from "../types/games"
import type { LegalConfig, LegalPageConfig, LegalSection } from "../types/legal"
import type { PricingConfig } from "../types/pricing"
import type {
  CmsFooter,
  CmsFooterContact,
  CmsFooterLink,
  CmsGamePage,
  CmsHomeGameSection,
  CmsServicePage,
  SiteContent,
} from "../types/site"
import type { AdminMappings } from "../types/paymenter"

const gameDefaults = gamesConfig as GamesConfig
const legalDefaults = legalConfig as LegalConfig
const pricingDefaults = pricingConfig as PricingConfig

const defaultServices: CmsServicePage[] = [
  {
    id: "vps",
    slug: "vps",
    route: "/vps",
    name: "VPS Hosting",
    label: "VPS",
    description: "High-performance virtual servers with fast NVMe storage and flexible resources.",
    icon: "/vps.png",
    banner: "/vps/vps-hero-2.webp",
    primaryColor: "#3b82f6",
    startingAt: "$2.70/mo",
    visible: true,
    categoryId: "",
  },
  {
    id: "dedicated",
    slug: "dedicated",
    route: "/dedicated",
    name: "Dedicated Servers",
    label: "Dedicated",
    description: "Bare-metal machines for demanding workloads and production hosting.",
    icon: "/dedicated.webp",
    banner: "/dedicated.webp",
    primaryColor: "#3b82f6",
    startingAt: "$99.99/mo",
    visible: true,
    categoryId: "",
  },
  {
    id: "webhosting",
    slug: "webhosting",
    route: "/webhosting",
    name: "Web Hosting",
    label: "Web Hosting",
    description: "Fast and reliable web hosting for websites, apps, and business projects.",
    icon: "/banners/webhosting.png",
    banner: "/banners/webhosting.png",
    primaryColor: "#3b82f6",
    startingAt: "$2.99/mo",
    visible: true,
    categoryId: "",
  },
  {
    id: "discord",
    slug: "discord",
    route: "/discord",
    name: "Discord Bot Hosting",
    label: "Discord Bot",
    description: "Reliable Node.js hosting for Discord bots and lightweight applications.",
    icon: "/icons/nodejs.png",
    banner: "/banners/node.webp",
    primaryColor: "#22c55e",
    startingAt: "$0.90/mo",
    visible: true,
    categoryId: "",
  },
]

export function slugifySiteId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback
}

function positiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

function bool(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback
}

function normalizeRoute(route: string, slug: string) {
  const clean = route.trim()
  return clean.startsWith("/") ? clean : `/hosting/${slug}`
}

function defaultGames(): CmsGamePage[] {
  return gameDefaults.games.map((game) => ({
    id: game.id,
    slug: game.id,
    name: game.name,
    description: game.description,
    icon: game.icon,
    banner: game.banner,
    primaryColor: game.primaryColor,
    startingAt: game.startingAt,
    featured: game.featured,
    visible: true,
    categoryId: "",
  }))
}

function serviceDefaultsFromPricing() {
  const priceByRoute = new Map(
    pricingDefaults.section.plans.map((plan) => [plan.link, `$${plan.basePrice.toFixed(2)}/mo`])
  )

  return defaultServices.map((service) => ({
    ...service,
    startingAt: priceByRoute.get(service.route) ?? service.startingAt,
  }))
}

function mergeBySlug<T extends { slug: string }>(defaults: T[], current: T[]) {
  const bySlug = new Map(defaults.map((item) => [item.slug, item]))
  for (const item of current) {
    bySlug.set(item.slug, item)
  }
  return Array.from(bySlug.values())
}

function normalizeGamePage(value: Partial<CmsGamePage>, fallback: CmsGamePage, mappings: AdminMappings): CmsGamePage {
  const name = text(value.name, fallback.name)
  const slug = slugifySiteId(text(value.slug, fallback.slug) || name) || fallback.slug

  return {
    id: text(value.id, slug),
    slug,
    name,
    description: text(value.description, fallback.description),
    icon: text(value.icon, fallback.icon),
    banner: text(value.banner, fallback.banner),
    primaryColor: text(value.primaryColor, fallback.primaryColor),
    startingAt: text(value.startingAt, fallback.startingAt),
    featured: bool(value.featured, fallback.featured),
    visible: bool(value.visible, fallback.visible),
    categoryId: text(value.categoryId, mappings.games[slug] ?? mappings.games[fallback.slug] ?? fallback.categoryId),
  }
}

function normalizeServicePage(
  value: Partial<CmsServicePage>,
  fallback: CmsServicePage,
  mappings: AdminMappings
): CmsServicePage {
  const name = text(value.name, fallback.name)
  const slug = slugifySiteId(text(value.slug, fallback.slug) || name) || fallback.slug

  return {
    id: text(value.id, slug),
    slug,
    route: normalizeRoute(text(value.route, fallback.route), slug),
    name,
    label: text(value.label, fallback.label),
    description: text(value.description, fallback.description),
    icon: text(value.icon, fallback.icon),
    banner: text(value.banner, fallback.banner),
    primaryColor: text(value.primaryColor, fallback.primaryColor),
    startingAt: text(value.startingAt, fallback.startingAt),
    visible: bool(value.visible, fallback.visible),
    categoryId: text(value.categoryId, mappings.pages[slug] ?? mappings.pages[fallback.slug] ?? fallback.categoryId),
  }
}

function normalizeLegalSection(value: Partial<LegalSection>, fallback?: LegalSection): LegalSection {
  return {
    title: text(value.title, fallback?.title ?? "Section"),
    content: text(value.content, fallback?.content ?? ""),
  }
}

function normalizeLegalPage(value: Partial<LegalPageConfig>, fallback: LegalPageConfig): LegalPageConfig {
  const rawSections = Array.isArray(value.sections) ? value.sections : fallback.sections
  const fallbackSections = fallback.sections

  return {
    title: text(value.title, fallback.title),
    lastUpdated: text(value.lastUpdated, fallback.lastUpdated),
    companyName: text(value.companyName, fallback.companyName),
    websiteUrl: text(value.websiteUrl, fallback.websiteUrl),
    contactEmail: text(value.contactEmail, fallback.contactEmail),
    sections: rawSections.map((section, index) =>
      normalizeLegalSection(section as Partial<LegalSection>, fallbackSections[index])
    ),
  }
}

function normalizeLink(value: Partial<CmsFooterLink>, fallback: CmsFooterLink): CmsFooterLink {
  return {
    label: text(value.label, fallback.label),
    href: text(value.href, fallback.href),
  }
}

function normalizeContact(value: Partial<CmsFooterContact>, fallback: CmsFooterContact): CmsFooterContact {
  const icon = value.icon === "phone" || value.icon === "gamepad" || value.icon === "mail" ? value.icon : fallback.icon

  return {
    label: text(value.label, fallback.label),
    value: text(value.value, fallback.value),
    href: text(value.href, fallback.href),
    icon,
  }
}

function normalizeFooter(value: Partial<CmsFooter> | undefined): CmsFooter {
  const fallback = defaultFooter()
  const rawQuickLinks = Array.isArray(value?.quickLinks) ? value?.quickLinks ?? [] : fallback.quickLinks
  const rawLegalLinks = Array.isArray(value?.legalLinks) ? value?.legalLinks ?? [] : fallback.legalLinks
  const rawContacts = Array.isArray(value?.contacts) ? value?.contacts ?? [] : fallback.contacts

  return {
    logo: text(value?.logo, fallback.logo),
    description: text(value?.description, fallback.description),
    credit: text(value?.credit, fallback.credit),
    copyright: text(value?.copyright, fallback.copyright),
    quickLinks: rawQuickLinks.map((link, index) => normalizeLink(link as Partial<CmsFooterLink>, fallback.quickLinks[index] ?? { label: "Link", href: "/" })),
    legalLinks: rawLegalLinks.map((link, index) => normalizeLink(link as Partial<CmsFooterLink>, fallback.legalLinks[index] ?? { label: "Legal", href: "/" })),
    contacts: rawContacts.map((contact, index) =>
      normalizeContact(contact as Partial<CmsFooterContact>, fallback.contacts[index] ?? { label: "Contact", value: "", href: "#", icon: "mail" })
    ),
  }
}

export function defaultFooter(): CmsFooter {
  return {
    logo: "/meta/Logo.png",
    description: "Premium hosting infrastructure for game servers, virtual servers, dedicated machines, and web projects.",
    credit: "Made by Anthony S",
    copyright: "DezerNova. All rights reserved.",
    quickLinks: [
      { label: "Client Area", href: "#" },
      { label: "Discord", href: "#" },
      { label: "VPS Hosting", href: "/vps" },
      { label: "Dedicated Servers", href: "/dedicated" },
      { label: "Game Servers", href: "/games" },
    ],
    legalLinks: [
      { label: "Terms of Service", href: "/terms-of-services" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
    contacts: [
      { icon: "mail", label: "Email", value: "support@dezerx.com", href: "mailto:support@dezerx.com" },
      { icon: "phone", label: "Phone", value: "N/A", href: "tel:+15551234567" },
      { icon: "gamepad", label: "Game Panel", value: "panel.dezerx.com", href: "https://panel.dezerx.com" },
    ],
  }
}

export function defaultSiteContent(mappings: AdminMappings): SiteContent {
  return sanitizeSiteContent(undefined, mappings)
}

export function sanitizeSiteContent(value: Partial<SiteContent> | undefined, mappings: AdminMappings): SiteContent {
  const defaultGamePages = defaultGames()
  const defaultServicePages = serviceDefaultsFromPricing()
  const currentGames = Array.isArray(value?.games)
    ? value?.games.map((game) => game as Partial<CmsGamePage>) ?? []
    : []
  const currentServices = Array.isArray(value?.services)
    ? value?.services.map((service) => service as Partial<CmsServicePage>) ?? []
    : []

  const normalizedGames = mergeBySlug(
    defaultGamePages,
    currentGames.map((game) => {
      const slug = slugifySiteId(text(game.slug, game.id ?? game.name ?? "game"))
      const fallback = defaultGamePages.find((item) => item.slug === slug || item.id === game.id) ?? {
        ...defaultGamePages[0],
        id: slug,
        slug,
        name: text(game.name, "New Game"),
        description: "",
        icon: "/placeholder.svg",
        banner: "/placeholder.svg",
        primaryColor: "#3b82f6",
        startingAt: "$0.00/mo",
        featured: false,
      }
      return normalizeGamePage(game, fallback, mappings)
    })
  ).map((game) => normalizeGamePage(game, game, mappings))

  const normalizedServices = mergeBySlug(
    defaultServicePages,
    currentServices.map((service) => {
      const slug = slugifySiteId(text(service.slug, service.id ?? service.name ?? "service"))
      const fallback = defaultServicePages.find((item) => item.slug === slug || item.id === service.id) ?? {
        ...defaultServicePages[0],
        id: slug,
        slug,
        route: `/hosting/${slug}`,
        name: text(service.name, "New Hosting Page"),
        label: text(service.label, "Hosting"),
        description: "",
        icon: "/placeholder.svg",
        banner: "/placeholder.svg",
        primaryColor: "#3b82f6",
        startingAt: "$0.00/mo",
      }
      return normalizeServicePage(service, fallback, mappings)
    })
  ).map((service) => normalizeServicePage(service, service, mappings))

  const homeGameSection: CmsHomeGameSection = {
    eyebrow: text(value?.homeGameSection?.eyebrow, "Popular Game Hosting"),
    title: text(value?.homeGameSection?.title, "Start With The Game You Run"),
    description: text(value?.homeGameSection?.description, ""),
    buttonText: text(value?.homeGameSection?.buttonText, "View All Games"),
    maxItems: positiveInteger(value?.homeGameSection?.maxItems, 5),
  }

  return {
    homeGameSection,
    games: normalizedGames,
    services: normalizedServices,
    legal: {
      termsOfService: normalizeLegalPage(value?.legal?.termsOfService ?? {}, legalDefaults.termsOfService),
      privacyPolicy: normalizeLegalPage(value?.legal?.privacyPolicy ?? {}, legalDefaults.privacyPolicy),
    },
    footer: normalizeFooter(value?.footer),
  }
}

export function syncMappingsFromSite(mappings: AdminMappings, site: SiteContent): AdminMappings {
  return {
    homepage: { ...mappings.homepage },
    pages: {
      ...mappings.pages,
      ...Object.fromEntries(site.services.map((service) => [service.slug, service.categoryId])),
    },
    games: {
      ...mappings.games,
      ...Object.fromEntries(site.games.map((game) => [game.slug, game.categoryId])),
    },
  }
}

export function visibleGames(site: SiteContent) {
  return site.games.filter((game) => game.visible)
}

export function visibleServices(site: SiteContent) {
  return site.services.filter((service) => service.visible)
}

export function findGamePage(site: SiteContent, slug: string) {
  return site.games.find((game) => game.slug === slug || game.id === slug)
}

export function findServicePage(site: SiteContent, slug: string) {
  return site.services.find((service) => service.slug === slug || service.id === slug)
}
