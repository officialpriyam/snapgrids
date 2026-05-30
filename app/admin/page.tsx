"use client"

import type React from "react"
import { FormEvent, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  FileText,
  Gamepad2,
  KeyRound,
  LayoutGrid,
  Lock,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Server,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import type { AdminMappings, PaymenterCategoryOption, PaymenterPlanCard } from "../types/paymenter"
import type { CmsFooter, CmsFooterContact, CmsFooterLink, CmsGamePage, CmsServicePage, SiteContent } from "../types/site"
import type { LegalPageConfig, LegalSection } from "../types/legal"
import { slugifySiteId } from "../lib/site-content"

type AdminSettings = {
  adminEmail: string
  paymenter: {
    billingUrl: string
    hasApiKey: boolean
    encryptedApiKey: boolean
  }
  mappings: AdminMappings
  site: SiteContent
}

type LegalPageKey = "termsOfService" | "privacyPolicy"
type ActiveEditor =
  | { type: "game"; index: number }
  | { type: "service"; index: number }
  | { type: "legal"; kind: LegalPageKey }
  | { type: "footer" }
  | null

const emptyMappings: AdminMappings = {
  homepage: {},
  pages: {},
  games: {},
}

export default function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null)
  const activeEditorRef = useRef<HTMLDivElement | null>(null)
  const [email, setEmail] = useState("admin@snapgrids.store")
  const [password, setPassword] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [categories, setCategories] = useState<PaymenterCategoryOption[]>([])
  const [selectedPreviewCategory, setSelectedPreviewCategory] = useState("")
  const [previewPlans, setPreviewPlans] = useState<PaymenterPlanCard[]>([])
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const canFetchPaymenter = Boolean(settings?.paymenter.billingUrl && settings.paymenter.hasApiKey)

  useEffect(() => {
    async function loadSession() {
      setAuthLoading(true)
      const response = await fetch("/api/admin/session")
      const data = await response.json()
      if (!response.ok) {
        setAuthenticated(false)
        setSettings(null)
        showError(data.error || "Unable to load admin settings.")
        setAuthLoading(false)
        return
      }
      setAuthenticated(Boolean(data.authenticated))
      setSettings(data.settings)
      setAuthLoading(false)
    }

    loadSession()
  }, [])

  useEffect(() => {
    if (authenticated && canFetchPaymenter) {
      fetchCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, canFetchPaymenter])

  useEffect(() => {
    if (activeEditor) {
      activeEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [activeEditor])

  function showMessage(value: string) {
    setError("")
    setMessage(value)
  }

  function showError(value: string) {
    setMessage("")
    setError(value)
  }

  function updateSettings(updater: (current: AdminSettings) => AdminSettings) {
    setSettings((current) => (current ? updater(current) : current))
  }

  function updateSite(updater: (site: SiteContent) => SiteContent) {
    updateSettings((current) => ({
      ...current,
      site: updater(current.site),
    }))
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    setIsSaving(false)

    if (!response.ok) {
      showError(data.error || "Login failed.")
      return
    }

    setPassword("")
    const session = await fetch("/api/admin/session").then((res) => res.json())
    setAuthenticated(true)
    setSettings(session.settings)
    setActiveEditor(null)
    showMessage("Signed in.")
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    setAuthenticated(false)
    setSettings(null)
    setActiveEditor(null)
    setCategories([])
    setPreviewPlans([])
    showMessage("Signed out.")
  }

  async function fetchCategories() {
    setIsFetching(true)
    const response = await fetch("/api/admin/paymenter/categories")
    const data = await response.json()
    setIsFetching(false)

    if (!response.ok) {
      showError(data.error || "Unable to fetch categories.")
      return
    }

    setCategories(data.categories)
    showMessage("Paymenter categories refreshed.")
  }

  async function fetchPreviewPlans(categoryId = selectedPreviewCategory) {
    if (!categoryId) {
      setPreviewPlans([])
      return
    }

    setIsFetching(true)
    const params = new URLSearchParams({ categoryId })
    const response = await fetch(`/api/admin/paymenter/plans?${params.toString()}`)
    const data = await response.json()
    setIsFetching(false)

    if (!response.ok) {
      showError(data.error || "Unable to fetch products.")
      return
    }

    setPreviewPlans(data.plans)
    showMessage("Paymenter products loaded.")
  }

  function updatePaymenterField(field: "billingUrl", value: string) {
    updateSettings((current) => ({
      ...current,
      paymenter: { ...current.paymenter, [field]: value },
    }))
  }

  async function saveSettings(clearApiKey = false) {
    if (!settings) {
      return
    }

    setIsSaving(true)
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        billingUrl: settings.paymenter.billingUrl,
        apiKey,
        clearApiKey,
        mappings: settings.mappings ?? emptyMappings,
        site: settings.site,
      }),
    })
    const data = await response.json()
    setIsSaving(false)

    if (!response.ok) {
      showError(data.error || "Unable to save settings.")
      return
    }

    setApiKey("")
    setSettings(data)
    showMessage("Settings saved.")
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    const response = await fetch("/api/admin/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await response.json()
    setIsSaving(false)

    if (!response.ok) {
      showError(data.error || "Unable to change password.")
      return
    }

    setCurrentPassword("")
    setNewPassword("")
    showMessage("Password changed.")
  }

  function CategorySelect({
    value,
    onChange,
  }: {
    value: string
    onChange: (value: string) => void
  }) {
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-secondary bg-white px-3 py-2 text-sm text-gray-900 dark:bg-gray-950/70 dark:text-white"
      >
        <option value="">No Paymenter category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name} #{category.id}
          </option>
        ))}
      </select>
    )
  }

  function updateGame(index: number, patch: Partial<CmsGamePage>) {
    updateSite((site) => ({
      ...site,
      games: site.games.map((game, itemIndex) => {
        if (itemIndex !== index) {
          return game
        }

        const next = { ...game, ...patch }
        if (patch.name && !patch.slug) {
          next.slug = slugifySiteId(patch.name) || game.slug
        }
        if (patch.slug) {
          next.slug = slugifySiteId(patch.slug) || game.slug
        }
        return next
      }),
    }))
  }

  function addGame() {
    updateSite((site) => {
      const number = site.games.length + 1
      const slug = `new-game-${number}`
      return {
        ...site,
        games: [
          ...site.games,
          {
            id: slug,
            slug,
            name: `New Game ${number}`,
            description: "Describe this game hosting page.",
            icon: "/placeholder.svg",
            banner: "/placeholder.svg",
            primaryColor: "#3b82f6",
            startingAt: "$0.00/mo",
            featured: false,
            visible: true,
            categoryId: "",
          },
        ],
      }
    })
  }

  function addGameAndOpen() {
    const index = settings?.site.games.length ?? 0
    addGame()
    setActiveEditor({ type: "game", index })
  }

  function removeGame(index: number) {
    setActiveEditor((editor) => {
      if (editor?.type !== "game") {
        return editor
      }
      if (editor.index === index) {
        return null
      }
      return editor.index > index ? { ...editor, index: editor.index - 1 } : editor
    })
    updateSite((site) => ({
      ...site,
      games: site.games.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function updateService(index: number, patch: Partial<CmsServicePage>) {
    updateSite((site) => ({
      ...site,
      services: site.services.map((service, itemIndex) => {
        if (itemIndex !== index) {
          return service
        }

        const next = { ...service, ...patch }
        if (patch.name && !patch.slug) {
          next.slug = slugifySiteId(patch.name) || service.slug
        }
        if (patch.slug) {
          next.slug = slugifySiteId(patch.slug) || service.slug
        }
        if (next.route.startsWith("/hosting/") || patch.slug) {
          next.route = next.route.startsWith("/hosting/") ? `/hosting/${next.slug}` : next.route
        }
        return next
      }),
    }))
  }

  function addService() {
    updateSite((site) => {
      const number = site.services.length + 1
      const slug = `new-hosting-${number}`
      return {
        ...site,
        services: [
          ...site.services,
          {
            id: slug,
            slug,
            route: `/hosting/${slug}`,
            name: `New Hosting ${number}`,
            label: "Hosting",
            description: "Describe this hosting page.",
            icon: "/placeholder.svg",
            banner: "/placeholder.svg",
            primaryColor: "#3b82f6",
            startingAt: "$0.00/mo",
            visible: true,
            categoryId: "",
          },
        ],
      }
    })
  }

  function addServiceAndOpen() {
    const index = settings?.site.services.length ?? 0
    addService()
    setActiveEditor({ type: "service", index })
  }

  function removeService(index: number) {
    setActiveEditor((editor) => {
      if (editor?.type !== "service") {
        return editor
      }
      if (editor.index === index) {
        return null
      }
      return editor.index > index ? { ...editor, index: editor.index - 1 } : editor
    })
    updateSite((site) => ({
      ...site,
      services: site.services.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function updateLegalPage(kind: "termsOfService" | "privacyPolicy", patch: Partial<LegalPageConfig>) {
    updateSite((site) => ({
      ...site,
      legal: {
        ...site.legal,
        [kind]: {
          ...site.legal[kind],
          ...patch,
        },
      },
    }))
  }

  function updateFooter(patch: Partial<CmsFooter>) {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        ...patch,
      },
    }))
  }

  function updateLegalSection(
    kind: "termsOfService" | "privacyPolicy",
    index: number,
    patch: Partial<LegalSection>
  ) {
    updateSite((site) => ({
      ...site,
      legal: {
        ...site.legal,
        [kind]: {
          ...site.legal[kind],
          sections: site.legal[kind].sections.map((section, itemIndex) =>
            itemIndex === index ? { ...section, ...patch } : section
          ),
        },
      },
    }))
  }

  function addLegalSection(kind: "termsOfService" | "privacyPolicy") {
    updateSite((site) => ({
      ...site,
      legal: {
        ...site.legal,
        [kind]: {
          ...site.legal[kind],
          sections: [
            ...site.legal[kind].sections,
            {
              title: `${site.legal[kind].sections.length + 1}. New Section`,
              content: "Write section content.",
            },
          ],
        },
      },
    }))
  }

  function removeLegalSection(kind: "termsOfService" | "privacyPolicy", index: number) {
    updateSite((site) => ({
      ...site,
      legal: {
        ...site.legal,
        [kind]: {
          ...site.legal[kind],
          sections: site.legal[kind].sections.filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }))
  }

  function updateFooterLink(group: "quickLinks" | "legalLinks", index: number, patch: Partial<CmsFooterLink>) {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        [group]: site.footer[group].map((link, itemIndex) => (itemIndex === index ? { ...link, ...patch } : link)),
      },
    }))
  }

  function addFooterLink(group: "quickLinks" | "legalLinks") {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        [group]: [...site.footer[group], { label: "New Link", href: "/" }],
      },
    }))
  }

  function removeFooterLink(group: "quickLinks" | "legalLinks", index: number) {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        [group]: site.footer[group].filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  function updateFooterContact(index: number, patch: Partial<CmsFooterContact>) {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        contacts: site.footer.contacts.map((contact, itemIndex) => (itemIndex === index ? { ...contact, ...patch } : contact)),
      },
    }))
  }

  function addFooterContact() {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        contacts: [...site.footer.contacts, { icon: "mail", label: "Contact", value: "", href: "#" }],
      },
    }))
  }

  function removeFooterContact(index: number) {
    updateSite((site) => ({
      ...site,
      footer: {
        ...site.footer,
        contacts: site.footer.contacts.filter((_, itemIndex) => itemIndex !== index),
      },
    }))
  }

  function categoryLabel(categoryId: string) {
    if (!categoryId) {
      return "No Paymenter category"
    }

    const category = categories.find((item) => item.id === categoryId)
    return category ? `${category.name} #${category.id}` : `Category #${categoryId}`
  }

  function activeEditorTitle() {
    if (!activeEditor || !settings) {
      return "Page Editor"
    }

    if (activeEditor.type === "game") {
      return `Edit ${settings.site.games[activeEditor.index]?.name ?? "Game Page"}`
    }
    if (activeEditor.type === "service") {
      return `Edit ${settings.site.services[activeEditor.index]?.name ?? "Hosting Page"}`
    }
    if (activeEditor.type === "legal") {
      return activeEditor.kind === "termsOfService" ? "Edit Terms of Service" : "Edit Privacy Policy"
    }
    return "Edit Footer"
  }

  function renderActiveEditor() {
    if (!settings || !activeEditor) {
      return null
    }

    if (activeEditor.type === "game") {
      const game = settings.site.games[activeEditor.index]
      if (!game) {
        return <p className="text-sm text-gray-500">This game page no longer exists.</p>
      }

      return <GameEditor game={game} index={activeEditor.index} onChange={updateGame} CategorySelect={CategorySelect} />
    }

    if (activeEditor.type === "service") {
      const service = settings.site.services[activeEditor.index]
      if (!service) {
        return <p className="text-sm text-gray-500">This hosting page no longer exists.</p>
      }

      return (
        <ServiceEditor
          service={service}
          index={activeEditor.index}
          onChange={updateService}
          CategorySelect={CategorySelect}
        />
      )
    }

    if (activeEditor.type === "legal") {
      const title = activeEditor.kind === "termsOfService" ? "Terms of Service" : "Privacy Policy"
      return (
        <LegalEditor
          title={title}
          page={settings.site.legal[activeEditor.kind]}
          onPageChange={(patch) => updateLegalPage(activeEditor.kind, patch)}
          onSectionChange={(index, patch) => updateLegalSection(activeEditor.kind, index, patch)}
          onAddSection={() => addLegalSection(activeEditor.kind)}
          onRemoveSection={(index) => removeLegalSection(activeEditor.kind, index)}
        />
      )
    }

    return (
      <FooterEditor
        footer={settings.site.footer}
        onChange={updateFooter}
        onQuickLinkChange={(index, patch) => updateFooterLink("quickLinks", index, patch)}
        onAddQuickLink={() => addFooterLink("quickLinks")}
        onRemoveQuickLink={(index) => removeFooterLink("quickLinks", index)}
        onLegalLinkChange={(index, patch) => updateFooterLink("legalLinks", index, patch)}
        onAddLegalLink={() => addFooterLink("legalLinks")}
        onRemoveLegalLink={(index) => removeFooterLink("legalLinks", index)}
        onContactChange={updateFooterContact}
        onAddContact={addFooterContact}
        onRemoveContact={removeFooterContact}
      />
    )
  }

  const activeEditorIcon =
    activeEditor?.type === "game"
      ? Gamepad2
      : activeEditor?.type === "service"
        ? Server
        : activeEditor?.type === "legal"
          ? FileText
          : LayoutGrid

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] flex items-center justify-center px-4">
        <div className="h-12 w-12 rounded-full border-2 border-secondary border-t-blue-500 animate-spin" />
      </main>
    )
  }

  if (!authenticated || !settings) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] flex items-center justify-center px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md rounded-md border border-secondary bg-white dark:bg-gray-950/40 p-6 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-md bg-blue-600/10 p-2 text-blue-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="orbitron-font text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restricted SnapGrids control panel</p>
            </div>
          </div>

          {error && <Notice type="error" text={error} />}
          {message && <Notice type="success" text={message} />}

          <Field label="Email">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              className="admin-input"
            />
          </Field>

          <Field label="Password">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="admin-input"
            />
          </Field>

          <button
            disabled={isSaving}
            className="button-primary text-button-primary flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            Login
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0b0f] px-4 py-8 text-gray-900 dark:text-white sm:px-6 lg:px-8">
      <style jsx global>{`
        .admin-input,
        .admin-textarea {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid rgb(209 213 219);
          background: white;
          padding: 0.5rem 0.75rem;
          color: rgb(17 24 39);
        }
        .dark .admin-input,
        .dark .admin-textarea {
          background: rgb(3 7 18 / 0.7);
          border-color: rgb(55 65 81);
          color: white;
        }
        .admin-textarea {
          min-height: 88px;
          resize: vertical;
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-blue-500">
              <ShieldCheck className="h-4 w-4" />
              {settings.adminEmail}
            </div>
            <h1 className="orbitron-font text-3xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => saveSettings(false)}
              disabled={isSaving}
              className="button-primary text-button-primary flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Save All
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm hover:hover-gradient"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {error && <Notice type="error" text={error} />}
        {message && <Notice type="success" text={message} />}

        <section className="mb-6 grid gap-6 lg:grid-cols-3">
          <Panel title="Paymenter API" icon={Server} className="lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Billing URL">
                <input
                  value={settings.paymenter.billingUrl}
                  onChange={(event) => updatePaymenterField("billingUrl", event.target.value)}
                  placeholder="https://billing.example.com"
                  className="admin-input"
                />
              </Field>
              <Field label={`API Key ${settings.paymenter.hasApiKey ? "(stored)" : ""}`}>
                <input
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  type="password"
                  placeholder={settings.paymenter.hasApiKey ? "Leave blank to keep current key" : "Paymenter bearer token"}
                  className="admin-input"
                />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => saveSettings(false)}
                disabled={isSaving}
                className="button-primary text-button-primary flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </button>
              <button
                onClick={fetchCategories}
                disabled={!canFetchPaymenter || isFetching}
                className="flex items-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                Fetch Categories
              </button>
              {settings.paymenter.hasApiKey && (
                <button
                  onClick={() => saveSettings(true)}
                  disabled={isSaving}
                  className="rounded-md border border-red-500/30 px-4 py-2 text-sm text-red-600 dark:text-red-300 disabled:opacity-60"
                >
                  Clear API Key
                </button>
              )}
            </div>
          </Panel>

          <form onSubmit={changePassword}>
            <Panel title="Change Password" icon={KeyRound}>
              <Field label="Current password">
                <input
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  type="password"
                  className="admin-input"
                />
              </Field>
              <Field label="New password">
                <input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  className="admin-input"
                />
              </Field>
              <button
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                Update Password
              </button>
            </Panel>
          </form>
        </section>

        <Panel title="Paymenter Product Preview" icon={RefreshCw} className="mb-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <CategorySelect value={selectedPreviewCategory} onChange={setSelectedPreviewCategory} />
            <button
              onClick={() => fetchPreviewPlans()}
              disabled={!selectedPreviewCategory || isFetching}
              className="flex items-center justify-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Fetch Products
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-secondary">
            <div className="grid grid-cols-[1.4fr_.7fr_.7fr] bg-gray-100 px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
              <span>Product</span>
              <span>Price</span>
              <span>Period</span>
            </div>
            {previewPlans.length > 0 ? (
              previewPlans.slice(0, 8).map((plan) => (
                <a
                  key={plan.id}
                  href={plan.orderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid grid-cols-[1.4fr_.7fr_.7fr] border-t border-secondary px-3 py-3 text-sm hover:hover-gradient"
                >
                  <span className="truncate">{plan.name}</span>
                  <span>{plan.price}</span>
                  <span>{plan.period}</span>
                </a>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-gray-500">Select a category and fetch products.</div>
            )}
          </div>
        </Panel>

        <Panel title="Homepage Game Boxes" icon={LayoutGrid} className="mb-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Field label="Eyebrow">
              <input
                value={settings.site.homeGameSection.eyebrow}
                onChange={(event) =>
                  updateSite((site) => ({
                    ...site,
                    homeGameSection: { ...site.homeGameSection, eyebrow: event.target.value },
                  }))
                }
                className="admin-input"
              />
            </Field>
            <Field label="Title">
              <input
                value={settings.site.homeGameSection.title}
                onChange={(event) =>
                  updateSite((site) => ({
                    ...site,
                    homeGameSection: { ...site.homeGameSection, title: event.target.value },
                  }))
                }
                className="admin-input"
              />
            </Field>
            <Field label="Button text">
              <input
                value={settings.site.homeGameSection.buttonText}
                onChange={(event) =>
                  updateSite((site) => ({
                    ...site,
                    homeGameSection: { ...site.homeGameSection, buttonText: event.target.value },
                  }))
                }
                className="admin-input"
              />
            </Field>
            <Field label="Max boxes">
              <input
                type="number"
                min={1}
                value={settings.site.homeGameSection.maxItems}
                onChange={(event) =>
                  updateSite((site) => ({
                    ...site,
                    homeGameSection: { ...site.homeGameSection, maxItems: Number(event.target.value) },
                  }))
                }
                className="admin-input"
              />
            </Field>
            <Field label="Description">
              <input
                value={settings.site.homeGameSection.description}
                onChange={(event) =>
                  updateSite((site) => ({
                    ...site,
                    homeGameSection: { ...site.homeGameSection, description: event.target.value },
                  }))
                }
                className="admin-input"
              />
            </Field>
          </div>
        </Panel>

        {activeEditor && (
          <div ref={activeEditorRef}>
            <Panel title={activeEditorTitle()} icon={activeEditorIcon} className="mb-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveEditor(null)}
                  className="flex items-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to list
                </button>
                <button
                  type="button"
                  onClick={() => saveSettings(false)}
                  disabled={isSaving}
                  className="button-primary text-button-primary flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
              {renderActiveEditor()}
            </Panel>
          </div>
        )}

        <Panel title="Game Pages" icon={Gamepad2} className="mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage game pages from this list. Open one page to edit its hero, images, category, and copy.
            </p>
            <button
              type="button"
              onClick={addGameAndOpen}
              className="flex items-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Game
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {settings.site.games.map((game, index) => (
              <div key={`${game.slug}-${index}`} className="rounded-md border border-secondary p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{game.name}</h3>
                  <p className="truncate text-xs text-gray-500">/games/{game.slug}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md border border-secondary px-2 py-1">{game.visible ? "Visible" : "Hidden"}</span>
                  <span className="rounded-md border border-secondary px-2 py-1">
                    {game.featured ? "Homepage" : "Not on homepage"}
                  </span>
                  <span className="rounded-md border border-secondary px-2 py-1">{categoryLabel(game.categoryId)}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveEditor({ type: "game", index })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGame(index)}
                    className="flex items-center justify-center rounded-md border border-red-500/30 px-3 py-2 text-red-500"
                    aria-label={`Delete ${game.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Hosting Pages" icon={Server} className="mb-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Each hosting page keeps its own Paymenter category, route, hero image, and page color.
            </p>
            <button
              type="button"
              onClick={addServiceAndOpen}
              className="flex items-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Hosting Page
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {settings.site.services.map((service, index) => (
              <div key={`${service.slug}-${index}`} className="rounded-md border border-secondary p-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{service.name}</h3>
                  <p className="truncate text-xs text-gray-500">{service.route}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md border border-secondary px-2 py-1">{service.visible ? "Visible" : "Hidden"}</span>
                  <span className="rounded-md border border-secondary px-2 py-1">{service.label}</span>
                  <span className="rounded-md border border-secondary px-2 py-1">{categoryLabel(service.categoryId)}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveEditor({ type: "service", index })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="flex items-center justify-center rounded-md border border-red-500/30 px-3 py-2 text-red-500"
                    aria-label={`Delete ${service.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Legal Pages" icon={FileText} className="mb-6">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { kind: "termsOfService" as const, title: "Terms of Service", page: settings.site.legal.termsOfService },
              { kind: "privacyPolicy" as const, title: "Privacy Policy", page: settings.site.legal.privacyPolicy },
            ].map((item) => (
              <div key={item.kind} className="rounded-md border border-secondary p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-gray-500">Last updated: {item.page.lastUpdated}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.page.sections.length} sections</p>
                <button
                  type="button"
                  onClick={() => setActiveEditor({ type: "legal", kind: item.kind })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Footer Editor" icon={LayoutGrid} className="mb-6">
          <div className="rounded-md border border-secondary p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Footer Content</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {settings.site.footer.quickLinks.length} quick links, {settings.site.footer.legalLinks.length} legal links,{" "}
                  {settings.site.footer.contacts.length} contacts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEditor({ type: "footer" })}
                className="flex items-center justify-center gap-2 rounded-md border border-secondary px-4 py-2 text-sm"
              >
                <Pencil className="h-4 w-4" />
                Edit Footer
              </button>
            </div>
          </div>
        </Panel>

        <div className="sticky bottom-4 z-20 flex justify-end">
          <button
            onClick={() => saveSettings(false)}
            disabled={isSaving}
            className="button-primary text-button-primary flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold shadow-lg disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Save All Changes
          </button>
        </div>
      </div>
    </main>
  )
}

function Notice({ type, text }: { type: "error" | "success"; text: string }) {
  const className =
    type === "error"
      ? "mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300"
      : "mb-4 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-300"

  return <div className={className}>{text}</div>
}

function Panel({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-md border border-secondary bg-white p-5 dark:bg-gray-950/40 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-500" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm text-gray-600 dark:text-gray-300">{label}</span>
      {children}
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}

function GameEditor({
  game,
  index,
  onChange,
  CategorySelect,
}: {
  game: CmsGamePage
  index: number
  onChange: (index: number, patch: Partial<CmsGamePage>) => void
  CategorySelect: (props: { value: string; onChange: (value: string) => void }) => React.ReactElement
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Name">
        <input value={game.name} onChange={(event) => onChange(index, { name: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Slug">
        <input value={game.slug} onChange={(event) => onChange(index, { slug: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Starting price">
        <input value={game.startingAt} onChange={(event) => onChange(index, { startingAt: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Theme color">
        <input value={game.primaryColor} onChange={(event) => onChange(index, { primaryColor: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Logo/icon URL">
        <input value={game.icon} onChange={(event) => onChange(index, { icon: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Hero/background image URL">
        <input value={game.banner} onChange={(event) => onChange(index, { banner: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Paymenter category">
        <CategorySelect value={game.categoryId} onChange={(value) => onChange(index, { categoryId: value })} />
      </Field>
      <div className="flex items-center gap-4 pt-6">
        <ToggleField label="Visible" checked={game.visible} onChange={(value) => onChange(index, { visible: value })} />
        <ToggleField label="Homepage box" checked={game.featured} onChange={(value) => onChange(index, { featured: value })} />
      </div>
      <div className="md:col-span-2">
        <Field label="Description">
          <textarea value={game.description} onChange={(event) => onChange(index, { description: event.target.value })} className="admin-textarea" />
        </Field>
      </div>
    </div>
  )
}

function ServiceEditor({
  service,
  index,
  onChange,
  CategorySelect,
}: {
  service: CmsServicePage
  index: number
  onChange: (index: number, patch: Partial<CmsServicePage>) => void
  CategorySelect: (props: { value: string; onChange: (value: string) => void }) => React.ReactElement
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Name">
        <input value={service.name} onChange={(event) => onChange(index, { name: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Label">
        <input value={service.label} onChange={(event) => onChange(index, { label: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Slug">
        <input value={service.slug} onChange={(event) => onChange(index, { slug: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Route">
        <input value={service.route} onChange={(event) => onChange(index, { route: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Starting price">
        <input value={service.startingAt} onChange={(event) => onChange(index, { startingAt: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Theme color">
        <input value={service.primaryColor} onChange={(event) => onChange(index, { primaryColor: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Logo/icon URL">
        <input value={service.icon} onChange={(event) => onChange(index, { icon: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Hero/background image URL">
        <input value={service.banner} onChange={(event) => onChange(index, { banner: event.target.value })} className="admin-input" />
      </Field>
      <Field label="Paymenter category">
        <CategorySelect value={service.categoryId} onChange={(value) => onChange(index, { categoryId: value })} />
      </Field>
      <div className="pt-6">
        <ToggleField label="Visible" checked={service.visible} onChange={(value) => onChange(index, { visible: value })} />
      </div>
      <div className="md:col-span-2">
        <Field label="Description">
          <textarea value={service.description} onChange={(event) => onChange(index, { description: event.target.value })} className="admin-textarea" />
        </Field>
      </div>
    </div>
  )
}

function LegalEditor({
  title,
  page,
  onPageChange,
  onSectionChange,
  onAddSection,
  onRemoveSection,
}: {
  title: string
  page: LegalPageConfig
  onPageChange: (patch: Partial<LegalPageConfig>) => void
  onSectionChange: (index: number, patch: Partial<LegalSection>) => void
  onAddSection: () => void
  onRemoveSection: (index: number) => void
}) {
  return (
    <div className="rounded-md border border-secondary p-4">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Page title">
          <input value={page.title} onChange={(event) => onPageChange({ title: event.target.value })} className="admin-input" />
        </Field>
        <Field label="Last updated">
          <input value={page.lastUpdated} onChange={(event) => onPageChange({ lastUpdated: event.target.value })} className="admin-input" />
        </Field>
        <Field label="Company name">
          <input value={page.companyName} onChange={(event) => onPageChange({ companyName: event.target.value })} className="admin-input" />
        </Field>
        <Field label="Contact email">
          <input value={page.contactEmail} onChange={(event) => onPageChange({ contactEmail: event.target.value })} className="admin-input" />
        </Field>
      </div>
      <div className="mt-4 space-y-3">
        {page.sections.map((section, index) => (
          <div key={`${section.title}-${index}`} className="rounded-md border border-secondary p-3">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => onRemoveSection(index)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Field label="Section title">
              <input value={section.title} onChange={(event) => onSectionChange(index, { title: event.target.value })} className="admin-input" />
            </Field>
            <Field label="Section content">
              <textarea value={section.content} onChange={(event) => onSectionChange(index, { content: event.target.value })} className="admin-textarea" />
            </Field>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAddSection}
        className="mt-3 flex items-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        Add Section
      </button>
    </div>
  )
}

function FooterEditor({
  footer,
  onChange,
  onQuickLinkChange,
  onAddQuickLink,
  onRemoveQuickLink,
  onLegalLinkChange,
  onAddLegalLink,
  onRemoveLegalLink,
  onContactChange,
  onAddContact,
  onRemoveContact,
}: {
  footer: CmsFooter
  onChange: (patch: Partial<CmsFooter>) => void
  onQuickLinkChange: (index: number, patch: Partial<CmsFooterLink>) => void
  onAddQuickLink: () => void
  onRemoveQuickLink: (index: number) => void
  onLegalLinkChange: (index: number, patch: Partial<CmsFooterLink>) => void
  onAddLegalLink: () => void
  onRemoveLegalLink: (index: number) => void
  onContactChange: (index: number, patch: Partial<CmsFooterContact>) => void
  onAddContact: () => void
  onRemoveContact: (index: number) => void
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Logo URL">
          <input value={footer.logo} onChange={(event) => onChange({ logo: event.target.value })} className="admin-input" />
        </Field>
        <Field label="Copyright">
          <input
            value={footer.copyright}
            onChange={(event) => onChange({ copyright: event.target.value })}
            className="admin-input"
          />
        </Field>
        <Field label="Credit">
          <input value={footer.credit} onChange={(event) => onChange({ credit: event.target.value })} className="admin-input" />
        </Field>
        <Field label="Description">
          <textarea
            value={footer.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className="admin-textarea"
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <FooterLinksEditor
          title="Quick Links"
          links={footer.quickLinks}
          onChange={onQuickLinkChange}
          onAdd={onAddQuickLink}
          onRemove={onRemoveQuickLink}
        />
        <FooterLinksEditor
          title="Legal Links"
          links={footer.legalLinks}
          onChange={onLegalLinkChange}
          onAdd={onAddLegalLink}
          onRemove={onRemoveLegalLink}
        />
        <FooterContactsEditor
          contacts={footer.contacts}
          onChange={onContactChange}
          onAdd={onAddContact}
          onRemove={onRemoveContact}
        />
      </div>
    </>
  )
}

function FooterLinksEditor({
  title,
  links,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string
  links: CmsFooterLink[]
  onChange: (index: number, patch: Partial<CmsFooterLink>) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="rounded-md border border-secondary p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div key={`${link.label}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input value={link.label} onChange={(event) => onChange(index, { label: event.target.value })} className="admin-input" />
            <input value={link.href} onChange={(event) => onChange(index, { href: event.target.value })} className="admin-input" />
            <button type="button" onClick={() => onRemove(index)} className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        Add Link
      </button>
    </div>
  )
}

function FooterContactsEditor({
  contacts,
  onChange,
  onAdd,
  onRemove,
}: {
  contacts: CmsFooterContact[]
  onChange: (index: number, patch: Partial<CmsFooterContact>) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="rounded-md border border-secondary p-4">
      <h3 className="mb-3 font-semibold">Contacts</h3>
      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div key={`${contact.label}-${index}`} className="grid gap-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input value={contact.label} onChange={(event) => onChange(index, { label: event.target.value })} className="admin-input" />
              <input value={contact.value} onChange={(event) => onChange(index, { value: event.target.value })} className="admin-input" />
              <button type="button" onClick={() => onRemove(index)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={contact.href} onChange={(event) => onChange(index, { href: event.target.value })} className="admin-input" />
              <select value={contact.icon} onChange={(event) => onChange(index, { icon: event.target.value as CmsFooterContact["icon"] })} className="admin-input">
                <option value="mail">Mail</option>
                <option value="phone">Phone</option>
                <option value="gamepad">Gamepad</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 flex items-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        Add Contact
      </button>
    </div>
  )
}
