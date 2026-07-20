"use client";

import React, { useState, useEffect } from "react";
import {
    Shield,
    Lock,
    Mail,
    Users,
    Trash2,
    Key,
    LogOut,
    Check,
    X,
    Loader2,
    AlertCircle,
    ExternalLink,
    BookOpen,
    RefreshCw,
    Plus,
    Settings,
} from "lucide-react";
import {
    type User,
    type UserAdminDetailsResponse,
    type ApiKeysConfig,
    type PricingPlan,
    type PaymentGatewayConfig,
    type DocSubmission,
    type ApprovedPluginDoc,
    adminApi,
} from "@/lib/api";

const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://localhost:3000";

export default function AdminPage() {
    const [authenticated, setAuthenticated] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    // Removed OAuth tab; only users, docs, and keys remain
    // Added pricing tab
    const [activeTab, setActiveTab] = useState<"users" | "docs" | "keys" | "pricing">("users");

    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userDetails, setUserDetails] = useState<UserAdminDetailsResponse | null>(null);
    const [loadingUserDetails, setLoadingUserDetails] = useState(false);
    const [creditDelta, setCreditDelta] = useState("0");
    const [creditReason, setCreditReason] = useState("");
    const [banReason, setBanReason] = useState("");
    const [savingUserAction, setSavingUserAction] = useState(false);

    // OAuth settings have been removed from the admin UI

    const [apiKeys, setApiKeys] = useState<ApiKeysConfig>({
        openrouter_api_key: "",
        nvidia_api_key: "",
    });
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [paymentGateway, setPaymentGateway] = useState<PaymentGatewayConfig>({
        enabled: false,
        provider: "",
        discordInviteUrl: "https://discord.gg/FD6QrzeATb",
    });
    const [savingKeys, setSavingKeys] = useState(false);
    const [keysSaved, setKeysSaved] = useState(false);

    const [submissions, setSubmissions] = useState<DocSubmission[]>([]);
    const [approvedDocs, setApprovedDocs] = useState<ApprovedPluginDoc[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [syncingDocs, setSyncingDocs] = useState(false);

    const [selectedSubmission, setSelectedSubmission] = useState<DocSubmission | null>(null);
    const [showDocForm, setShowDocForm] = useState(false);
    const [docForm, setDocForm] = useState({
        name: "",
        docsUrl: "",
        pluginId: "",
        description: "",
        mavenIntegration: "",
        documentation: "",
    });
    const [submittingDoc, setSubmittingDoc] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await adminApi.login(email, password);
            if (result.success) {
                setAuthenticated(true);
                setError("");
                sessionStorage.setItem("adminAuth", "true");
            } else {
                setError("You do not have admin access.");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Invalid credentials";
            setError(message.includes("Insufficient permissions") ? "You do not have admin access." : "Invalid credentials");
        }
    };

    useEffect(() => {
        const storedAuth = sessionStorage.getItem("adminAuth");
        if (storedAuth === "true") {
            setAuthenticated(true);
        }
    }, []);

    // Load data when authentication state changes
    useEffect(() => {
        if (authenticated) {
            fetchSettings();
            fetchUsers();
            fetchSubmissions();
            fetchApprovedDocs();
        }
    }, [authenticated]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await adminApi.getUsers();
            setUsers(data.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const data = await adminApi.getSettings();
            if (data.api_keys) setApiKeys(data.api_keys);
            if (data.pricing) setPricingPlans(data.pricing);
            if (data.payment_gateway) setPaymentGateway({
                enabled: Boolean(data.payment_gateway.enabled),
                provider: data.payment_gateway.provider || "",
                discordInviteUrl: data.payment_gateway.discordInviteUrl || data.payment_gateway.discord_invite_url || "https://discord.gg/FD6QrzeATb",
            });
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    };

    const fetchSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
            const data = await adminApi.getSubmissions();
            setSubmissions(data || []);
        } catch (err) {
            console.error("Failed to fetch submissions:", err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const fetchApprovedDocs = async () => {
        setLoadingDocs(true);
        try {
            const data = await adminApi.getApprovedDocs();
            setApprovedDocs(data || []);
        } catch (err) {
            console.error("Failed to fetch approved docs:", err);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        setDeletingId(id);
        try {
            await adminApi.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Failed to delete user:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const openUserDetails = async (user: User) => {
        setSelectedUser(user);
        setLoadingUserDetails(true);
        try {
            const data = await adminApi.getUserDetails(user.id);
            setUserDetails(data);
            setBanReason(data.user?.ban_reason || "");
        } catch (err) {
            console.error("Failed to load user details:", err);
        } finally {
            setLoadingUserDetails(false);
        }
    };

    const handleAdjustCredits = async () => {
        if (!selectedUser) return;
        setSavingUserAction(true);
        try {
            const delta = Number(creditDelta);
            await adminApi.adjustUserCredits(selectedUser.id, delta, creditReason || "Admin adjustment");
            await openUserDetails(selectedUser);
            setCreditDelta("0");
            setCreditReason("");
            await fetchUsers();
        } catch (err) {
            console.error("Failed to adjust credits:", err);
        } finally {
            setSavingUserAction(false);
        }
    };

    const handleBanUser = async (banned: boolean) => {
        if (!selectedUser) return;
        setSavingUserAction(true);
        try {
            await adminApi.setUserBan(selectedUser.id, banned, banReason || undefined);
            await openUserDetails(selectedUser);
            await fetchUsers();
        } catch (err) {
            console.error("Failed to update ban state:", err);
        } finally {
            setSavingUserAction(false);
        }
    };


    const handleSaveKeys = async () => {
        setSavingKeys(true);
        try {
            await adminApi.saveSettings({ api_keys: apiKeys, pricing: pricingPlans, payment_gateway: paymentGateway });
            setKeysSaved(true);
            setTimeout(() => setKeysSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save keys:", err);
        } finally {
            setSavingKeys(false);
        }
    };

    const handleSyncDocs = async () => {
        setSyncingDocs(true);
        try {
            const data = await adminApi.syncDocs();
            alert(data.message || "GitHub sync completed!");
            fetchApprovedDocs();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            alert("Failed to sync docs: " + message);
        } finally {
            setSyncingDocs(false);
        }
    };

    const handleRejectSubmission = async (id: number) => {
        if (!confirm("Are you sure you want to reject this request?")) return;
        try {
            await adminApi.rejectSubmission(id);
            setSubmissions((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error("Failed to reject submission:", err);
        }
    };

    const handleOpenDocForm = (sub: DocSubmission | null) => {
        setSelectedSubmission(sub);
        if (sub) {
            setDocForm({
                name: sub.name,
                docsUrl: sub.docs_url,
                pluginId: sub.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
                description: "",
                mavenIntegration: "",
                documentation: "",
            });
        } else {
            setDocForm({
                name: "",
                docsUrl: "",
                pluginId: "",
                description: "",
                mavenIntegration: "",
                documentation: "",
            });
        }
        setShowDocForm(true);
    };

    const handleSaveDocForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingDoc(true);
        const subId = selectedSubmission ? selectedSubmission.id : "manual";

        try {
            await adminApi.approveSubmission(subId, docForm);
            setShowDocForm(false);
            setSelectedSubmission(null);
            fetchApprovedDocs();
            if (subId !== "manual") fetchSubmissions();
        } catch (err) {
            console.error("Failed to save plugin doc:", err);
        } finally {
            setSubmittingDoc(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("adminAuth");
        setAuthenticated(false);
        setEmail("");
        setPassword("");
    };

    if (!authenticated) {
        return (
            <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[150px]" />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[150px]" />

                <div className="w-full max-w-md neu-card rounded-3xl p-8 relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 neu-button-primary rounded-2xl flex items-center justify-center">
                            {/* Use primary color for icon to ensure visibility */}
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground">Admin Panel</h1>
                            <p className="text-xs text-muted uppercase tracking-widest font-semibold font-mono">Restricted Access</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 bg-[hsl(var(--danger)/0.1)] border border-red-500/20 text-danger text-xs p-3 rounded-xl">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Email input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted ml-1 tracking-wider">Admin Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-muted" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full neu-input rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none text-foreground placeholder:text-faint border border-white/10"
                                    placeholder="Enter admin email"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-muted ml-1 tracking-wider">Admin Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-muted" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full neu-input rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none text-foreground placeholder:text-faint border border-white/10"
                                    placeholder="Enter admin password"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Updated button styling: smaller, rounded corners, visible text */}
                        <button
                            type="submit"
                            className="w-full neu-button-primary px-3 py-2 rounded-md text-sm font-semibold text-[hsl(var(--bg))] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Key className="w-4 h-4" />
                            Access Admin Panel
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href={mainAppUrl} className="text-xs text-muted hover:text-foreground transition-colors">
                            ← Back to Application
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground font-sans">
            <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed -bottom-40 -right-40 w-[500px] h-[500px] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[150px] pointer-events-none" />

            <header className="glass-card border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 neu-button-primary rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground">Admin Dashboard</h1>
                            <p className="text-[10px] text-muted uppercase tracking-wider font-mono">Velix System Control</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href={mainAppUrl} className="px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:text-foreground transition-colors">
                            Back to App
                        </a>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-danger hover:text-danger hover:border-red-500/30 transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-wrap gap-2 mb-8">
                    <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={Users}>Users</TabButton>
                    <TabButton active={activeTab === "docs"} onClick={() => setActiveTab("docs")} icon={BookOpen}>Plugin Docs</TabButton>
                    <TabButton active={activeTab === "keys"} onClick={() => setActiveTab("keys")} icon={Key}>API Keys</TabButton>
                    <TabButton active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")} icon={RefreshCw}>Pricing</TabButton>
                </div>

                {activeTab === "users" && (
                    <div className="neu-card rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-foreground">Registered Users</h2>
                            <span className="glass-capsule px-3 py-1.5 text-xs text-muted font-mono">{users.length} total</span>
                        </div>

                        {loadingUsers ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-muted">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>No users registered yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-muted text-xs font-bold uppercase tracking-wider">
                                            <th className="py-3 px-4">Name</th>
                                            <th className="py-3 px-4">Email</th>
                                            <th className="py-3 px-4">Credits</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id} className="border-b border-white/5 hover:bg-[hsl(var(--surface))] text-sm">
                                                <td className="py-4 px-4 text-foreground font-medium">{u.name}</td>
                                                <td className="py-4 px-4 text-muted">{u.email}</td>
                                                <td className="py-4 px-4 text-muted">{u.credits ?? 0}</td>
                                                <td className="py-4 px-4 text-muted">{u.is_banned ? "Banned" : "Active"}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openUserDetails(u)} className="px-2.5 py-1.5 rounded-md border border-white/10 text-xs font-semibold text-foreground">View</button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            disabled={deletingId === u.id}
                                                            className="p-1.5 neu-button-danger rounded-md transition-all disabled:opacity-50"
                                                        >
                                                            {deletingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {selectedUser && (
                    <div className="mt-6 neu-card rounded-3xl p-6">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{selectedUser.name}</h3>
                                <p className="text-sm text-muted">{selectedUser.email}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-sm text-muted hover:text-foreground">Close</button>
                        </div>

                        {loadingUserDetails ? (
                            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : userDetails ? (
                            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                                <div className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="rounded-2xl border border-white/10 p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-muted">Credits</p>
                                            <p className="mt-1 text-lg font-bold text-foreground">{userDetails.user.credits ?? 0}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-muted">Projects</p>
                                            <p className="mt-1 text-lg font-bold text-foreground">{userDetails.summary.projectsCount}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-muted">Role</p>
                                            <p className="mt-1 text-lg font-bold text-foreground">{userDetails.user.role || "member"}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 p-4">
                                        <h4 className="text-sm font-semibold text-foreground">Transactions</h4>
                                        <div className="mt-3 space-y-2">
                                            {userDetails.transactions.length === 0 ? (
                                                <p className="text-sm text-muted">No transactions yet.</p>
                                            ) : userDetails.transactions.slice(0, 8).map((tx) => (
                                                <div key={tx.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                                                    <div>
                                                        <p className="font-medium text-foreground">{tx.description}</p>
                                                        <p className="text-xs text-muted">{tx.type}</p>
                                                    </div>
                                                    <span className={`font-semibold ${tx.amount >= 0 ? "text-success" : "text-danger"}`}>{tx.amount >= 0 ? "+" : ""}{tx.amount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 p-4">
                                        <h4 className="text-sm font-semibold text-foreground">Projects</h4>
                                        <div className="mt-3 space-y-2">
                                            {userDetails.projects.length === 0 ? (
                                                <p className="text-sm text-muted">No projects yet.</p>
                                            ) : userDetails.projects.slice(0, 8).map((project) => (
                                                <div key={project.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                                                    <span className="text-foreground">{project.name}</span>
                                                    <span className="text-xs text-muted">{project.last_updated ? new Date(project.last_updated).toLocaleDateString() : ""}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-white/10 p-4">
                                        <h4 className="text-sm font-semibold text-foreground">Adjust Credits</h4>
                                        <div className="mt-3 space-y-3">
                                            <input type="number" value={creditDelta} onChange={(e) => setCreditDelta(e.target.value)} className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                            <input value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="Reason" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                            <button onClick={handleAdjustCredits} disabled={savingUserAction} className="w-full neu-button-primary rounded-md px-3 py-2 text-sm font-semibold text-[hsl(var(--bg))]">{savingUserAction ? "Working..." : "Apply Adjustment"}</button>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 p-4">
                                        <h4 className="text-sm font-semibold text-foreground">Ban / Unban</h4>
                                        <div className="mt-3 space-y-3">
                                            <input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Ban reason" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleBanUser(true)} disabled={savingUserAction} className="flex-1 neu-button-danger rounded-md px-3 py-2 text-sm font-semibold">Ban</button>
                                                <button onClick={() => handleBanUser(false)} disabled={savingUserAction} className="flex-1 neu-button-success rounded-md px-3 py-2 text-sm font-semibold">Unban</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {activeTab === "pricing" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="neu-card rounded-3xl p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">Payment Gateway</h2>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-sm text-foreground">
                                    <input type="checkbox" checked={paymentGateway.enabled} onChange={(e) => setPaymentGateway((prev) => ({ ...prev, enabled: e.target.checked }))} className="h-4 w-4 rounded border-white/10 bg-transparent" />
                                    Enable live payment gateway
                                </label>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1 tracking-wider">Gateway Provider</label>
                                    <input type="text" value={paymentGateway.provider} onChange={(e) => setPaymentGateway((prev) => ({ ...prev, provider: e.target.value }))} placeholder="stripe, lemon, etc." className="w-full neu-input rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground placeholder:text-faint border border-white/10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1 tracking-wider">Discord Invite URL</label>
                                    <input type="url" value={paymentGateway.discordInviteUrl || ""} onChange={(e) => setPaymentGateway((prev) => ({ ...prev, discordInviteUrl: e.target.value }))} placeholder="https://discord.gg/..." className="w-full neu-input rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground placeholder:text-faint border border-white/10" />
                                </div>
                            </div>
                        </div>

                        <div className="neu-card rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-foreground">Pricing Plans</h2>
                                <button onClick={() => setPricingPlans((prev) => [...prev, { name: "New Plan", price: "$0", priceNum: 0, credits: 0, description: "", features: [], buttonText: "Buy Now" }])} className="px-3 py-1.5 rounded-md text-xs font-semibold text-foreground">Add Plan</button>
                            </div>
                            <div className="space-y-4">
                                {pricingPlans.map((plan, index) => (
                                    <div key={`${plan.name}-${index}`} className="rounded-2xl border border-white/10 p-4 bg-[hsl(var(--surface))]">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <input value={plan.name} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} placeholder="Plan name" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                                <input value={plan.price} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, price: e.target.value } : item))} placeholder="Price" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                                <input type="number" value={plan.priceNum} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, priceNum: Number(e.target.value) } : item))} placeholder="Price number" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                                <input type="number" value={plan.credits} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, credits: Number(e.target.value) } : item))} placeholder="Credits" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                            </div>
                                            <div className="space-y-3">
                                                <textarea value={plan.description} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} placeholder="Description" rows={3} className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                                <textarea value={plan.features.join('\n')} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, features: e.target.value.split('\n').filter(Boolean) } : item))} placeholder="One feature per line" rows={4} className="w-full neu-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs" />
                                                <label className="flex items-center gap-2 text-sm text-foreground">
                                                    <input type="checkbox" checked={Boolean(plan.popular)} onChange={(e) => setPricingPlans((prev) => prev.map((item, i) => i === index ? { ...item, popular: e.target.checked } : item))} className="h-4 w-4 rounded border-white/10 bg-transparent" />
                                                    Highlight as popular
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                            <button onClick={() => setPricingPlans((prev) => prev.filter((_, i) => i !== index))} className="text-danger text-xs font-semibold">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={handleSaveKeys} disabled={savingKeys} className="neu-button-primary disabled:opacity-50 px-4 py-2 rounded-md transition-all flex items-center gap-2 text-[hsl(var(--bg))]">
                                    {savingKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : keysSaved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                                    {keysSaved ? "Saved!" : "Save Pricing"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "keys" && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="neu-card rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                <Key className="w-5 h-5 text-primary" />
                                AI Model API Provider Keys
                            </h3>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1 tracking-wider">OpenRouter API Key</label>
                                    <input type="password" value={apiKeys.openrouter_api_key} onChange={(e) => setApiKeys((prev) => ({ ...prev, openrouter_api_key: e.target.value }))} placeholder="sk-or-v1-..." className="w-full neu-input rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground placeholder:text-faint border border-white/10" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted ml-1 tracking-wider">NVIDIA NIM API Key</label>
                                    <input type="password" value={apiKeys.nvidia_api_key} onChange={(e) => setApiKeys((prev) => ({ ...prev, nvidia_api_key: e.target.value }))} placeholder="nvapi-..." className="w-full neu-input rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground placeholder:text-faint border border-white/10" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSaveKeys} disabled={savingKeys} className="neu-button-primary disabled:opacity-50 text-foreground font-bold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2">
                                {savingKeys ? <Loader2 className="w-4 h-4 animate-spin" /> : keysSaved ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                                {keysSaved ? "Saved!" : "Save API Keys"}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "docs" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center gap-4 glass-card rounded-2xl border border-white/5 p-4">
                            <div>
                                <h3 className="font-bold text-foreground">Sync & Curate Documentation</h3>
                                <p className="text-xs text-muted mt-1">Keep the model documentation context updated from Codella Documentations repo.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleOpenDocForm(null)} className="glass-capsule py-2 px-4 text-xs font-bold text-foreground hover:bg-white/5 transition-all flex items-center gap-1.5">
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Plugin Doc
                                </button>
                                <button onClick={handleSyncDocs} disabled={syncingDocs} className="neu-button-primary disabled:opacity-50 px-3 py-2 rounded-md text-xs transition-all flex items-center gap-2 text-[hsl(var(--bg))]">
                                    {syncingDocs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                    Sync from GitHub
                                </button>
                            </div>
                        </div>

                        {showDocForm && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                                <form onSubmit={handleSaveDocForm} className="relative w-full max-w-2xl neu-card rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-white/10">
                                    <button type="button" onClick={() => setShowDocForm(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-muted">
                                        <X className="w-5 h-5" />
                                    </button>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        {selectedSubmission ? "Review & Format Request" : "Create Custom Plugin Documentation"}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={docForm.name} onChange={(e) => setDocForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Plugin Name" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" required />
                                        <input type="text" value={docForm.pluginId} onChange={(e) => setDocForm((prev) => ({ ...prev, pluginId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") }))} placeholder="Plugin ID" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" required />
                                    </div>
                                    <input type="url" value={docForm.docsUrl} onChange={(e) => setDocForm((prev) => ({ ...prev, docsUrl: e.target.value }))} placeholder="Docs URL" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" required />
                                    <textarea value={docForm.description} onChange={(e) => setDocForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} placeholder="Description" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm" />
                                    <textarea value={docForm.mavenIntegration} onChange={(e) => setDocForm((prev) => ({ ...prev, mavenIntegration: e.target.value }))} rows={4} placeholder="Maven/Gradle integration" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs" />
                                    <textarea value={docForm.documentation} onChange={(e) => setDocForm((prev) => ({ ...prev, documentation: e.target.value }))} rows={6} placeholder="API documentation" className="w-full neu-input rounded-xl px-4 py-2.5 text-sm font-mono text-xs" required />
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button type="button" onClick={() => setShowDocForm(false)} className="glass-capsule py-2.5 px-5 text-xs text-muted">Cancel</button>
                                        <button type="submit" disabled={submittingDoc} className="neu-button-primary px-3 py-2 rounded-md text-xs flex items-center gap-2 text-[hsl(var(--bg))]">
                                            {submittingDoc && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                            Save Documentation
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="neu-card rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-foreground mb-4">Doc Submission Requests</h3>
                            {loadingSubmissions ? (
                                <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" /></div>
                            ) : submissions.length === 0 ? (
                                <p className="text-muted text-sm py-4">No pending doc requests.</p>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map((sub) => (
                                        <div key={sub.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 glass-card rounded-2xl border border-white/5 gap-4">
                                            <div>
                                                <h4 className="font-bold text-foreground">{sub.name}</h4>
                                                <a href={sub.docs_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-mono">{sub.docs_url} <ExternalLink className="w-3 h-3" /></a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleRejectSubmission(sub.id)} className="px-2.5 py-1.5 neu-button-danger rounded-md text-xs font-semibold">Reject</button>
                                                <button onClick={() => handleOpenDocForm(sub)} className="px-3 py-1.5 neu-button-primary rounded-md text-xs font-semibold text-[hsl(var(--bg))]">Approve & Add Details</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="neu-card rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-foreground">Approved Plugin References</h3>
                                <span className="glass-capsule px-3 py-1.5 text-xs text-muted font-mono">{approvedDocs.length} loaded</span>
                            </div>
                            {loadingDocs ? (
                                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>
                            ) : approvedDocs.length === 0 ? (
                                <div className="text-center py-12 text-muted"><BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No documentation approved yet.</p></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {approvedDocs.map((doc) => (
                                        <div key={doc.id} className="p-5 glass-card rounded-2xl border border-white/5">
                                            <h4 className="font-bold text-foreground">{doc.name}</h4>
                                            <p className="text-xs text-muted mt-2 line-clamp-3">{doc.description || "No description provided."}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <button onClick={onClick} className={`neu-pill px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${active ? "is-active text-primary" : "text-muted hover:text-foreground"}`}>
            <Icon className="w-4 h-4" />
            {children}
        </button>
    );
}
