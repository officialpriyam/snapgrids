import { Router } from 'express';
import axios from 'axios';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import os from 'os';
import config from '../utils/config';
import { generateCode, enhancePrompt } from '../services/AIService';
import { CodeGenerationService } from '../services/CodeGenerationService';
import { pluginManager } from '../services/PluginManager';
import { AuthService } from '../services/AuthService';
import { dbService } from '../services/DatabaseService';
import { SandboxContext } from '../services/SandboxService';
import { generateProjectThumbnail } from '../services/ThumbnailService';
import { WebSearchService } from '../services/WebSearchService';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { cacheService } from '../services/CacheService';

const router = Router();

/**
 * Enhance prompt into a specification
 */
router.post('/enhance-prompt', asyncHandler(async (req, res) => {
    const { prompt, platform, language } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const enhanced = await enhancePrompt(prompt, platform, language);
        res.json({ enhanced });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

/**
 * Generate code with AI (returns structured file data)
 */
router.post('/generate', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    console.log('[AI Routes] /generate called');
    const { prompt, model, language, sessionId: existingSessionId, enableWebSearch, images, fileContext, chatMode } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    if (!req.auth || !req.auth.user) {
        console.error('[AI Routes] /generate - req.auth missing after requireAuth');
        return res.status(401).json({ error: "Authentication failed" });
    }

    const user = req.auth.user;

    // Chat mode is free, code generation requires credits
    if (!chatMode && user.credits < 20) {
        return res.status(402).json({ error: "Insufficient credits. Code generation requires 20 credits. Buy more credits to continue." });
    }

    const plugin = pluginManager.getPlugin(language || 'java');
    const platform = req.body.platform || 'minecraft';
    const context = plugin?.systemPrompt || "";
    const skipDocs = platform === 'discord-bot';

    let sessionId = existingSessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    let files: any[] = [];
    let rawResponse = '';
    let modelUsed = model || 'unknown';
    let creditsRemaining = user.credits;
    let searchQueries: string[] = [];
    let searchSources: { title: string; url: string }[] = [];

    try {
        let history: Array<{ role: string; content: string }> = [];
        if (existingSessionId) {
            try {
                const prevMessages = await dbService.getMessagesBySessionId(existingSessionId);
                if (Array.isArray(prevMessages)) {
                    history = prevMessages.map((m: any) => ({
                        role: m.role,
                        content: m.content
                    }));
                }
            } catch (err) {
                console.warn('[AI Routes] Failed to load chat history:', err);
            }
        }

        if (chatMode) {
            // Chat mode: conversational response, no code generation
            const tier = model || 'priyx-ultra';
            const selectedModel = tier;
            const isNvidia = selectedModel.startsWith('nvidia/');
            const endpoint = isNvidia ? "https://integrate.api.nvidia.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
            const apiKey = isNvidia ? process.env.NVIDIA_API_KEY : process.env.OPENROUTER_API_KEY;

            const chatMessages = [
                { role: 'system', content: 'You are Priyx, a friendly and knowledgeable AI assistant. You help users with coding, Minecraft plugins, Hytale, Discord bots, and general programming questions. Be conversational, helpful, and concise. Do not generate code files - just chat naturally. If the user asks you to create something, explain what you would do and mention that they should switch to Code mode for actual file generation.' },
                ...history.slice(-10),
                { role: 'user', content: prompt }
            ];

            try {
                const response = await axios.post(endpoint, {
                    model: selectedModel,
                    messages: chatMessages,
                    temperature: 0.7,
                    max_tokens: 2048
                }, {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://velix.snapgrids.store",
                        "X-Title": "Velix"
                    },
                    timeout: 60000
                });

                rawResponse = response.data.choices[0]?.message?.content || "I'm here to help! What would you like to know?";
                modelUsed = response.data.model || selectedModel;
            } catch (chatErr: any) {
                console.error('[AI Routes] Chat mode error:', chatErr.message);
                rawResponse = "I'm having trouble connecting right now. Please try again in a moment.";
            }
        } else {
            const result = await generateCode(prompt, model, context, skipDocs, enableWebSearch === true, history, platform, language, images, fileContext);
            files = result.files || [];
            rawResponse = result.rawResponse || '';
            modelUsed = result.model || model;
            searchQueries = result.searchQueries || [];
            searchSources = result.searchSources || [];
        }

        console.log(`[AI Routes] /generate AI completed - ${files.length} files, model: ${modelUsed}${chatMode ? ' (chat mode)' : ''}`);
    } catch (aiError: any) {
        console.error('[AI Routes] AI generation failed:', aiError.message);
        return res.status(500).json({ error: `AI generation failed: ${aiError.message || 'Unknown error'}` });
    }

    // Write files to sandbox (non-critical, don't fail over this) — skip for chat mode
    if (!chatMode && files.length > 0) {
        try {
            const sandbox = new SandboxContext(sessionId);
            for (const file of files) {
                sandbox.writeFile(file.path, file.content);
            }
            
            // Write project metadata file
            const category = req.body.category || (platform === 'discord' ? 'bots' : 'plugins');
            sandbox.writeFile('.project.json', JSON.stringify({
                platform,
                category,
                language: language || 'java'
            }, null, 4));
        } catch (e: any) {
            console.warn('[AI Routes] Sandbox write failed:', e.message);
        }
    }

    // Deduct credits (non-critical) — skip for chat mode
    if (!chatMode) {
        try {
            await dbService.deductCredits(req.auth!.userId, 20, 'generation', `Generated code for ${plugin?.name || "Project"}`);
        } catch (deductErr: any) {
            console.error('[AI Routes] deductCredits failed:', deductErr.message);
        }
    }

    // Get updated user (non-critical)
    try {
        const updatedUser = await dbService.getUserById(req.auth!.userId);
        if (updatedUser) {
            await cacheService.setCachedUser(req.auth!.userId, updatedUser);
            creditsRemaining = updatedUser.credits ?? 0;
        }
    } catch (e: any) {
        console.warn('[AI Routes] Failed to fetch updated user:', e.message);
    }

    // Create project record (non-critical)
    try {
        await dbService.createProject({
            id: sessionId,
            userId: req.auth!.userId,
            name: plugin?.name || "New Project",
            language: language || 'java',
            model: model
        });

        // Save platform, category, language into project settings
        const category = req.body.category || (platform === 'discord' ? 'bots' : 'plugins');
        await dbService.updateProjectSettings(sessionId, req.auth!.userId, {
            platform,
            category,
            language: language || 'java'
        });

        // Generate thumbnail async (non-blocking, fire-and-forget)
        generateProjectThumbnail(language || 'java', plugin?.name || 'New Project')
            .then(async (thumbnail) => {
                if (thumbnail) {
                    await dbService.updateProjectThumbnail(sessionId, thumbnail);
                    console.log(`[Thumbnail] Generated for project ${sessionId}`);
                }
            })
            .catch((err) => console.warn('[Thumbnail] Failed:', err.message));
    } catch (e: any) {
        console.warn('[AI Routes] Failed to create project record:', e.message);
    }

    // Save chat history (non-critical) — save a summary, not raw code
    try {
        await dbService.addMessage(sessionId, 'user', prompt);

        // Build a compact summary of what was generated instead of saving raw code
        const fileList = files.map(f => f.path).join(', ');
        const fileCount = files.length;
        const languageLabel = language || 'unknown';
        const platformLabel = platform || 'unknown';
        const summaryParts = [
            `Generated ${fileCount} ${platformLabel}/${languageLabel} file(s): ${fileList}`,
        ];
        if (rawResponse) {
            // Extract explanation lines and first few code lines for better context
            const explanationLines = rawResponse.split('\n')
                .filter(line => !line.startsWith('```') && !line.startsWith('FILE:') && !line.match(/^\*\*.*\*\*$/) && line.trim().length > 0)
                .slice(0, 15)
                .join('\n');
            if (explanationLines) summaryParts.push(explanationLines);
        }
        // Include file sizes for context
        const fileSizes = files.map(f => `${f.path} (${f.content.length} chars)`).join(', ');
        summaryParts.push(`Files created: ${fileSizes}`);
        const summary = summaryParts.join('\n\n');
        await dbService.addMessage(sessionId, 'assistant', summary.slice(0, 3000));
    } catch (e: any) {
        console.warn('[AI Routes] Failed to save chat history:', e.message);
    }

    // Create version snapshot (non-critical)
    try {
        const fileMap: Record<string, string> = {};
        const fileList: string[] = [];
        for (const file of files) {
            fileMap[file.path] = file.content;
            fileList.push(file.path);
        }
        if (fileList.length > 0) {
            await dbService.createVersion(sessionId, 'ai', fileMap, fileList, prompt.slice(0, 120));
        }
    } catch (e: any) {
        console.warn('[AI Routes] Failed to create version:', e.message);
    }

    // ALWAYS send response — truncate rawResponse to prevent huge payloads
    const responsePayload = {
        sessionId,
        files,
        model: modelUsed,
        rawResponse: rawResponse.slice(0, chatMode ? 4000 : 2000),
        creditsUsed: chatMode ? 0 : 20,
        creditsRemaining,
        searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
        searchSources: searchSources.length > 0 ? searchSources : undefined,
        chatMode: chatMode || false
    };
    console.log(`[AI Routes] /generate sending response - files: ${files.length}, payload size: ~${JSON.stringify(responsePayload).length} bytes`);
    res.json(responsePayload);
    console.log(`[AI Routes] /generate response sent OK`);
}));

