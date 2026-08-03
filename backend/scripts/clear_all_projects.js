// Deletes every row in the `projects` table (all users).
// Cascades to messages, compile_history, wiki_pages, project_versions,
// project_dependencies, and team_members via FK ON DELETE CASCADE.
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !KEY) {
    console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

async function api(path, init = {}) {
    const url = new URL(`/rest/v1/${path}`, SUPABASE_URL);
    const res = await fetch(url, {
        ...init,
        headers: {
            apikey: KEY,
            Authorization: `Bearer ${KEY}`,
            'Content-Type': 'application/json',
            ...(init.headers || {})
        }
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${init.method || 'GET'} ${path} -> ${res.status} ${body}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

async function main() {
    const rows = await api('projects?select=id&limit=10000', { headers: { Accept: 'application/json' } });
    const ids = (rows || []).map((r) => r.id);
    console.log(`Found ${ids.length} projects.`);

    if (ids.length === 0) {
        console.log('Nothing to delete.');
        return;
    }

    let deleted = 0;
    for (let i = 0; i < ids.length; i += 100) {
        const chunk = ids.slice(i, i + 100);
        const url = new URL('/rest/v1/projects', SUPABASE_URL);
        url.searchParams.set('id', `in.(${chunk.join(',')})`);
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                apikey: KEY,
                Authorization: `Bearer ${KEY}`,
                Prefer: 'return=representation'
            }
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`DELETE chunk failed: ${res.status} ${body}`);
        }
        deleted += chunk.length;
        console.log(`Deleted ${deleted}/${ids.length}...`);
    }

    console.log(`Done. Deleted ${deleted} projects (related messages/versions/deps/wiki/team rows cascade-deleted).`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
