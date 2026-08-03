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
import { resolveChatProvider, providerHeaders } from '../services/ModelProviderService';

const router = Router();

function resolvePlanModel(model?: string) {
    const m = model || '';
    if (resolveChatProvider(m)) return m; // specialty providers (llmgate/orac/priyx) used directly
    if (['priyx-lite', 'velix-lite', 'lite'].includes(m)) return 'openai/gpt-oss-20b:free';
    if (['priyx-max', 'velix-max', 'max'].includes(m)) return 'openai/gpt-oss-120b:free';
    if (!model || ['priyx-ultra', 'velix-pro', 'velix-ultra', 'pro', 'ultra'].includes(m)) return 'qwen/qwen3-coder:free';
    return model;
}

function planModelCandidates(model?: string) {
    const primary = resolvePlanModel(model);
    const providerFallbacks = ['llmgate', 'orac', 'priyx', 'requesty'].filter(m => {
        const p = resolveChatProvider(m);
        return p && p.apiKey && !p.apiKey.includes('YOUR_') && p.apiKey.length > 5;
    });
    return Array.from(new Set([
        primary,
        ...providerFallbacks,
        'qwen/qwen3-next-80b-a3b-instruct:free',
        'openai/gpt-oss-120b:free',
        'qwen/qwen3-coder:free',
        'glm/glm-4.6:free',
        'deepseek-ai/deepseek-coder-v2-lite-instruct:free',
        'nvidia/nemotron-3-super-120b-a12b:free',
        ...(config.nvidia_models || []).slice(0, 2)
    ].filter(Boolean)));
}

function extractJsonObject(raw: string) {
    const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
    try { return JSON.parse(cleaned); } catch {}
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
        return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('AI did not return valid plan JSON');
}

function normalizePlanResult(result: any, prompt: string) {
    if (!result?.plan) throw new Error('AI plan response missing plan');
    const promptTopic = prompt.replace(/https?:\/\/[^\s]+/g, '').trim() || prompt;
    const plan = {
        title: String(result.plan.title || `Plan for ${promptTopic.slice(0, 60)}`),
        summary: String(result.plan.summary || `Implementation plan for ${prompt}`),
        components: Array.isArray(result.plan.components) && result.plan.components.length
            ? result.plan.components.slice(0, 8).map((component: any, index: number) => ({
                name: String(component.name || `Step ${index + 1}`),
                desc: String(component.desc || component.description || 'Implementation detail')
            }))
            : [
                { name: 'Core experience', desc: 'Primary feature flow requested by the user' },
                { name: 'Project files', desc: 'Generated implementation and supporting configuration' }
            ],
        designDirection: Array.isArray(result.plan.designDirection) && result.plan.designDirection.length
            ? result.plan.designDirection.slice(0, 8).map((item: any) => String(item))
            : ['Use the existing project structure', 'Keep the implementation focused and shippable']
    };
    const questions = Array.isArray(result.questions) && result.questions.length
        ? result.questions.slice(0, 3).map((question: any, index: number) => ({
            id: String(question.id || `q${index + 1}`),
            question: String(question.question || `Choose the preferred scope for ${plan.title}`),
            options: (Array.isArray(question.options) && question.options.length ? question.options : ['Complete working version', 'Core feature only', 'Just scaffold it', 'Write your own...']).map((option: any) => String(option))
        }))
        : [{
            id: 'q1',
            question: `How much should I build now for ${plan.title}?`,
            options: ['Complete working version', 'Core feature only', 'Just scaffold it', 'Write your own...']
        }];
    return { plan, questions };
}

function formatPlanMarkdown(plan: any, questions: any[] = [], answers: Record<string, string> = {}) {
    const lines = [`# ${plan?.title || 'Project Plan'}`, '', plan?.summary || ''];
    if (plan?.components?.length) {
        lines.push('', '## What I’ll build', '');
        for (const component of plan.components) lines.push(`- **${component.name}** — ${component.desc}`);
    }
    if (plan?.designDirection?.length) {
        lines.push('', '## Design direction', '');
        for (const item of plan.designDirection) lines.push(`- ${item}`);
    }
    if (questions.length) {
        lines.push('', '## Decisions to confirm', '');
        for (const question of questions) {
            const answer = answers[question.id];
            lines.push(`- ${question.question}${answer ? `\n  - Selected: ${answer.replace(/^custom:/, '')}` : ''}`);
        }
    }
    return lines.join('\n');
}

