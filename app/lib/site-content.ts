import gamesConfig from "../config/sections/games.json"
import heroConfig from "../config/sections/hero.json"
import legalConfig from "../config/sections/legal.json"
import navigationConfig from "../config/sections/navigation.json"
import pricingConfig from "../config/sections/pricing.json"
import type { GamesConfig } from "../types/games"
import type { HeroConfig } from "../types/hero"
import type { LegalConfig, LegalPageConfig, LegalSection } from "../types/legal"
import type { DropdownItem, NavigationConfig, NavigationItem, SocialLink } from "../types/navigation"
import type { PricingConfig } from "../types/pricing"
import type {
  CmsFooter,
  CmsFooterContact,
  CmsFooterLink,
  CmsGamePage,
  CmsHomeGameSection,
  CmsHomeHero,
  CmsHomeServiceSection,
  CmsLocation,
  CmsSeasonEffect,
  CmsServicePage,
  SiteContent,
} from "../types/site"
import type { AdminMappings } from "../types/paymenter"

const gameDefaults = gamesConfig as GamesConfig
const heroDefaults = heroConfig as HeroConfig
const legalDefaults = legalConfig as LegalConfig
const navigationDefaults = navigationConfig as NavigationConfig
const pricingDefaults = pricingConfig as PricingConfig

const defaultLocations: CmsLocation[] = [
  {
    id: "mumbai-in",
    name: "Mumbai",
    region: "India West",
    group: "India",
    flag: "/flags/india.png",
    ping: "low latency",
    status: "active",
    lat: 19.076,
    lng: 72.8777,
    visible: true,
  },
  {
    id: "frankfurt-de",
    name: "Frankfurt",
    region: "EU Central",
    group: "Europe",
    flag: "/flags/germany.png",
    ping: "low latency",
    status: "active",
    lat: 50.1109,
    lng: 8.6821,
    visible: true,
  },
  {
    id: "singapore-sg",
    name: "Singapore",
    region: "Asia Pacific",
    group: "Asia",
    flag: "/flags/singapore.png",
    ping: "low latency",
    status: "active",
    lat: 1.3521,
    lng: 103.8198,
    visible: true,
  },
  {
    id: "chicago-us",
    name: "Chicago, IL",
    region: "US Central",
    group: "Americas",
    flag: "/flags/usa.png",
    ping: "low latency",
    status: "active",
    lat: 41.8781,
    lng: -87.6298,
    visible: true,
  },
]

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
    startingAt: "\u20b9225/mo",
    featured: true,
    visible: true,
    comingSoon: false,
    comingSoonMessage: "",
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
    startingAt: "\u20b98,349/mo",
    featured: true,
    visible: true,
    comingSoon: false,
    comingSoonMessage: "",
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
    startingAt: "\u20b9249/mo",
    featured: true,
    visible: true,
    comingSoon: false,
    comingSoonMessage: "",
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
    startingAt: "\u20b975/mo",
    featured: true,
    visible: true,
    comingSoon: false,
    comingSoonMessage: "",
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

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeRoute(route: string, slug: string) {
  const clean = route.trim()
  return clean.startsWith("/") ? clean : `/hosting/${slug}`
}

function defaultHero(): CmsHomeHero {
  return {
    titlePrefix: "Host your own",
    titleSuffix: "Servers",
    description: "Experience lightning-fast performance, reliable support, and affordable hosting for games, VPS, web, Discord bots, and dedicated workloads.",
    primaryButtonText: "Get started",
    primaryButtonHref: "/games",
    secondaryButtonText: "View hosting",
    secondaryButtonHref: "/otherhosting",
    helperText: "Get started for free!",
    cycleInterval: positiveInteger(heroDefaults.hero.cycleInterval, 10000),
    slides: heroDefaults.hero.games.map((slide) => ({
      id: slugifySiteId(slide.id || slide.name),
      name: slide.name,
      displayName: slide.displayName,
      banner: slide.banner,
      color: slide.color,
      showSuffix: bool(slide.showSuffix, true),
      visible: bool(slide.showInDropdown, true),
    })),
  }
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
    comingSoon: false,
    comingSoonMessage: "",
    categoryId: "",
  }))
}

function serviceDefaultsFromPricing() {
  const priceByRoute = new Map(
    pricingDefaults.section.plans.map((plan) => [plan.link, `\u20b9${Math.round(plan.basePrice * 83.5).toLocaleString("en-IN")}/mo`])
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
    comingSoon: bool(value.comingSoon, fallback.comingSoon),
    comingSoonMessage: text(value.comingSoonMessage, fallback.comingSoonMessage),
    categoryId: text(value.categoryId, mappings.games[slug] ?? mappings.games[fallback.slug] ?? fallback.categoryId),
  }
}

