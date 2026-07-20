import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, optionalAuth } from '../middleware/auth';
import axios from 'axios';

const router = Router();
const GENERATOR_URL = process.env.GENERATOR_URL || 'http://localhost:5000';

function getForwardHeaders(req: any): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY || '';
    if (apiKey) headers['X-API-Key'] = apiKey;
    const sessionToken = req.cookies?.velix_session;
    if (sessionToken) headers['X-Session-Token'] = sessionToken;
    return headers;
}

function rewriteUrls(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const result = { ...data };
    if (result.download_url && typeof result.download_url === 'string') {
        const filename = result.download_url.replace('/download/', '');
        result.download_url = `/api/generator/download/${filename}`;
    }
    if (result.preview_url && typeof result.preview_url === 'string') {
        const filename = result.preview_url.replace('/preview/', '');
        result.preview_url = `/api/generator/preview/${filename}`;
    }
    return result;
}

router.post('/texture', asyncHandler(optionalAuth), async (req, res) => {
    try {
        const result = await axios.post(`${GENERATOR_URL}/generate/texture`, req.body, {
            timeout: 180000,
            headers: getForwardHeaders(req)
        });
        res.json(rewriteUrls(result.data));
    } catch (err: any) {
        console.error('[Generator] Texture error:', err.message);
        res.status(500).json({ error: err.response?.data?.error || err.message || 'Texture generation failed' });
    }
});

router.post('/model', asyncHandler(optionalAuth), async (req, res) => {
    try {
        const result = await axios.post(`${GENERATOR_URL}/generate/model`, req.body, {
            timeout: 120000,
            headers: getForwardHeaders(req)
        });
        res.json(rewriteUrls(result.data));
    } catch (err: any) {
        console.error('[Generator] Model error:', err.message);
        res.status(500).json({ error: err.response?.data?.error || err.message || 'Model generation failed' });
    }
});

router.post('/schematic', asyncHandler(optionalAuth), async (req, res) => {
    try {
        const result = await axios.post(`${GENERATOR_URL}/generate/schematic`, req.body, {
            timeout: 180000,
            headers: getForwardHeaders(req)
        });
        res.json(rewriteUrls(result.data));
    } catch (err: any) {
        console.error('[Generator] Schematic error:', err.message);
        res.status(500).json({ error: err.response?.data?.error || err.message || 'Schematic generation failed' });
    }
});

router.get('/download/:filename', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const response = await axios.get(`${GENERATOR_URL}/download/${filename}`, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const mimeTypes: Record<string, string> = {
            'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'schem': 'application/octet-stream', 'bbmodel': 'application/json'
        };
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(response.data));
    } catch (err: any) {
        console.error('[Generator] Download error:', err.message);
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/preview/:filename', async (req, res) => {
    try {
        const filename = decodeURIComponent(req.params.filename);
        const response = await axios.get(`${GENERATOR_URL}/preview/${filename}`, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const mimeTypes: Record<string, string> = {
            'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'schem': 'application/octet-stream', 'bbmodel': 'application/json'
        };
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.send(Buffer.from(response.data));
    } catch (err: any) {
        console.error('[Generator] Preview error:', err.message);
        res.status(404).json({ error: 'File not found' });
    }
});

router.get('/health', async (_req, res) => {
    try {
        const result = await axios.get(`${GENERATOR_URL}/health`, { timeout: 5000 });
        res.json(result.data);
    } catch {
        res.json({ status: 'offline', service: 'velix-generator' });
    }
});

export default router;