/**
 * Manual web search endpoint
 */
router.post('/search', asyncHandler(async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        const results = await WebSearchService.searchWeb(query);
        res.json({ results });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

/**
 * Generate complete project and optionally compile it
 */
router.post('/generate-and-compile', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { prompt, language, model, autoCompile, enableWebSearch, platform, category } = req.body;

    if (!prompt || !language) {
        return res.status(400).json({ error: "Prompt and language are required" });
    }

    const user = req.auth!.user;

    if (user.credits < 20) {
        return res.status(402).json({ error: "Insufficient credits. Code generation requires 20 credits. Buy more credits to continue." });
    }

    try {
        const result = await CodeGenerationService.generateProject({
            prompt,
            language,
            model,
            autoCompile: autoCompile !== false, // Default to true
            enableWebSearch: enableWebSearch === true,
            platform,
            category
        });

        const plugin = pluginManager.getPlugin(language);
        await dbService.deductCredits(req.auth!.userId, 20, 'generation', `Generated & compiled ${plugin?.name || "Project"}`);
        const updatedUser = await dbService.getUserById(req.auth!.userId);
        if (updatedUser) await cacheService.setCachedUser(req.auth!.userId, updatedUser);

        await dbService.createProject({
            id: result.sessionId,
            userId: req.auth!.userId,
            name: plugin?.name || "New Project",
            language: language,
            model: model
        });

        // Save platform, category, language into project settings
        const isBot = language === 'python' || language === 'javascript' || language === 'typescript' || language === 'ruby';
        const finalPlatform = platform || (isBot ? 'discord' : 'minecraft');
        const finalCategory = category || (isBot ? 'bots' : 'plugins');
        await dbService.updateProjectSettings(result.sessionId, req.auth!.userId, {
            platform: finalPlatform,
            category: finalCategory,
            language
        });

        await dbService.addMessage(result.sessionId, 'user', prompt);
        await dbService.addMessage(result.sessionId, 'assistant', `Generated ${result.files.length} files.`);

        res.json({
            ...result,
            creditsUsed: 20,
            creditsRemaining: updatedUser.credits
        });
    } catch (error: any) {
        console.error('[AI Routes] Generate-and-compile error:', error.message);
        res.status(500).json({ error: error.message });
    }
}));