async function requireProjectEditor(sessionId: string, userId: string) {
    const access = await dbService.isProjectAccessible(sessionId, userId);
    // The workspace can be opened before its first generation creates the
    // database row.  Treat that specific, authenticated first use as project
    // creation; do not apply this to an existing project owned by somebody
    // else, which must still pass the role check below.
    if (!access.project) {
        await dbService.createProject({
            id: sessionId,
            userId,
            name: 'New Project',
            language: 'java'
        });
        return { accessible: true, role: 'owner', project: { id: sessionId, user_id: userId } };
    }
    if (!access.accessible || !access.role || access.role === 'viewer') {
        const error: any = new Error('You do not have permission to change this project conversation.');
        error.status = 403;
        throw error;
    }
    return access;
}

/**
 * Plan mode: Generate clarifying questions & project blueprint
 */
router.post('/plan', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { prompt, platform, language, model, sessionId, enableWebSearch } = req.body;
    if (!prompt || !sessionId) return res.status(400).json({ error: "Prompt and sessionId are required" });
    await requireProjectEditor(sessionId, req.auth!.userId);

    try {
        let searchSources: { title: string; url: string; snippet: string }[] = [];
        if (enableWebSearch) {
            try { searchSources = await WebSearchService.searchWeb(prompt); }
            catch (searchError: any) { console.warn('[AI Routes] Plan web search failed:', searchError.message); }
        }
        const webContext = searchSources.length
            ? `\n\nWeb research (use only when relevant):\n${searchSources.slice(0, 5).map(item => `- ${item.title}: ${item.snippet} (${item.url})`).join('\n')}`
            : '';

        const systemPrompt = `You are a senior software architect creating an interactive plan for a user project.
Respond ONLY with a valid JSON object (no markdown surrounding text) matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "Clear question about scope or preferences for this project?",
      "options": [
        "First option with brief description",
        "Second option with brief description",
        "Third option with brief description"
      ]
    }
  ],
  "plan": {
    "title": "Short title for what will be built",
    "summary": "2-3 sentence overview of the architecture and approach",
    "components": [
      { "name": "Component/Page name", "desc": "Brief details of what this includes" }
    ],
    "designDirection": [
      "Key design/tech stack decision 1",
      "Key design/tech stack decision 2"
    ]
  }
}

Generate 1-2 practical, high-value questions for the user to refine requirements. Keep options concise and clear.`;

        let rawContent = "";
        let jsonResult: any = null;
        let modelUsed = "";
        let lastPlanError: any = null;
        for (const candidate of planModelCandidates(model)) {
            const chatProvider = resolveChatProvider(candidate);
            const isNvidia = !chatProvider && (candidate.startsWith('nvidia/') || candidate.includes('nemotron') || (config.nvidia_models || []).includes(candidate));
            const endpoint = chatProvider
                ? chatProvider.endpoint
                : isNvidia ? "https://integrate.api.nvidia.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
            const apiKey = chatProvider
                ? chatProvider.apiKey
                : isNvidia ? process.env.NVIDIA_API_KEY || config.nvidia_api_key : process.env.OPENROUTER_API_KEY || config.openrouter_api_key;
            if (!apiKey || apiKey.includes('YOUR_')) {
                lastPlanError = new Error(`${chatProvider ? chatProvider.label : (isNvidia ? 'NVIDIA' : 'OpenRouter')} API key is missing`);
                continue;
            }
            try {
                const response = await axios.post(endpoint, {
                    model: chatProvider ? chatProvider.model : candidate,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Platform: ${platform || 'web'}\nLanguage: ${language || 'typescript'}\nUser Request: ${prompt}${webContext}` }
                    ],
                    temperature: 0.35,
                    max_tokens: 2200
                }, {
                    headers: chatProvider
                        ? providerHeaders(chatProvider)
                        : {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://velix.snapgrids.store",
                            "X-Title": "Velix"
                        },
                    timeout: 45000
                });
                rawContent = response.data.choices[0]?.message?.content || "";
                jsonResult = normalizePlanResult(extractJsonObject(rawContent), prompt);
                modelUsed = response.data.model || (chatProvider ? chatProvider.model : candidate);
                break;
            } catch (planError: any) {
                lastPlanError = planError;
                console.warn(`[AI Routes] Plan model ${candidate} failed:`, planError.message);
            }
        }
        if (!jsonResult) throw lastPlanError || new Error('Unable to generate an AI plan');

        const promptTopic = prompt.replace(/https?:\/\/[^\s]+/g, '').trim() || prompt;
        const cleanTopic = promptTopic.slice(0, 60);

        const fallbackResult = {
            questions: [
                {
                    id: "q1",
                    question: `${cleanTopic} is a custom project with features, UI, and components. How much should I build now?`,
                    options: [
                        "Marketplace frontend only — Home, browse/category pages, product detail, seller profile — with realistic demo data, no backend.",
                        "Frontend + accounts & real data — Adds signup/login, real listings in a database, seller dashboard to post items.",
                        "Just the landing/home page — One polished home page in that style, nothing else.",
                        "Write your own..."
                    ]
                }
            ],
            plan: {
                title: `Plan for ${cleanTopic}`,
                summary: `Comprehensive implementation plan for ${prompt}`,
                components: [
                    { name: "Core Application Logic", desc: "Main features and data structures" },
                    { name: "UI / Configuration", desc: "User interface and settings" }
                ],
                designDirection: ["Modern architecture", "Clean code patterns"]
            }
        };

        await dbService.addMessage(sessionId, 'user', prompt, 'message');
        let saved = await dbService.addMessage(sessionId, 'assistant', jsonResult.plan?.summary || 'Plan ready for review.', 'plan', {
            plan: jsonResult.plan,
            questions: jsonResult.questions || [],
            answers: {},
            status: 'awaiting_answers',
            modelUsed,
            aiGenerated: true
        });
        if (!saved?.[0]?.id) {
            const rows = await dbService.getMessagesBySessionId(sessionId);
            saved = rows.filter((item: any) => item.message_type === 'plan').slice(-1);
        }
        new SandboxContext(sessionId).writeFile('plan.md', formatPlanMarkdown(jsonResult.plan, jsonResult.questions));
        res.json({ ...jsonResult, message: saved?.[0] || null, modelUsed, aiGenerated: true, searchQueries: enableWebSearch ? [prompt] : [], searchSources: searchSources.map(({ title, url }) => ({ title, url })) });
    } catch (error: any) {
        console.error('[AI Routes] /plan failed:', error.message);
        return res.status(502).json({ error: `AI plan generation failed: ${error.message || 'Unable to create plan'}` });
        const promptTopic = prompt.replace(/https?:\/\/[^\s]+/g, '').trim() || prompt;
        const cleanTopic = promptTopic.slice(0, 60);
        const fallback = {
            questions: [
                {
                    id: "q1",
                    question: `${cleanTopic} is a custom project with features, UI, and components. How much should I build now?`,
                    options: [
                        "Marketplace frontend only — Home, browse/category pages, product detail, seller profile — with realistic demo data, no backend.",
                        "Frontend + accounts & real data — Adds signup/login, real listings in a database, seller dashboard to post items.",
                        "Just the landing/home page — One polished home page in that style, nothing else.",
                        "Write your own..."
                    ]
                }
            ],
            plan: {
                title: `Plan for ${cleanTopic}`,
                summary: `Architecture blueprint for ${prompt}`,
                components: [
                    { name: "Main System", desc: "Core implementation files" }
                ],
                designDirection: ["High performance", "Clean modular structure"]
            }
        };
        await dbService.addMessage(sessionId, 'user', prompt, 'message');
        const saved = await dbService.addMessage(sessionId, 'assistant', fallback.plan.summary, 'plan', {
            plan: fallback.plan, questions: fallback.questions, answers: {}, status: 'awaiting_answers'
        });
        new SandboxContext(sessionId).writeFile('plan.md', formatPlanMarkdown(fallback.plan, fallback.questions));
        res.json({ ...fallback, message: saved?.[0] || null });
    }
}));

router.patch('/plans/:messageId', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const messageId = Number(req.params.messageId);
    const { sessionId, answers, status } = req.body;
    if (!messageId || !sessionId || !['awaiting_approval', 'approved'].includes(status)) {
        return res.status(400).json({ error: 'Valid sessionId, message id and plan status are required.' });
    }
    await requireProjectEditor(sessionId, req.auth!.userId);
    const messages = await dbService.getMessagesBySessionId(sessionId);
    const message = messages.find((item: any) => item.id === messageId && item.message_type === 'plan');
    if (!message) return res.status(404).json({ error: 'Plan not found.' });
    const metadata = { ...(message.metadata || {}), answers: answers || {}, status };
    await dbService.updateMessage(messageId, { metadata });
    new SandboxContext(sessionId).writeFile('plan.md', formatPlanMarkdown(metadata.plan, metadata.questions, metadata.answers));
    await dbService.addMessage(sessionId, 'assistant', status === 'approved' ? 'Plan approved. Building your project now.' : 'Answers saved. Review and approve the plan when ready.', 'timeline', { event: status, planMessageId: messageId });
    res.json({ success: true, metadata });
}));


/**
 * Generate code with AI (returns structured file data)
 */
router.post('/generate', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    console.log('[AI Routes] /generate called');
    const { prompt, model, language, sessionId: existingSessionId, enableWebSearch, images, fileContext, chatMode, fromPlan, planMessageId } = req.body;
    const wantsStream = req.query.stream === 'true' || req.body.stream === true;

    // Set up Server-Sent Events for live progress when requested
    if (wantsStream) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no'
        });
        if (typeof (res as any).flushHeaders === 'function') (res as any).flushHeaders();
    }
    const send = (event: string, data: any) => {
        if (!wantsStream) return;
        try {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            if (typeof (res as any).flush === 'function') (res as any).flush();
        } catch (e) { /* client gone */ }
    };

    if (!prompt) {
        const msg = { error: "Prompt is required" };
        if (wantsStream) { send('error', msg); res.end(); return; }
        return res.status(400).json(msg);
    }

    if (!req.auth || !req.auth.user) {
        console.error('[AI Routes] /generate - req.auth missing after requireAuth');
        const msg = { error: "Authentication failed" };
        if (wantsStream) { send('error', msg); res.end(); return; }
        return res.status(401).json(msg);
    }

    const user = req.auth.user;

    // Chat mode is free, code generation requires credits
    if (!chatMode && user.credits < 20) {
        const msg = { error: "Insufficient credits. Code generation requires 20 credits. Buy more credits to continue." };
        if (wantsStream) { send('error', msg); res.end(); return; }
        return res.status(402).json(msg);
    }

    const plugin = pluginManager.getPlugin(language || 'java');
    const platform = req.body.platform || 'minecraft';
    const context = plugin?.systemPrompt || "";
    const skipDocs = platform === 'discord-bot';

    let sessionId = existingSessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sandbox = new SandboxContext(sessionId);
    let files: any[] = [];
    let rawResponse = '';
    let modelUsed = model || 'unknown';
    let creditsRemaining = user.credits;
    let searchQueries: string[] = [];
    let searchSources: { title: string; url: string }[] = [];
    let genResult: any = null;

    if (existingSessionId) await requireProjectEditor(existingSessionId, req.auth!.userId);
    if (fromPlan && (!existingSessionId || !planMessageId)) return res.status(400).json({ error: 'An approved plan is required.' });

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
            const chatProvider = resolveChatProvider(tier);

            const chatCandidates = chatProvider
                ? [tier]
                : [
                    tier,
                    ...(['llmgate', 'orac', 'priyx', 'requesty'].filter(m => {
                        const p = resolveChatProvider(m);
                        return p && p.apiKey && !p.apiKey.includes('YOUR_') && p.apiKey.length > 5;
                    }))
                  ];

            if (enableWebSearch) {
                try {
                    send('searching', { type: 'searching', query: prompt });
                    const sources = await WebSearchService.searchWeb(prompt);
                    searchQueries = [prompt];
                    searchSources = sources.map(({ title, url }) => ({ title, url }));
                    for (const src of searchSources.slice(0, 10)) {
                        send('search', { type: 'search', title: src.title, url: src.url });
                    }
                    const webContext = sources.slice(0, 5).map(item => `- ${item.title}: ${item.snippet} (${item.url})`).join('\n');
                    history.push({ role: 'system', content: `Web search results for the user's current question:\n${webContext}` });
                } catch (searchError: any) {
                    console.warn('[AI Routes] Chat web search failed:', searchError.message);
                }
            }

            const chatMessages = [
                { role: 'system', content: 'You are Priyx, a friendly and knowledgeable AI assistant. You help users with coding, Minecraft plugins, Hytale, Discord bots, and general programming questions. Be conversational, helpful, and concise. Do not generate code files - just chat naturally. If the user asks you to create something, explain what you would do and mention that they should switch to Code mode for actual file generation.' },
                ...history.slice(-10),
                { role: 'user', content: prompt }
            ];

            try {
                let chatRaw = '';
                let chatModelUsed = tier;
                for (const candidate of chatCandidates) {
                    const cp = resolveChatProvider(candidate);
                    const cModel = cp ? cp.model : resolvePlanModel(candidate);
                    const cIsNvidia = !cp && (cModel.startsWith('nvidia/') || cModel.includes('nemotron'));
                    const cEndpoint = cp
                        ? cp.endpoint
                        : cIsNvidia ? "https://integrate.api.nvidia.com/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
                    const cKey = cp
                        ? cp.apiKey
                        : cIsNvidia ? process.env.NVIDIA_API_KEY || config.nvidia_api_key : process.env.OPENROUTER_API_KEY || config.openrouter_api_key;
                    if (!cKey || cKey.includes('YOUR_')) continue;
                    try {
                        const response = await axios.post(cEndpoint, {
                            model: cModel,
                            messages: chatMessages,
                            temperature: 0.7,
                            max_tokens: 2048
                        }, {
                            headers: cp
                                ? providerHeaders(cp)
                                : {
                                    "Authorization": `Bearer ${cKey}`,
                                    "Content-Type": "application/json",
                                    "HTTP-Referer": "https://velix.snapgrids.store",
                                    "X-Title": "Velix"
                                },
                            timeout: 60000
                        });
                        chatRaw = response.data.choices[0]?.message?.content || '';
                        chatModelUsed = response.data.model || cModel;
                        break;
                    } catch (cErr: any) {
                        console.warn(`[AI Routes] Chat candidate ${candidate} failed:`, cErr.message);
                    }
                }
                rawResponse = chatRaw || "I'm here to help! What would you like to know?";
                modelUsed = chatModelUsed;
            } catch (chatErr: any) {
                console.error('[AI Routes] Chat mode error:', chatErr.message);
                rawResponse = "I'm having trouble connecting right now. Please try again in a moment.";
            }
        } else {
            const progressCb = (ev: { type: string; message?: string; query?: string; title?: string; url?: string; model?: string; chars?: number; path?: string; op?: string; docs?: string[] }) => {
                if (ev.type === 'file' && ev.path) {
                    const existed = sandbox.fileExists(ev.path);
                    send('file', { path: ev.path, op: existed ? 'edited' : 'created' });
                } else if (ev.type === 'search' || ev.type === 'searching' || ev.type === 'docs' || ev.type === 'model') {
                    send(ev.type, ev);
                }
            };
            genResult = await generateCode(prompt, model, context, skipDocs, enableWebSearch === true, history, platform, language, images, fileContext, progressCb);
            files = genResult.files || [];
            rawResponse = genResult.rawResponse || '';
            modelUsed = genResult.model || model;
            searchQueries = genResult.searchQueries || [];
            searchSources = genResult.searchSources || [];
        }

        console.log(`[AI Routes] /generate AI completed - ${files.length} files, model: ${modelUsed}${chatMode ? ' (chat mode)' : ''}`);
    } catch (aiError: any) {
        console.error('[AI Routes] AI generation failed:', aiError.message);
        if (fromPlan && planMessageId) {
            try {
                const stored = (await dbService.getMessagesBySessionId(sessionId)).find((m: any) => m.id === Number(planMessageId));
                if (stored) await dbService.updateMessage(Number(planMessageId), { metadata: { ...(stored.metadata || {}), status: 'error' } });
                await dbService.addMessage(sessionId, 'assistant', `Build failed: ${aiError.message || 'Unknown AI error'}`, 'timeline', { event: 'build_failed', planMessageId });
            } catch (persistError: any) {
                console.warn('[AI Routes] Failed to persist plan build error:', persistError.message);
            }
        }
        const failMsg = { error: `AI generation failed: ${aiError.message || 'Unknown error'}` };
        if (wantsStream) { send('error', failMsg); res.end(); return; }
        return res.status(500).json(failMsg);
    }

    // Write files to sandbox (non-critical, don't fail over this) — skip for chat mode
    if (!chatMode && files.length > 0) {
        try {
            for (const file of files) {
                const existed = sandbox.fileExists(file.path);
                sandbox.writeFile(file.path, file.content);
                send('file', { path: file.path, op: existed ? 'edited' : 'created' });
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

    // Execute AI-requested commands and downloads (non-critical, don't fail the request over these)
    if (!chatMode) {
        const commands: any[] = (genResult as any)?.commands || [];
        const downloads: any[] = (genResult as any)?.downloads || [];
        if (commands.length > 0 || downloads.length > 0) {
            try {
                for (const dl of downloads) {
                    try {
                        const result = await sandbox.downloadFile(dl.url, dl.path);
                        send('download', { url: dl.url, path: result.path, size: result.size, success: true });
                    } catch (dlErr: any) {
                        console.warn('[AI Routes] Download failed:', dl.url, dlErr.message);
                        send('download', { url: dl.url, path: dl.path || '', success: false, error: dlErr.message });
                    }
                }
                for (const cmd of commands) {
                    try {
                        send('command', { command: cmd.command, status: 'running', description: cmd.description });
                        const result = await sandbox.runCommand(cmd.command);
                        send('command', {
                            command: cmd.command,
                            status: result.success ? 'done' : 'error',
                            exitCode: result.exitCode,
                            output: (result.stdout + (result.stderr ? '\n' + result.stderr : '')).slice(0, 2000)
                        });
                        console.log(`[AI Routes] Command "${cmd.command}" -> exit ${result.exitCode ?? 'n/a'}`);
                    } catch (cmdErr: any) {
                        console.warn('[AI Routes] Command failed:', cmd.command, cmdErr.message);
                        send('command', { command: cmd.command, status: 'error', error: cmdErr.message });
                    }
                }
            } catch (e: any) {
                console.warn('[AI Routes] Action execution failed:', e.message);
            }
            try { await cacheService.invalidatePattern(`files:${sessionId}:*`); } catch { /* ignore */ }
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
        if (!fromPlan) await dbService.addMessage(sessionId, 'user', prompt, 'message');

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
        await dbService.addMessage(sessionId, 'assistant', chatMode ? rawResponse.slice(0, 4000) : summary.slice(0, 3000), chatMode ? 'message' : 'build', {
            files: files.map(f => ({ path: f.path, size: f.content?.length || 0 })),
            status: chatMode ? 'completed' : 'completed',
            search: searchQueries.length > 0 ? { queries: searchQueries, sources: searchSources } : undefined,
            docs: (genResult as any)?.docs?.length > 0 ? (genResult as any).docs : undefined,
            commands: (genResult as any)?.commands?.length > 0 ? (genResult as any).commands : undefined,
            downloads: (genResult as any)?.downloads?.length > 0 ? (genResult as any).downloads : undefined
        });
        if (fromPlan && planMessageId) {
            const stored = (await dbService.getMessagesBySessionId(sessionId)).find((m: any) => m.id === Number(planMessageId));
            if (stored) await dbService.updateMessage(Number(planMessageId), { metadata: { ...(stored.metadata || {}), status: 'completed' } });
            await dbService.addMessage(sessionId, 'assistant', `Build completed: ${files.length} file(s) generated.`, 'timeline', { event: 'build_completed', planMessageId, files: files.map(f => f.path) });
        }
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
        imageWarning: (genResult as any)?.imageWarning,
        chatMode: chatMode || false
    };
    console.log(`[AI Routes] /generate sending response - files: ${files.length}, payload size: ~${JSON.stringify(responsePayload).length} bytes`);
    if (wantsStream) {
        send('complete', responsePayload);
        res.end();
        console.log(`[AI Routes] /generate stream complete`);
        return;
    }
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
router.get('/messages/:sessionId', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    try {
        await requireProjectEditor(sessionId, req.auth!.userId);
        const messages = await dbService.getMessagesBySessionId(sessionId);
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}));

router.delete('/messages/:sessionId', asyncHandler(requireAuth), asyncHandler(async (req, res) => {
    await requireProjectEditor(req.params.sessionId, req.auth!.userId);
    await dbService.deleteMessagesBySessionId(req.params.sessionId);
    res.json({ success: true });
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
            'cohere/north-mini-code:free',
            'nvidia/nemotron-nano-9b-v2:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'glm/glm-4.6:free',
            'deepseek-ai/deepseek-coder-v2-lite-instruct:free',
            'microsoft/phi-3.5-mini-instruct:free',
        ];

        const PRO_MODELS = [
            'qwen/qwen3-coder:free',
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'openai/gpt-oss-120b:free',
            'nousresearch/hermes-3-llama-3.1-405b:free',
            'nvidia/nemotron-3-super-120b-a12b:free',
            'deepseek-ai/deepseek-coder-6.7b-instruct',
            'bigcode/starcoder2-15b',
            'glm/glm-4.6-plus:free',
            'deepseek-ai/deepseek-v3:free',
            'nvidia/nemotron-4-340b-a8b:free',
            'meta-llama/llama-4-90b-instruct:free',
        ];

        // All allowed free models
        const extraModels = (process.env.EXTRA_ALLOWED_MODELS || '').split(',').map(s => s.trim()).filter(Boolean);
        const ALL_ALLOWED_FREE = [...LITE_MODELS, ...PRO_MODELS, ...extraModels];

        // Filter: keep all NVIDIA models + fetched free models
        const filtered = all.filter(m => {
            if (m.provider === 'nvidia') return true;
            if (m.id.endsWith(':free')) return true;
            return true;
        });

        const fallback = (config.nvidia_models || []).map((m: string) => ({
            id: m,
            name: m.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || m,
            description: 'NVIDIA NIM model',
            context_length: 131072,
            provider: 'nvidia' as const
        }));

        const finalFlatList = filtered.length > 0 ? filtered : fallback;

        // Specialty providers (LLMGATE / orac / Priyx-Eden) exposed as selectable models
        const SPECIALTY_MODELS = [
            { id: 'llmgate', name: 'LLMGATE', description: 'Claude Haiku 4.5 free via LLMGateway — fast, smart, no credits', context_length: 200000, provider: 'llmgate' },
            { id: 'orac', name: 'orac', description: 'DeepSeek V4 free via OrcaRouter (random pro/flash model)', context_length: 131072, provider: 'orac' },
            { id: 'priyx', name: 'Priyx', description: 'Eden AI free models — random pick from 6 cloudflare/google models', context_length: 131072, provider: 'priyx' },
            { id: 'requesty', name: 'Requesty', description: 'Router API — random nemotron/poolside/gemma model', context_length: 131072, provider: 'requesty' }
        ];

        // Separate by tier
        const liteModels = finalFlatList.filter((m: any) => LITE_MODELS.includes(m.id) || m.id.includes('nano') || m.id.includes('mini') || m.id.includes('20b') || m.id.includes('26b'));
        const proModels = finalFlatList.filter((m: any) => PRO_MODELS.includes(m.id) || m.id.includes('coder') || m.id.includes('120b') || m.id.includes('70b'));
        const maxModels = finalFlatList;

        console.log(`[AI Routes] Models: ${all.length} total → Lite: ${liteModels.length}, Pro: ${proModels.length}, Max: ${maxModels.length}`);

        res.json({
            tiers: {
                lite: {
                    id: 'velix-lite',
                    name: 'Velix Lite',
                    description: 'Fast, lightweight & free models for quick tasks',
                    models: [...SPECIALTY_MODELS, ...(liteModels.length > 0 ? liteModels : finalFlatList)]
                },
                pro: {
                    id: 'velix-pro',
                    name: 'Velix Pro',
                    description: 'High-quality free models from OpenRouter & NVIDIA for serious coding',
                    models: [...SPECIALTY_MODELS, ...(proModels.length > 0 ? proModels : finalFlatList)]
                },
                ultra: { // backward compatibility alias for pro
                    id: 'velix-pro',
                    name: 'Velix Pro',
                    description: 'High-quality free models from OpenRouter & NVIDIA for serious coding',
                    models: [...SPECIALTY_MODELS, ...(proModels.length > 0 ? proModels : finalFlatList)]
                },
                max: {
                    id: 'velix-max',
                    name: 'Velix Max',
                    description: 'Best available models — randomly selected from OpenRouter & NVIDIA',
                    models: [...SPECIALTY_MODELS, ...maxModels]
                }
            },
            flat: [...SPECIALTY_MODELS, ...finalFlatList]
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
                lite: { id: 'velix-lite', name: 'Velix Lite', description: 'Fast & free lightweight models', models: fallback },
                pro: { id: 'velix-pro', name: 'Velix Pro', description: 'High-quality free models', models: fallback },
                ultra: { id: 'velix-pro', name: 'Velix Pro', description: 'High-quality free models', models: fallback },
                max: { id: 'velix-max', name: 'Velix Max', description: 'Best available models', models: fallback }
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
