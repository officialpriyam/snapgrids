import config from '../utils/config';

export interface ChatProvider {
    name: 'llmgate' | 'orac' | 'priyx' | 'requesty';
    label: string;
    endpoint: string;
    apiKey: string;
    model: string;
    supportsFunctions: boolean;
    referer?: string;
    title?: string;
}

export const LLMGATE_MODELS = ['anthropic/claude-haiku-4-5-free'];

export const ORAC_MODELS = [
    'deepseek/deepseek-v4-flash-free',
    'deepseek/deepseek-v4-pro-free'
];

export const EDEN_MODELS = [
    'cloudflare/@cf/google/gemma-2b-it-lora',
    'cloudflare/@cf/google/gemma-7b-it-lora',
    'cloudflare/@cf/meta-llama/llama-2-7b-chat-hf-lora',
    'cloudflare/@cf/mistral/mistral-7b-instruct-v0.2-lora',
    'google/gemma-4-26b-a4b-it',
    'google/gemma-4-31b-it'
];

export const REQUESTY_MODELS = [
    'nvidia/nemotron-3-ultra-550b-a55b',
    'nvidia/nemotron-3-super-120b-a12b',
    'nvidia/nemotron-3.5-content-super-120b-a12b',
    'poolside/laguna-xs.2',
    'poolside/laguna-m.1',
    'google/gemma-4-31b-it'
];

function env(key: string, configKey: string): string {
    return process.env[key] || config[configKey] || '';
}

function pickRandom(list: string[]): string {
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Resolve a requested model id to one of the specialty providers
 * (LLMGATE, orac/OrcaRouter, Priyx/Eden AI). Returns null when the
 * request should be handled by the default OpenRouter/NVIDIA path.
 */
export function resolveChatProvider(model: string | undefined): ChatProvider | null {
    const m = String(model || '').toLowerCase();
    if (m === 'llmgate' || m === 'llmgateway' || m.startsWith('llmgate/') || m.startsWith('llmgateway/')) {
        return {
            name: 'llmgate',
            label: 'LLMGATE',
            endpoint: 'https://api.llmgateway.io/v1/chat/completions',
            apiKey: env('LLM_GATEWAY_API_KEY', 'llm_gateway_api_key'),
            model: LLMGATE_MODELS[0],
            supportsFunctions: false
        };
    }
    if (m === 'orac' || m === 'orcarouter' || m.startsWith('orac/') || m.startsWith('orcarouter/')) {
        return {
            name: 'orac',
            label: 'orac',
            endpoint: 'https://api.orcarouter.ai/v1/chat/completions',
            apiKey: env('ORCAROUTER_API_KEY', 'orcarouter_api_key'),
            model: pickRandom(ORAC_MODELS),
            supportsFunctions: false
        };
    }
    if (m === 'priyx' || m === 'priyx-eden' || m === 'edenai' || m.startsWith('priyx/')) {
        return {
            name: 'priyx',
            label: 'Priyx',
            endpoint: 'https://api.edenai.run/v3/chat/completions',
            apiKey: env('EDENAI_API_KEY', 'edenai_api_key'),
            model: pickRandom(EDEN_MODELS),
            supportsFunctions: false
        };
    }
    if (m === 'requesty' || m === 'requesty-ai' || m.startsWith('requesty/')) {
        return {
            name: 'requesty',
            label: 'Requesty',
            endpoint: 'https://router.requesty.ai/v1/chat/completions',
            apiKey: env('REQUESTY_API_KEY', 'requesty_api_key'),
            model: pickRandom(REQUESTY_MODELS),
            supportsFunctions: false
        };
    }
    return null;
}

export function isProviderModel(model: string | undefined): boolean {
    return resolveChatProvider(model) !== null;
}

export function providerHeaders(provider: ChatProvider): Record<string, string> {
    const headers: Record<string, string> = {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
    };
    if (provider.name !== 'priyx' && provider.name !== 'requesty') {
        headers['HTTP-Referer'] = provider.referer || 'https://velix.snapgrids.store';
        headers['X-Title'] = provider.title || 'Velix';
    }
    return headers;
}