/**
 * Get chat history for a session
 */
router.get('/messages/:sessionId', asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    try {
        const messages = await dbService.getMessagesBySessionId(sessionId);
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

/**
 * Get available language plugins
 */
router.get('/languages', (req, res) => {
    const plugins = pluginManager.getAllPlugins();
    res.json(plugins.map(p => ({
        id: p.id,
        name: p.name,
        fileExtension: p.fileExtension
    })));
});

/**
 * GET /ai/models
 * Returns curated models grouped into 3 tiers:
 * - Priyx Lite: Free lightweight models
 * - Priyx Ultra: High-quality free models
 * - Priyx Max: Best available models (randomly selected)
 */
router.get('/models', asyncHandler(async (req, res) => {
    try {
        const orKey = process.env.OPENROUTER_API_KEY || config.openrouter_api_key || '';
        const nvKey = process.env.NVIDIA_API_KEY || config.nvidia_api_key || '';

        const fetches: Promise<any[]>[] = [];

        if (nvKey) {
            fetches.push(fetchNvidiaModels(nvKey));
        }
        if (orKey && orKey.startsWith('sk-or-')) {
            fetches.push(fetchOpenRouterModels(orKey));
        }

        const results = await Promise.allSettled(fetches);
        const all = results
            .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
            .flatMap(r => r.value);

        // Tier definitions
        const LITE_MODELS = [
            'openai/gpt-oss-20b:free',
            'google/gemma-4-26b-a4b-it:free',
            'google/gemma-4-31b-it:free',
            'meta-llama/llama-3.3-70b-instruct:free',
        ];

        const ULTRA_MODELS = [
            'qwen/qwen3-coder:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openai/gpt-oss-120b:free',
            'nousresearch/hermes-3-llama-3.1-405b:free',
            'nvidia/nemotron-3-super-120b-a12b:free',
        ];

        // Admin override: comma-separated list of additional model IDs to allow
        const extraModels = (process.env.EXTRA_ALLOWED_MODELS || '').split(',').map(s => s.trim()).filter(Boolean);

        // All allowed free models (lite + ultra + extras)
        const ALL_ALLOWED_FREE = [...LITE_MODELS, ...ULTRA_MODELS, ...extraModels];

        // Filter: keep all NVIDIA models + curated free models
        const filtered = all.filter(m => {
            if (m.provider === 'nvidia') return true;
            if (m.id.endsWith(':free')) return ALL_ALLOWED_FREE.includes(m.id);
            return false;
        });

        // Separate by tier
        const liteModels = filtered.filter(m => LITE_MODELS.includes(m.id));
        const ultraModels = filtered.filter(m => ULTRA_MODELS.includes(m.id));
        // Max tier = all NVIDIA models + best OpenRouter models
        const maxModels = filtered.filter(m =>
            m.provider === 'nvidia' || ULTRA_MODELS.includes(m.id)
        );

        console.log(`[AI Routes] Models: ${all.length} total → Lite: ${liteModels.length}, Ultra: ${ultraModels.length}, Max: ${maxModels.length}`);

        // If no models fetched, use config fallbacks
        if (liteModels.length === 0 && ultraModels.length === 0 && maxModels.length === 0) {
            const fallback = (config.nvidia_models || []).map((m: string) => ({
                id: m,
                name: m.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || m,
                description: 'NVIDIA NIM model',
                context_length: 131072,
                provider: 'nvidia' as const
            }));
            return res.json({
                tiers: {
                    lite: { name: 'Priyx Lite', description: 'Fast & free lightweight models', models: [] },
                    ultra: { name: 'Priyx Ultra', description: 'High-quality free models', models: [] },
                    max: { name: 'Priyx Max', description: 'Best available models — randomly selected', models: fallback }
                },
                flat: fallback
            });
        }

        res.json({
            tiers: {
                lite: {
                    name: 'Priyx Lite',
                    description: 'Fast & free — lightweight models for quick tasks',
                    models: liteModels
                },
                ultra: {
                    name: 'Priyx Ultra',
                    description: 'High-quality free models for serious coding',
                    models: ultraModels
                },
                max: {
                    name: 'Priyx Max',
                    description: 'Best available models — randomly selected from OpenRouter & NVIDIA',
                    models: maxModels
                }
            },
            flat: filtered
        });
    } catch (err) {
        console.error('[AI Routes] /models error:', err);
        const fallback = (config.nvidia_models || []).map((m: string) => ({
            id: m,
            name: m.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || m,
            description: 'NVIDIA NIM model',
            context_length: 131072,
            provider: 'nvidia' as const
        }));
        res.json({
            tiers: {
                lite: { name: 'Priyx Lite', description: 'Fast & free lightweight models', models: [] },
                ultra: { name: 'Priyx Ultra', description: 'High-quality free models', models: [] },
                max: { name: 'Priyx Max', description: 'Best available models — randomly selected', models: fallback }
            },
            flat: fallback
        });
    }
}));

async function fetchOpenRouterModels(apiKey: string): Promise<any[]> {
    if (!apiKey || !apiKey.startsWith('sk-or-')) return [];
    try {
        const response = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 10000
        });
        const data = response.data?.data;
        if (!Array.isArray(data)) return [];
        return data.map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            description: m.description || '',
            context_length: m.context_length || 0,
            provider: 'openrouter' as const,
            pricing: m.pricing || null
        }));
    } catch (err: any) {
        console.warn('[AI Routes] OpenRouter models fetch failed:', err.message || err);
        return [];
    }
}