function normalizeHeroSlide(value: Partial<CmsHomeHero["slides"][number]>, fallback: CmsHomeHero["slides"][number]): CmsHomeHero["slides"][number] {
  const name = text(value.name, fallback.name)
  const id = slugifySiteId(text(value.id, fallback.id) || name) || fallback.id

  return {
    id,
    name,
    displayName: text(value.displayName, fallback.displayName || name),
    banner: text(value.banner, fallback.banner),
    color: text(value.color, fallback.color),
    showSuffix: bool(value.showSuffix, fallback.showSuffix),
    visible: bool(value.visible, fallback.visible),
  }
}

function normalizeHero(value: Partial<CmsHomeHero> | undefined): CmsHomeHero {
  const fallback = defaultHero()
  const rawSlides = Array.isArray(value?.slides) ? value.slides : fallback.slides

  return {
    titlePrefix: text(value?.titlePrefix, fallback.titlePrefix),
    titleSuffix: text(value?.titleSuffix, fallback.titleSuffix),
    description: text(value?.description, fallback.description),
    primaryButtonText: text(value?.primaryButtonText, fallback.primaryButtonText),
    primaryButtonHref: text(value?.primaryButtonHref, fallback.primaryButtonHref),
    secondaryButtonText: text(value?.secondaryButtonText, fallback.secondaryButtonText),
    secondaryButtonHref: text(value?.secondaryButtonHref, fallback.secondaryButtonHref),
    helperText: text(value?.helperText, fallback.helperText),
    cycleInterval: positiveInteger(value?.cycleInterval, fallback.cycleInterval),
    slides: rawSlides.map((slide, index) =>
      normalizeHeroSlide(slide as Partial<CmsHomeHero["slides"][number]>, fallback.slides[index] ?? fallback.slides[0])
    ),
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
    featured: bool(value.featured, fallback.featured),
    visible: bool(value.visible, fallback.visible),
    comingSoon: bool(value.comingSoon, fallback.comingSoon),
    comingSoonMessage: text(value.comingSoonMessage, fallback.comingSoonMessage),
    categoryId: text(value.categoryId, mappings.pages[slug] ?? mappings.pages[fallback.slug] ?? fallback.categoryId),
  }
}

function normalizeHomeBoxSection(
  value: Partial<CmsHomeGameSection> | Partial<CmsHomeServiceSection> | undefined,
  fallback: CmsHomeGameSection | CmsHomeServiceSection
) {
  return {
    eyebrow: text(value?.eyebrow, fallback.eyebrow),
    title: text(value?.title, fallback.title),
    description: text(value?.description, fallback.description),
    buttonText: text(value?.buttonText, fallback.buttonText),
    maxItems: positiveInteger(value?.maxItems, fallback.maxItems),
  }
}

function normalizeLocation(value: Partial<CmsLocation>, fallback: CmsLocation): CmsLocation {
  const name = text(value.name, fallback.name)
  const id = slugifySiteId(text(value.id, fallback.id) || name) || fallback.id
  const status =
    value.status === "active" || value.status === "coming-soon" || value.status === "maintenance"
      ? value.status
      : fallback.status

  return {
    id,
    name,
    region: text(value.region, fallback.region),
    group: text(value.group, fallback.group),
    flag: text(value.flag, fallback.flag),
    ping: text(value.ping, fallback.ping),
    status,
    lat: numberValue(value.lat, fallback.lat),
    lng: numberValue(value.lng, fallback.lng),
    visible: bool(value.visible, fallback.visible),
  }
}

function normalizeLocations(value: unknown): CmsLocation[] {
  const rawLocations = Array.isArray(value) ? value : defaultLocations
  return rawLocations.map((location, index) =>
    normalizeLocation(location as Partial<CmsLocation>, defaultLocations[index] ?? defaultLocations[0])
  )
}

function normalizeSeasonEffect(value: Partial<CmsSeasonEffect> | undefined): CmsSeasonEffect {
  const type = value?.type === "winter" || value?.type === "christmas" || value?.type === "none" ? value.type : "christmas"

  return {
    enabled: bool(value?.enabled, true),
    type,
    snowflakeCount: Math.min(120, Math.max(0, positiveInteger(value?.snowflakeCount, 30))),
  }
}

function normalizeDropdownItem(value: Partial<DropdownItem>, fallback?: DropdownItem): DropdownItem {
  return {
    name: text(value.name, fallback?.name ?? "Menu item"),
    href: text(value.href, fallback?.href ?? "/"),
    description: text(value.description, fallback?.description ?? ""),
    icon: text(value.icon, fallback?.icon ?? ""),
  }
}

