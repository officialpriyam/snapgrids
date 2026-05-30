import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Quicksand } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { LayoutWrapper } from "./components/layout-wrapper";
import { LanguageProvider } from "./contexts/LanguageContext";
import CookieConsent from "./components/CookieConsent";
import ThemeSwitcher from "./components/ThemeSwitcher";
import ChristmasSnowfall from "./components/ChristmasSnowfall";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const siteUrl = "https://snapgrids.store";
const seoTitle = "SnapGrids - Cheap Game Server, VPS & Web Hosting in INR";
const seoDescription =
  "SnapGrids provides affordable high-performance game server hosting, VPS hosting, web hosting, Discord bot hosting, and dedicated servers with NVMe storage, DDoS protection, INR pricing, and fast global connectivity.";
const seoKeywords = [
  "cheap game server hosting",
  "best game hosting",
  "high performance game hosting",
  "minecraft server hosting",
  "rust server hosting",
  "palworld server hosting",
  "ARK server hosting",
  "VPS hosting",
  "cheap VPS hosting",
  "web hosting India",
  "Discord bot hosting",
  "dedicated server hosting",
  "NVMe hosting",
  "DDoS protected hosting",
  "low latency hosting",
  "INR hosting plans",
  "SnapGrids",
];

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e40af" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: "%s | SnapGrids"
  },
  description: seoDescription,
  keywords: seoKeywords,
  authors: [{ name: "Anthony" }],
  creator: "Anthony",
  publisher: "SnapGrids",
  category: "Game Server Hosting, VPS Hosting, Web Hosting, and Dedicated Servers",
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US", "en_GB"],
    url: siteUrl,
    siteName: "SnapGrids",
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: "/meta/Banner.png",
        width: 1200,
        height: 630,
        alt: "SnapGrids high-performance hosting for games, VPS, web hosting, and dedicated servers",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: ["/meta/Banner.png"]
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    google: "vzsKvhNUgAPlCbf1annB0Sl-bttSFos87mhOyQSU2aY", 
  },

  applicationName: "SnapGrids",
  referrer: "origin-when-cross-origin",

  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/meta/Logo.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/meta/Logo.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: "/favicon.ico"
  },

  alternates: {
    canonical: siteUrl,
    languages: {
      "en-IN": siteUrl,
      "en-US": siteUrl,
      "x-default": siteUrl,
    },
  },
  other: {
    "msapplication-TileColor": "#1e40af",
    "msapplication-config": "/browserconfig.xml",
    "terms-of-service": `${siteUrl}/terms-of-services`,
    "privacy-policy": `${siteUrl}/privacy-policy`,
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.country": "India",
    "distribution": "global",
    "rating": "general",
    "target": "game server hosting, VPS hosting, web hosting, dedicated servers",
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "SnapGrids",
      url: siteUrl,
      logo: `${siteUrl}/meta/Logo.png`,
      description: seoDescription,
      sameAs: ["https://discord.gg/Qrzn2enUP2"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["English", "Hindi"],
          url: "https://discord.gg/Qrzn2enUP2",
        },
      ],
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Place", name: "Worldwide" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "SnapGrids",
      description: seoDescription,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteUrl}/#organization` },
      keywords: seoKeywords.join(", "),
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#hosting-services`,
      name: "SnapGrids hosting services",
      description: seoDescription,
      serviceType: [
        "Game Server Hosting",
        "VPS Hosting",
        "Web Hosting",
        "Discord Bot Hosting",
        "Dedicated Server Hosting",
      ],
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Place", name: "Worldwide" },
      ],
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: "75",
        offerCount: "5",
        availability: "https://schema.org/InStock",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Game, VPS, Web, Bot, and Dedicated Hosting Plans",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Game Server Hosting",
              url: `${siteUrl}/games`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "VPS Hosting",
              url: `${siteUrl}/vps`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Web Hosting",
              url: `${siteUrl}/webhosting`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Discord Bot Hosting",
              url: `${siteUrl}/discord`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Dedicated Server Hosting",
              url: `${siteUrl}/dedicated`,
            },
          },
        ],
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SnapGrids" />
        <meta name="revisit-after" content="7 days" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${quicksand.variable} antialiased min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <ChristmasSnowfall />
            <LayoutWrapper>
              {children}
              <Analytics />
            </LayoutWrapper>
            <CookieConsent />
            <ThemeSwitcher />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
