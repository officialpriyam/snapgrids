const PROXY_BASE = '/api/backend';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${PROXY_BASE}/${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `Request failed (${res.status})`);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

export const adminApi = {
    // Login now requires both email and password for admin users
    login: (email: string, password: string) =>
        request<{ success: boolean }>('admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    getUsers: () => request<{ users: User[] }>('admin/users'),

    getUserDetails: (id: string) =>
        request<UserAdminDetailsResponse>(`admin/users/${id}/details`),

    adjustUserCredits: (id: string, delta: number, description: string) =>
        request<{ success: boolean; balance: number | null }>(`admin/users/${id}/credits`, {
            method: 'POST',
            body: JSON.stringify({ delta, description }),
        }),

    setUserBan: (id: string, banned: boolean, reason?: string) =>
        request<{ success: boolean }>(`admin/users/${id}/ban`, {
            method: 'POST',
            body: JSON.stringify({ banned, reason }),
        }),

    deleteUser: (id: string) =>
        request<{ success: boolean }>(`admin/users/${id}`, { method: 'DELETE' }),

    getSettings: () =>
        request<{ oauth: OAuthConfig | null; pricing: PricingPlan[]; payment_gateway: PaymentGatewayConfig; api_keys: ApiKeysConfig }>('admin/settings'),

    saveSettings: (settings: Record<string, unknown>) =>
        request<{ success: boolean }>('admin/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        }),

    getSubmissions: () => request<DocSubmission[]>('docs/submissions'),

    getApprovedDocs: () => request<ApprovedPluginDoc[]>('docs/plugins'),

    syncDocs: () => request<{ message?: string }>('docs/sync', { method: 'POST' }),

    rejectSubmission: (id: number) =>
        request<{ success: boolean }>(`docs/reject/${id}`, { method: 'POST' }),

    approveSubmission: (id: number | string, payload: DocFormPayload) =>
        request<{ success: boolean }>(`docs/approve/${id}`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
};

export interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
    credits?: number;
    role?: string;
    is_banned?: boolean;
    ban_reason?: string | null;
}

export interface UserAdminDetailsResponse {
    user: User & { display_name?: string; discord_id?: string; profile_id?: number; created_at: string };
    transactions: Array<{ id: number; amount: number; type: string; description: string; created_at: string }>;
    projects: Array<{ id: string; name: string; created_at?: string; last_updated?: string }>;
    summary: {
        projectsCount: number;
        totalAddedCredits: number;
        totalUsedCredits: number;
    };
}

export interface OAuthConfig {
    discord: { clientId: string; clientSecret: string; enabled: boolean };
    google: { clientId: string; clientSecret: string; enabled: boolean };
    github: { clientId: string; clientSecret: string; enabled: boolean };
}

export interface ApiKeysConfig {
    openrouter_api_key: string;
    nvidia_api_key: string;
}

export interface PricingPlan {
    name: string;
    price: string;
    priceNum: number;
    credits: number;
    description: string;
    features: string[];
    popular?: boolean;
    buttonText: string;
}

export interface PaymentGatewayConfig {
    enabled: boolean;
    provider: string;
    discordInviteUrl?: string;
}

export interface PricingPlan {
    name: string;
    price: string;
    priceNum: number;
    credits: number;
    description: string;
    features: string[];
    popular?: boolean;
    buttonText: string;
}

export interface PaymentGatewayConfig {
    enabled: boolean;
    provider: string;
    discordInviteUrl?: string;
    discord_invite_url?: string;
}

export interface DocSubmission {
    id: number;
    name: string;
    docs_url: string;
    status: string;
    submitted_by: string;
    created_at: string;
}

export interface ApprovedPluginDoc {
    id: number;
    name: string;
    plugin_id: string;
    description: string;
    docs_url: string;
    created_at: string;
    approved_at: string;
}

export interface DocFormPayload {
    name: string;
    docsUrl: string;
    pluginId: string;
    description: string;
    mavenIntegration: string;
    documentation: string;
}