function normalizeNavigationItem(value: Partial<NavigationItem>, fallback?: NavigationItem): NavigationItem {
  const dropdownType =
    value.dropdownType === "games" || value.dropdownType === "legal" || value.dropdownType === "custom"
      ? value.dropdownType
      : fallback?.dropdownType
  const rawDropdownItems = Array.isArray(value.dropdownItems)
    ? value.dropdownItems
    : fallback?.dropdownItems ?? []

  return {
    name: text(value.name, fallback?.name ?? "Menu"),
    href: text(value.href, fallback?.href ?? "/"),
    icon: text(value.icon, fallback?.icon ?? ""),
    hasDropdown: bool(value.hasDropdown, fallback?.hasDropdown ?? false),
    dropdownType,
    dropdownItems: rawDropdownItems.map((item, index) =>
      normalizeDropdownItem(item as Partial<DropdownItem>, fallback?.dropdownItems?.[index])
    ),
  }
}

function normalizeSocialLink(value: Partial<SocialLink>, fallback?: SocialLink): SocialLink {
  return {
    name: text(value.name, fallback?.name ?? "Social"),
    href: text(value.href, fallback?.href ?? "#"),
    icon: text(value.icon, fallback?.icon ?? "discord"),
  }
}

function normalizeNavigation(value: Partial<NavigationConfig> | undefined): NavigationConfig {
  const rawNavigation = Array.isArray(value?.mainNavigation)
    ? value.mainNavigation
    : navigationDefaults.mainNavigation
  const rawSocialLinks = Array.isArray(value?.socialLinks)
    ? value.socialLinks
    : navigationDefaults.socialLinks

  return {
    mainNavigation: rawNavigation.map((item, index) =>
      normalizeNavigationItem(item as Partial<NavigationItem>, navigationDefaults.mainNavigation[index])
    ),
    socialLinks: rawSocialLinks.map((item, index) =>
      normalizeSocialLink(item as Partial<SocialLink>, navigationDefaults.socialLinks[index])
    ),
    clientSpace: {
      name: text(value?.clientSpace?.name, navigationDefaults.clientSpace.name),
      href: text(value?.clientSpace?.href, navigationDefaults.clientSpace.href),
      icon: text(value?.clientSpace?.icon, navigationDefaults.clientSpace.icon),
    },
    banner: {
      show: bool(value?.banner?.show, navigationDefaults.banner.show),
      text: text(value?.banner?.text, navigationDefaults.banner.text),
      couponCode: text(value?.banner?.couponCode, navigationDefaults.banner.couponCode),
      useThemeColor: bool(value?.banner?.useThemeColor, navigationDefaults.banner.useThemeColor ?? true),
      backgroundColor: text(value?.banner?.backgroundColor, navigationDefaults.banner.backgroundColor),
      fallbackColor: text(value?.banner?.fallbackColor, navigationDefaults.banner.fallbackColor),
    },
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
    credit: "Priyx",
    copyright: "SnapGrids. All rights reserved.",
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
      { icon: "mail", label: "Email", value: "support@snapgrids.store", href: "mailto:support@snapgrids.store" },
      { icon: "phone", label: "Phone", value: "N/A", href: "tel:+15551234567" },
      { icon: "gamepad", label: "Game Panel", value: "panel.snapgrids.store", href: "https://panel.snapgrids.store" },
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
        icon: "/meta/Logo.png",
        banner: "/meta/Banner.png",
        primaryColor: "#3b82f6",
        startingAt: "\u20b90/mo",
        featured: false,
        visible: true,
        comingSoon: false,
        comingSoonMessage: "",
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
        icon: "/meta/Logo.png",
        banner: "/meta/Banner.png",
        primaryColor: "#3b82f6",
        startingAt: "\u20b90/mo",
        featured: false,
        visible: true,
        comingSoon: false,
        comingSoonMessage: "",
      }
      return normalizeServicePage(service, fallback, mappings)
    })
  ).map((service) => normalizeServicePage(service, service, mappings))

  const homeGameSection = normalizeHomeBoxSection(value?.homeGameSection, {
    eyebrow: text(value?.homeGameSection?.eyebrow, "Popular Game Hosting"),
    title: "Start With The Game You Run",
    description: "",
    buttonText: "View All Games",
    maxItems: 5,
  })

  const homeServiceSection = normalizeHomeBoxSection(value?.homeServiceSection, {
    eyebrow: "Other Hosting",
    title: "Hosting For Every Workload",
    description: "Launch Discord bots, VPS servers, websites, and dedicated machines from one hosting platform.",
    buttonText: "View All Hosting",
    maxItems: 4,
  })

  return {
    hero: normalizeHero(value?.hero),
    homeGameSection,
    homeServiceSection,
    seasonEffect: normalizeSeasonEffect(value?.seasonEffect),
    locations: normalizeLocations(value?.locations),
    navigation: normalizeNavigation(value?.navigation),
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
