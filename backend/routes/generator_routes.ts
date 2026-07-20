import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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

router.post('/texture', asyncHandler(requireAuth), async (req, res) => {
    try {
        const result = await axios.post(`${GENERATOR_URL}/generate/texture`, req.body, {
            timeout: 180000,
            headers: getForwardHeaders(req)
        });
        res.json(result.data);
    } catch (err: any) {
        console.error('[Generator] Texture error:', err.message);
        res.status(500).json({ error: err.response?.data?.error || err.message || 'Texture generation failed' });
    }
});

router.post('/model', asyncHandler(requireAuth), async (req, res) => {
    try {
        const result = await axios.post(`${GENERATOR_URL}/generate/model`, req.body, {
            timeout: 120000,
            headers: getForwardHeaders(req)
        });
        res.json(result.data);
    } catch (err: any) {
        console.error('[Generator] Model error:', err.message);
        res.status(500).json({ error: err.response?.data?.error || err.message || 'Model generation failed' });
    }
});

router.post('/schematic', asyncHandler(requireAuth), async (req, res) => {
    try {
        const result = await axios.post(`${GENERATOR_URL}/generate/schematic`, req.body, {
            timeout: 180000,
            headers: getForwardHeaders(req)
        });
        res.json(result.data);
    } catch (err: any) {
        console.error('[Generator] Schematic error:', err.message);
        res.status(500).json({ error: err.response?.data?.error || err.message || 'Schematic generation failed' });
    }
});

router.get('/download/:filename', async (req, res) => {
    const filePath = path.join(__dirname, '../../velix-generator/output', req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    res.download(filePath);
});

router.get('/preview/:filename', async (req, res) => {
    const filePath = path.join(__dirname, '../../velix-generator/output', req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.schem': 'application/octet-stream',
        '.bbmodel': 'application/json'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
});

export default router;
