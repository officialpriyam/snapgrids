import type { PaymenterPlanCard } from "../types/paymenter"

export interface ParsedPlanSpecs {
  displayName: string
  description: string
  ram: string
  cpu: string
  storage: string
  bandwidth: string
  ddos: string
  port: string
  features: string[]
}

const emptySpec = "Included"

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim()
}

function normalizeUnit(value: string) {
  return value.toUpperCase().replace("IB", "B")
}

function pick(regexes: RegExp[], source: string, format: (match: RegExpMatchArray) => string) {
  for (const regex of regexes) {
    const match = source.match(regex)
    if (match) {
      return format(match)
    }
  }
  return ""
}

function booleanLabel(regexes: RegExp[], source: string) {
  for (const regex of regexes) {
    const match = source.match(regex)
    if (!match) {
      continue
    }

    const value = (match[1] || "").toLowerCase()
    if (["false", "no", "none", "disabled"].includes(value)) {
      return "Not included"
    }

    return "Included"
  }

  return ""
}

function trueFeatures(source: string) {
  const ignored = new Set(["ram", "memory", "cpu", "vcore", "vcpu", "storage", "disk", "ddos", "port", "ports"])
  const features = new Set<string>()
  const regex = /([a-z][a-z0-9 _-]{2,40})\s*[:=-]?\s*(true|yes|included|enabled)\b/gi
  let match: RegExpExecArray | null

  while ((match = regex.exec(source)) !== null) {
    const key = match[1].trim().toLowerCase()
    if (!ignored.has(key)) {
      features.add(titleCase(key))
    }
  }

  return Array.from(features)
}

export function parsePlanSpecs(input: {
  name: string
  productName?: string | null
  planName?: string | null
  description?: string | null
  stock?: number | null
}): ParsedPlanSpecs {
  const description = cleanText(input.description || "")
  const source = cleanText(`${input.name} ${input.productName || ""} ${input.planName || ""} ${description}`)

  const ram = pick(
    [
      /\b(?:ram|memory)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(gb|gib|mb|mib)\b/i,
      /\b(\d+(?:\.\d+)?)\s*(gb|gib|mb|mib)\s*(?:ram|memory)\b/i,
    ],
    source,
    (match) => `${match[1]} ${normalizeUnit(match[2])}`
  )

  const cpu = pick(
    [
      /\b(?:cpu|vcores?|vcpu|cores?)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(?:x\s*)?(vcores?|vcpu|cores?)?\b/i,
      /\b(\d+(?:\.\d+)?)\s*(vcores?|vcpu|cores?)\b/i,
    ],
    source,
    (match) => {
      const unit = match[2] ? titleCase(match[2]) : "vCore"
      return `${match[1]} ${unit}`
    }
  )

  const storage = pick(
    [
      /\b(?:storage|disk|nvme|ssd)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(gb|gib|tb|tib)\s*(nvme|ssd)?\b/i,
      /\b(\d+(?:\.\d+)?)\s*(gb|gib|tb|tib)\s*(nvme|ssd|storage|disk)\b/i,
      /\b(nvme|ssd)\s*(?:storage|disk)?\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(gb|gib|tb|tib)\b/i,
    ],
    source,
    (match) => {
      if (/^(nvme|ssd)$/i.test(match[1])) {
        return `${match[2]} ${normalizeUnit(match[3])} ${match[1].toUpperCase()}`
      }
      const diskType = match[3] ? ` ${match[3].toUpperCase()}` : ""
      return `${match[1]} ${normalizeUnit(match[2])}${diskType}`
    }
  )

  const bandwidth = pick(
    [
      /\b(?:bandwidth|transfer)\s*[:=-]?\s*(\d+(?:\.\d+)?)\s*(gb|gib|tb|tib)\b/i,
      /\b(\d+(?:\.\d+)?)\s*(gb|gib|tb|tib)\s*(?:bandwidth|transfer)\b/i,
    ],
    source,
    (match) => `${match[1]} ${normalizeUnit(match[2])}`
  )

  const ddos = booleanLabel([/\bddos(?:\s+protection)?\s*[:=-]?\s*(true|false|yes|no|included|enabled|disabled)?\b/i], source)
  const port =
    pick([/\bports?\s*[:=-]?\s*(\d+)\b/i], source, (match) => `${match[1]} Port${match[1] === "1" ? "" : "s"}`) ||
    booleanLabel([/\bports?\s*[:=-]?\s*(true|false|yes|no|included|enabled|disabled)\b/i], source)

  const features = trueFeatures(source)

  return {
    displayName: input.name || input.productName || "Hosting Plan",
    description,
    ram: ram || emptySpec,
    cpu: cpu || emptySpec,
    storage: storage || emptySpec,
    bandwidth: bandwidth || (input.stock === 0 ? "Out of stock" : "Available"),
    ddos: ddos || "Included",
    port: port || "",
    features,
  }
}

export function parsePaymenterPlanSpecs(plan: PaymenterPlanCard) {
  return parsePlanSpecs({
    name: plan.name,
    productName: plan.productName,
    planName: plan.planName,
    description: plan.description,
    stock: plan.stock,
  })
}
