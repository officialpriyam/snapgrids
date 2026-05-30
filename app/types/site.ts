import type { LegalConfig } from "./legal"

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
  visible: boolean
  categoryId: string
}

export interface CmsHomeGameSection {
  eyebrow: string
  title: string
  description: string
  buttonText: string
  maxItems: number
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
  homeGameSection: CmsHomeGameSection
  games: CmsGamePage[]
  services: CmsServicePage[]
  legal: LegalConfig
  footer: CmsFooter
}