async function fetchNvidiaModels(apiKey: string) {
    if (!apiKey) return [];
    try {
        const response = await axios.get('https://integrate.api.nvidia.com/v1/models', {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 15000
        });
        const data = response.data.data || response.data || [];
        return data.map((m: any) => ({
            id: m.id,
            name: m.id.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || m.id,
            description: m.description || 'NVIDIA NIM model',
            context_length: m.context_length || m.max_model_len || 131072,
            provider: 'nvidia' as const
        }));
    } catch (err) {
        console.error('[AI Routes] Failed to fetch NVIDIA models, using fallback:', err);
        return (config.nvidia_models || []).map((m: string) => ({
            id: m,
            name: `${m.split('/').pop()?.replace(/-/g, ' ').toUpperCase() || m}`,
            description: 'NVIDIA NIM model',
            context_length: 131072,
            provider: 'nvidia' as const
        }));
    }
}

// Project Management
router.delete('/projects/:id', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        await dbService.deleteProject(id, req.auth!.userId);
        // CLEANUP SANDBOX
        const sandbox = new SandboxContext(id);
        if (fs.existsSync(sandbox.rootPath)) {
            fs.rmSync(sandbox.rootPath, { recursive: true, force: true });
        }
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.patch('/projects/:id', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        await dbService.renameProject(id, req.auth!.userId, name);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.patch('/projects/:id/model', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { model } = req.body;

    if (!model) return res.status(400).json({ error: "Model is required" });

    try {
        await dbService.updateProjectModel(id, req.auth!.userId, model);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.patch('/projects/:id/visibility', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isPublic } = req.body;

    try {
        await dbService.toggleProjectVisibility(id, req.auth!.userId, isPublic);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

// ─── Private Share Link ───
router.post('/projects/:id/share-token', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const project = await dbService.getProjectById(id);
        if (!project || project.user_id !== req.auth!.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        if (project.share_token) {
            return res.json({ token: project.share_token, url: `/s/${project.share_token}` });
        }
        const token = await dbService.generateShareToken(id, req.auth!.userId);
        res.json({ token, url: `/s/${token}` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.delete('/projects/:id/share-token', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        await dbService.removeShareToken(id, req.auth!.userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.get('/shared/:token', asyncHandler(async (req, res) => {
    const { token } = req.params;
    try {
        const project = await dbService.getProjectByShareToken(token);
        if (!project) return res.status(404).json({ error: 'Invalid or expired link' });
        const user = await dbService.getUserById(project.user_id);
        res.json({
            project: {
                id: project.id,
                name: project.name,
                language: project.language,
                last_updated: project.last_updated,
                thumbnail: project.thumbnail,
                author_name: user?.display_name || user?.name || 'Unknown'
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

// ─── Team Members ───
router.get('/projects/:id/team', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    try {
        const members = await dbService.getTeamMembers(req.params.id);
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.post('/projects/:id/team', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ error: 'userId and role required' });
    if (!['editor', 'viewer'].includes(role)) return res.status(400).json({ error: 'role must be editor or viewer' });

    try {
        await dbService.addTeamMember(req.params.id, userId, role, req.auth!.userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.delete('/projects/:id/team/:userId', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    try {
        await dbService.removeTeamMember(req.params.id, req.params.userId);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.patch('/projects/:id/team/:userId', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!role || !['editor', 'viewer'].includes(role)) return res.status(400).json({ error: 'role must be editor or viewer' });

    try {
        await dbService.updateTeamMemberRole(req.params.id, req.params.userId, role);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.get('/projects/:id/access', asyncHandler(async (req, res) => {
    let userId: string | undefined;
    try {
        const token = req.cookies?.token;
        if (token) {
            const payload = await AuthService.verifyToken(token);
            if (payload) userId = payload.userId;
        }
    } catch {}

    const { accessible, role, project } = await dbService.isProjectAccessible(req.params.id, userId);

    // If project doesn't exist yet and user is logged in, allow access (new project)
    if (!project && userId) {
        return res.json({ accessible: true, role: 'owner', isPublic: false });
    }

    res.json({ accessible, role, isPublic: project?.is_public === 1 || project?.is_public === true });
}));

/**
 * Community Projects
 */
router.get('/community', asyncHandler(async (req, res) => {
    try {
        const projects = await dbService.getPublicProjects();
        res.json(projects);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

/**
 * Fork a project
 */
router.post('/fork/:id', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id: sourceId } = req.params;

    try {
        const project = await dbService.getProjectById(sourceId);
        if (!project) return res.status(404).json({ error: "Project not found" });
        if (!project.is_public && project.user_id !== req.auth!.userId) {
            return res.status(403).json({ error: "This project is private" });
        }

        const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // 1. Create DB entry
        await dbService.createProject({
            id: newId,
            userId: req.auth!.userId,
            name: `${project.name} (Forked)`,
            language: project.language,
            model: project.model,
            thumbnail: project.thumbnail || undefined
        });

        // 2. Clone sandbox files
        const sourceSandbox = new SandboxContext(sourceId);
        const targetSandbox = new SandboxContext(newId);

        if (fs.existsSync(sourceSandbox.rootPath)) {
            fs.mkdirSync(targetSandbox.rootPath, { recursive: true });
            fs.cpSync(sourceSandbox.rootPath, targetSandbox.rootPath, { recursive: true });
        }

        res.json({ success: true, newSessionId: newId });
    } catch (error: any) {
        console.error('[AI Routes] Fork error:', error.message);
        res.status(500).json({ error: error.message });
    }
}));

// ─── Session Settings ───

router.get('/projects/:id/settings', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const settings = await dbService.getProjectSettings(id);
        res.json({ settings });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.patch('/projects/:id/settings', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Settings object is required' });
    }
    try {
        await dbService.updateProjectSettings(id, req.auth!.userId, settings);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

// ─── Bot Console (Discord bot test runner) ───
interface BotSession {
    process: ChildProcess | null;
    logs: string[];
    status: 'starting' | 'running' | 'stopped' | 'error';
    startedAt: number;
    timeout: NodeJS.Timeout | null;
}

const activeBotSessions = new Map<string, BotSession>();

router.post('/bot/start', asyncHandler(requireAuth), async (req, res) => {
    try {
    const { sessionId, language, maxMinutes = 10 } = req.body;
    console.log(`[Bot Console] Start: sessionId=${sessionId}, language=${language}, platform=${process.platform}`);

    // Stop any existing session for this project
    if (activeBotSessions.has(sessionId)) {
        const existing = activeBotSessions.get(sessionId)!;
        if (existing.process) {
            try { existing.process.kill(); } catch {}
        }
        if (existing.timeout) clearTimeout(existing.timeout);
        activeBotSessions.delete(sessionId);
    }

    const sandbox = new SandboxContext(sessionId);
    const projectDir = sandbox.getRootDir();

        // Read bot token from .env file in project
        const fs = require('fs');
        let botToken = '';
        const envPath = path.join(projectDir, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            const tokenMatch = envContent.match(/(?:DISCORD_TOKEN|TOKEN)\s*=\s*(.+)/i);
            if (tokenMatch) botToken = tokenMatch[1].trim().replace(/^["']|["']$/g, '');
        }

        // Also check config.json
        if (!botToken) {
            const configPath = path.join(projectDir, 'config.json');
            if (fs.existsSync(configPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    botToken = config.token || config.DISCORD_TOKEN || '';
                } catch {}
            }
        }

        if (!botToken) {
            return res.status(400).json({ error: 'No bot token found. Add DISCORD_TOKEN=your_token to your .env file.' });
        }

        const logs: string[] = [];
        logs.push(`[${new Date().toISOString()}] Starting bot session...`);
        logs.push(`[${new Date().toISOString()}] Language: ${language}`);
        logs.push(`[${new Date().toISOString()}] Token loaded from .env`);
        logs.push(`[${new Date().toISOString()}] Session limit: ${maxMinutes} minutes`);

        // Determine run command based on language
        let runCmd: string;
        let runArgs: string[];
        const env = { ...process.env, DISCORD_TOKEN: botToken, TOKEN: botToken, NODE_ENV: 'production' };

        // Find node executable path on Windows
        const findNodePath = (): string => {
            if (process.platform === 'win32') {
                return process.execPath;
            }
            return 'node';
        };

        if (language === 'python' || language === 'py') {
            if (!fs.existsSync(path.join(projectDir, 'bot.py'))) {
                return res.status(400).json({ error: 'bot.py not found in project' });
            }
            runCmd = 'py';
            runArgs = ['bot.py'];
        } else if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
            const botFile = fs.existsSync(path.join(projectDir, 'bot.ts')) ? 'bot.ts' : 'bot.js';
            if (!fs.existsSync(path.join(projectDir, botFile))) {
                return res.status(400).json({ error: `${botFile} not found in project` });
            }
            if (botFile.endsWith('.ts')) {
                runCmd = findNodePath();
                runArgs = ['--require', 'ts-node/register', botFile];
            } else {
                runCmd = findNodePath();
                runArgs = [botFile];
            }
        } else if (language === 'ruby') {
            runCmd = 'ruby';
            runArgs = ['bot.rb'];
            if (!fs.existsSync(path.join(projectDir, 'bot.rb'))) {
                return res.status(400).json({ error: 'bot.rb not found in project' });
            }
        } else {
            runCmd = findNodePath();
            runArgs = ['bot.js'];
        }

        // Register session immediately so logs endpoint works during install
        activeBotSessions.set(sessionId, {
            process: null as any,
            logs,
            status: 'starting',
            startedAt: Date.now(),
            timeout: null as any
        });

        // Send response immediately — install + spawn runs async
        res.json({ success: true, message: 'Bot started' });

        // Run install + spawn asynchronously so frontend can poll logs in real-time
        const { spawn: spawnFn } = require('child_process');

        const stripPath = (line: string): string => {
            let cleaned = line.replace(new RegExp(projectDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '.');
            cleaned = cleaned.replace(/[A-Z]:\\Users\\[^\s]+?\\AppData\\[^\s]+/gi, '...');
            cleaned = cleaned.replace(/[A-Z]:\\Users\\[^\s]+?\\/gi, '~/');
            cleaned = cleaned.replace(/\/home\/[^\s]+?\//gi, '~/');
            cleaned = cleaned.replace(/\/usr\/local\/[^\s]+/gi, '/usr/...');
            cleaned = cleaned.replace(/\/opt\/[^\s]+/gi, '/opt/...');
            return cleaned;
        };

        const spawnBot = () => {
            const isWin = process.platform === 'win32';
            const child = spawnFn(
                isWin ? 'cmd.exe' : runCmd,
                isWin ? ['/c', runCmd, ...runArgs] : runArgs,
                {
                    cwd: projectDir,
                    env,
                    stdio: ['pipe', 'pipe', 'pipe'],
                }
            );

            child.stdout?.on('data', (data: Buffer) => {
                const lines = data.toString().split('\n').filter(l => l.trim());
                lines.forEach(line => logs.push(`[${new Date().toISOString()}] ${stripPath(line)}`));
            });

            child.stderr?.on('data', (data: Buffer) => {
                const lines = data.toString().split('\n').filter(l => l.trim());
                lines.forEach(line => logs.push(`[${new Date().toISOString()}] [ERR] ${stripPath(line)}`));
            });

            child.on('close', (code: number) => {
                logs.push(`[${new Date().toISOString()}] Process exited with code ${code}`);
                const session = activeBotSessions.get(sessionId);
                if (session) {
                    session.status = code === 0 ? 'stopped' : 'error';
                }
            });

            child.on('error', (err: any) => {
                logs.push(`[${new Date().toISOString()}] [ERROR] ${err.message}`);
                const session = activeBotSessions.get(sessionId);
                if (session) session.status = 'error';
            });

            // Auto-kill after maxMinutes
            const timeout = setTimeout(() => {
                logs.push(`[${new Date().toISOString()}] Session time limit reached. Stopping...`);
                try {
                    if (process.platform === 'win32') {
                        const { execSync } = require('child_process');
                        try { execSync(`taskkill /F /T /PID ${child.pid}`, { stdio: 'pipe' }); } catch {}
                    }
                    child.kill('SIGKILL');
                } catch {}
                const session = activeBotSessions.get(sessionId);
                if (session) {
                    session.status = 'stopped';
                    session.process = null;
                }
            }, maxMinutes * 60 * 1000);

            const session = activeBotSessions.get(sessionId);
            if (session) {
                session.process = child;
                session.status = 'running';
                session.timeout = timeout;
            }
        };

        // Install dependencies async, then spawn

        const runInstall = (cmd: string, args: string[], label: string): Promise<boolean> => {
            return new Promise((resolve) => {
                logs.push(`[${new Date().toISOString()}] ${label}`);
                const isWin = process.platform === 'win32';
                const proc = spawnFn(
                    isWin ? 'cmd.exe' : cmd,
                    isWin ? ['/c', cmd, ...args] : args,
                    {
                        cwd: projectDir,
                        stdio: ['pipe', 'pipe', 'pipe'],
                    }
                );
                proc.stdout?.on('data', (data: Buffer) => {
                    const lines = data.toString().split('\n').filter(l => l.trim());
                    lines.forEach(line => logs.push(`[${new Date().toISOString()}] ${stripPath(line)}`));
                });
                proc.stderr?.on('data', (data: Buffer) => {
                    const lines = data.toString().split('\n').filter(l => l.trim());
                    lines.forEach(line => logs.push(`[${new Date().toISOString()}] ${stripPath(line)}`));
                });
                proc.on('close', (code: number) => {
                    if (code === 0) {
                        logs.push(`[${new Date().toISOString()}] Dependencies installed`);
                    } else {
                        logs.push(`[${new Date().toISOString()}] [ERR] Install exited with code ${code}`);
                    }
                    resolve(code === 0);
                });
                proc.on('error', (err: any) => {
                    logs.push(`[${new Date().toISOString()}] [ERR] Install failed: ${err.message?.slice(0, 200) || 'unknown error'}`);
                    resolve(false);
                });
            });
        };

        (async () => {
            try {
                if (language === 'python' || language === 'py') {
                    if (fs.existsSync(path.join(projectDir, 'requirements.txt'))) {
                        await runInstall('py', ['-m', 'pip', 'install', '-r', 'requirements.txt'], 'Installing Python dependencies...');
                    }
                } else if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
                    if (fs.existsSync(path.join(projectDir, 'package.json'))) {
                        await runInstall('npm', ['install', '--production'], 'Installing Node.js dependencies...');
                    }
                } else if (language === 'ruby') {
                    if (fs.existsSync(path.join(projectDir, 'Gemfile'))) {
                        await runInstall('bundle', ['install'], 'Installing Ruby dependencies...');
                    }
                }
                spawnBot();
            } catch (err: any) {
                logs.push(`[${new Date().toISOString()}] [ERROR] Install failed: ${err.message}`);
                const session = activeBotSessions.get(sessionId);
                if (session) session.status = 'error';
            }
        })();
    } catch (error: any) {
        console.error('[Bot Console] Start error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to start bot' });
    }
});

router.post('/bot/stop/:sessionId', asyncHandler(requireAuth), async (req, res) => {
    try {
    const { sessionId } = req.params;
    const session = activeBotSessions.get(sessionId);
    if (!session) return res.json({ success: true, message: 'No active session' });

    if (session.process) {
        try {
            if (process.platform === 'win32') {
                const { execSync } = require('child_process');
                try { execSync(`taskkill /F /T /PID ${session.process.pid}`, { stdio: 'pipe' }); } catch {}
            }
            session.process.kill('SIGKILL');
        } catch {}
    }
    if (session.timeout) clearTimeout(session.timeout);
    session.status = 'stopped';
    session.process = null;
    session.logs.push(`[${new Date().toISOString()}] Bot stopped by user`);

    // Clean up after a delay
    setTimeout(() => activeBotSessions.delete(sessionId), 60000);

    res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to stop bot' });
    }
});

router.get('/bot/logs/:sessionId', asyncHandler(requireAuth), async (req, res) => {
    try {
    const { sessionId } = req.params;
    const session = activeBotSessions.get(sessionId);
    if (!session) return res.json({ logs: [], status: 'stopped' });

    res.json({ logs: session.logs, status: session.status });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to get logs' });
    }
});

export default router;
