const axios = require('axios');

async function test() {
    try {
        const url = 'https://html.duckduckgo.com/html/?q=minecraft+paper+api';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000
        });

        const html = response.data;
        console.log('HTML Status:', response.status, 'Length:', html.length);

        const blocks = html.split(/class="[^"]*result__body[^"]*"/);
        console.log('Found blocks:', blocks.length);

        const results = [];
        for (let i = 1; i < blocks.length && i <= 8; i++) {
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
                const title = titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
                results.push({ title, url: rawUrl, snippet });
            }
        }

        console.log('Extracted results:', JSON.stringify(results, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
