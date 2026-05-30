import type { LegalConfig } from "./legal"
import type { NavigationConfig } from "./navigation"

export interface CmsGamePage {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  banner: string
  primaryColor: string
  startingAt: string
  featured: boolean
  visible: boolean
  comingSoon: boolean
  comingSoonMessage: string
  categoryId: string
}

export interface CmsServicePage {
  id: string
  slug: string
  route: string
  name: string
  label: string
  description: string
  icon: string
  banner: string
  primaryColor: string
  startingAt: string
  featured: boolean
  visible: boolean
  comingSoon: boolean
  comingSoonMessage: string
  categoryId: string
}

export interface CmsHomeBoxSection {
  eyebrow: string
  title: string
  description: string
  buttonText: string
  maxItems: number
}

export type CmsHomeGameSection = CmsHomeBoxSection
export type CmsHomeServiceSection = CmsHomeBoxSection

export interface CmsHeroSlide {
  id: string
  name: string
  displayName: string
  banner: string
  color: string
  showSuffix: boolean
  visible: boolean
}

export interface CmsHomeHero {
  titlePrefix: string
  titleSuffix: string
  description: string
  primaryButtonText: string
  primaryButtonHref: string
  secondaryButtonText: string
  secondaryButtonHref: string
  helperText: string
  cycleInterval: number
  slides: CmsHeroSlide[]
}

export interface CmsLocation {
  id: string
  name: string
  region: string
  group: string
  flag: string
  ping: string
  status: "active" | "coming-soon" | "maintenance"
  lat: number
  lng: number
  visible: boolean
}

export interface CmsSeasonEffect {
  enabled: boolean
  type: "none" | "winter" | "christmas"
  snowflakeCount: number
}

export interface CmsFooterLink {
  label: string
  href: string
}

export interface CmsFooterContact {
  label: string
  value: string
  href: string
  icon: "mail" | "phone" | "gamepad"
}

export interface CmsFooter {
  logo: string
  description: string
  credit: string
  copyright: string
  quickLinks: CmsFooterLink[]
  legalLinks: CmsFooterLink[]
  contacts: CmsFooterContact[]
}

export interface SiteContent {
  hero: CmsHomeHero
  homeGameSection: CmsHomeGameSection
  homeServiceSection: CmsHomeServiceSection
  seasonEffect: CmsSeasonEffect
  locations: CmsLocation[]
  navigation: NavigationConfig
  games: CmsGamePage[]
  services: CmsServicePage[]
  legal: LegalConfig
  footer: CmsFooter
}
