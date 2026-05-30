import type React from "react"
import Link from "next/link"
import { Clock, ArrowLeft } from "lucide-react"

type ComingSoonSectionProps = {
  title: string
  description?: string
  image?: string
  color?: string
  backHref?: string
  backLabel?: string
}

export default function ComingSoonSection({
  title,
  description,
  image,
  color = "#3b82f6",
  backHref = "/",
  backLabel = "Back to home",
}: ComingSoonSectionProps) {
  return (
    <section
      className="relative flex min-h-[72vh] items-center overflow-hidden bg-gray-950 px-4 py-32 text-white sm:px-6 lg:px-8"
      style={{ "--page-color": color } as React.CSSProperties}
    >
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('${image.replace(/'/g, "%27")}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/70" />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-[var(--page-color)]">
          <Clock className="h-4 w-4" />
          Coming Soon
        </div>
        <h1 className="orbitron-font max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
          {description || "This page is being prepared. Check back soon for plans and ordering."}
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-semibold transition-colors hover:border-[var(--page-color)] hover:text-[var(--page-color)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    </section>
  )
}
