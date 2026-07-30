import axios from 'axios';
import { redis, isUpstashConfigured } from '../utils/upstash';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

interface CacheEntry {
    results: SearchResult[];
    timestamp: number;
}

const memoryCache: { [query: string]: CacheEntry } = {};
const CACHE_TTL_SECONDS = 600; // 10 minutes

export class WebSearchService {
    /**
     * Searches the web using DuckDuckGo HTML with fallbacks (DuckDuckGo Lite, Wikipedia API)
     */
    static async searchWeb(query: string): Promise<SearchResult[]> {
        const normalizedQuery = query.trim().toLowerCase();
        const cacheKey = `search:${normalizedQuery}`;

        // Attempt Upstash Redis cache first
        if (isUpstashConfigured) {
            try {
                const cached = await redis.get<SearchResult[]>(cacheKey);
                if (cached && Array.isArray(cached) && cached.length > 0) {
                    console.log(`[WebSearchService] Upstash Redis cache hit for: "${query}"`);
                    return cached;
                }
            } catch (err: any) {
                console.warn('[WebSearchService] Redis cache lookup failed:', err.message);
            }
        } else {
            const now = Date.now();
            if (memoryCache[normalizedQuery] && memoryCache[normalizedQuery].results.length > 0 && (now - memoryCache[normalizedQuery].timestamp < CACHE_TTL_SECONDS * 1000)) {
                console.log(`[WebSearchService] Memory cache hit for: "${query}"`);
                return memoryCache[normalizedQuery].results;
            }
        }

        console.log(`[WebSearchService] Querying web for: "${query}"`);
        let results: SearchResult[] = [];

        // Attempt 1: DuckDuckGo HTML with Safari UA
        try {
            results = await this.searchDuckDuckGoHtml(query);
            if (results.length > 0) {
                console.log(`[WebSearchService] DDG HTML returned ${results.length} results`);
            }
        } catch (err: any) {
            console.warn('[WebSearchService] DDG HTML search failed:', err.message);
        }

        // Attempt 2: DuckDuckGo Lite if HTML returned no results
        if (results.length === 0) {
            try {
                results = await this.searchDuckDuckGoLite(query);
                if (results.length > 0) {
                    console.log(`[WebSearchService] DDG Lite returned ${results.length} results`);
                }
            } catch (err: any) {
                console.warn('[WebSearchService] DDG Lite search failed:', err.message);
            }
        }

        // Attempt 3: Wikipedia API search fallback if still empty
        if (results.length === 0) {
            try {
                results = await this.searchWikipedia(query);
                if (results.length > 0) {
                    console.log(`[WebSearchService] Wikipedia API returned ${results.length} results`);
                }
            } catch (err: any) {
                console.warn('[WebSearchService] Wikipedia search failed:', err.message);
            }
        }

        // Cache valid results
        if (results.length > 0) {
            if (isUpstashConfigured) {
                try {
                    await redis.set(cacheKey, results, CACHE_TTL_SECONDS);
                } catch (err: any) {
                    console.warn('[WebSearchService] Redis cache write failed:', err.message);
                }
            } else {
                memoryCache[normalizedQuery] = {
                    results,
                    timestamp: Date.now()
                };
            }
        }

        return results;
    }

    private static async searchDuckDuckGoHtml(query: string): Promise<SearchResult[]> {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000
        });

        const html = response.data;
        const results: SearchResult[] = [];
        const blocks = html.split(/class="[^"]*result__body[^"]*"/);

        for (let i = 1; i < blocks.length && results.length < 8; i++) {
            const block = blocks[i];
            const urlMatch = /class="result__a"[^>]*href="([^"]+)"/.exec(block);
            const titleMatch = /class="result__a"[^>]*>([\s\S]*?)<\/a>/.exec(block);
            const snippetMatch = /class="result__snippet"[^>]*>([\s\S]*?)<\/(a|div|span)>/.exec(block);

            if (urlMatch && titleMatch) {
                let rawUrl = urlMatch[1];
                if (rawUrl.startsWith('/l/?') || rawUrl.includes('uddg=')) {
                    const uddgMatch = /[?&]uddg=([^&]+)/.exec(rawUrl);
                    if (uddgMatch) rawUrl = decodeURIComponent(uddgMatch[1]);
                }
                const title = this.cleanHtml(titleMatch[1]);
                const snippet = snippetMatch ? this.cleanHtml(snippetMatch[1]) : '';
                if (title && rawUrl.startsWith('http')) {
                    results.push({ title, url: rawUrl, snippet });
                }
            }
        }
        return results;
    }

    private static async searchDuckDuckGoLite(query: string): Promise<SearchResult[]> {
        const response = await axios.post('https://lite.duckduckgo.com/lite/', `q=${encodeURIComponent(query)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
            },
            timeout: 10000
        });

        const html = response.data;
        const results: SearchResult[] = [];
        const linkRegex = /<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        const snippetRegex = /<td[^>]+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;

        let linkMatch;
        while ((linkMatch = linkRegex.exec(html)) !== null && results.length < 8) {
            const rawUrl = linkMatch[1];
            const title = this.cleanHtml(linkMatch[2]);
            const snippetMatch = snippetRegex.exec(html);
            const snippet = snippetMatch ? this.cleanHtml(snippetMatch[1]) : '';

            let decodedUrl = rawUrl;
            if (rawUrl.startsWith('/l/?') || rawUrl.includes('uddg=')) {
                const uddgMatch = /[?&]uddg=([^&]+)/.exec(rawUrl);
                if (uddgMatch) decodedUrl = decodeURIComponent(uddgMatch[1]);
            }

            if (title && decodedUrl.startsWith('http')) {
                results.push({ title, url: decodedUrl, snippet });
            }
        }
        return results;
    }

    private static async searchWikipedia(query: string): Promise<SearchResult[]> {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'VelixBot/1.0 (https://velix.snapgrids.store; contact@snapgrids.store)'
            },
            timeout: 8000
        });

        const items = response.data?.query?.search || [];
        return items.slice(0, 5).map((item: any) => ({
            title: item.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            snippet: this.cleanHtml(item.snippet || '')
        }));
    }

    private static cleanHtml(html: string): string {
        return html
            .replace(/<[^>]+>/g, '') // strip tags
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&#x2F;/g, '/')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
