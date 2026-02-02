"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const hono_1 = require("hono");
const user_service_1 = require("./user.service");
const factory_1 = require("../../llm/factory");
const constants_1 = require("../../constants");
const genai_1 = require("@google/genai");
const userRoutes = new hono_1.Hono();
exports.userRoutes = userRoutes;
// Shared Schema Definition
const CAREER_SCHEMA = {
    type: genai_1.Type.ARRAY,
    items: {
        type: genai_1.Type.OBJECT,
        properties: {
            id: { type: genai_1.Type.STRING },
            title: { type: genai_1.Type.STRING },
            reason: { type: genai_1.Type.STRING },
            confidence: { type: genai_1.Type.NUMBER },
            lifestyle: { type: genai_1.Type.STRING },
            timeline: {
                type: genai_1.Type.ARRAY,
                items: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        id: { type: genai_1.Type.STRING },
                        age: { type: genai_1.Type.NUMBER },
                        label: { type: genai_1.Type.STRING },
                        description: { type: genai_1.Type.STRING },
                        type: { type: genai_1.Type.STRING },
                    },
                    required: ['id', 'age', 'label', 'description', 'type'],
                },
            },
            outlook: {
                type: genai_1.Type.OBJECT,
                properties: {
                    entrySalary: { type: genai_1.Type.STRING },
                    midSalary: { type: genai_1.Type.STRING },
                    seniorSalary: { type: genai_1.Type.STRING },
                    demand: { type: genai_1.Type.STRING },
                    stability: { type: genai_1.Type.NUMBER },
                    growth: { type: genai_1.Type.NUMBER },
                },
                required: [
                    'entrySalary',
                    'midSalary',
                    'seniorSalary',
                    'demand',
                    'stability',
                    'growth',
                ],
            },
            resources: {
                type: genai_1.Type.ARRAY,
                items: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        id: { type: genai_1.Type.STRING },
                        title: { type: genai_1.Type.STRING },
                        type: { type: genai_1.Type.STRING },
                        difficulty: { type: genai_1.Type.STRING },
                        timeCommitment: { type: genai_1.Type.STRING },
                        whyItMatters: { type: genai_1.Type.STRING },
                    },
                    required: [
                        'id',
                        'title',
                        'type',
                        'difficulty',
                        'timeCommitment',
                        'whyItMatters',
                    ],
                },
            },
        },
        required: [
            'id',
            'title',
            'reason',
            'confidence',
            'lifestyle',
            'timeline',
            'outlook',
            'resources',
        ],
    },
};
userRoutes.get('/me', async (c) => {
    const payload = c.get('jwtPayload');
    if (!payload)
        return c.json({ error: 'Unauthorized' }, 401);
    const profile = await user_service_1.UserService.getProfile(payload.id);
    return c.json(profile || null);
});
userRoutes.post('/profile', async (c) => {
    const payload = c.get('jwtPayload');
    if (!payload)
        return c.json({ error: 'Unauthorized' }, 401);
    const { data } = await c.req.json();
    const result = await user_service_1.UserService.upsertProfile(payload.id, data);
    return c.json(result);
});
async function processCareerGeneration(userId, profileData) {
    try {
        console.log(`[Async] Starting career generation for ${userId}`);
        await user_service_1.UserService.updateGenerationStatus(userId, 'generating');
        const provider = (0, factory_1.getLLMProvider)();
        const prompt = `User Profile: ${JSON.stringify(profileData)}. ${constants_1.SYSTEM_PROMPTS.CAREER_GENERATOR}`;
        const rawResult = await provider.generateContent(prompt, CAREER_SCHEMA);
        console.log('[Async] Raw LLM Result:', JSON.stringify(rawResult, null, 2));
        // Normalize/Extract
        let careers = [];
        if (rawResult &&
            rawResult.careerPaths &&
            Array.isArray(rawResult.careerPaths)) {
            careers = rawResult.careerPaths;
        }
        else if (Array.isArray(rawResult)) {
            careers = rawResult;
        }
        // Inject IDs if missing (Backend side)
        const finalizedCareers = careers.map((c, i) => ({
            ...c,
            id: c.id || `career-${Date.now()}-${i}`,
        }));
        if (finalizedCareers.length > 0) {
            await user_service_1.UserService.updateCareers(userId, finalizedCareers);
            console.log(`[Async] Generation completed for ${userId}`);
        }
        else {
            await user_service_1.UserService.updateGenerationStatus(userId, 'failed');
            console.error(`[Async] Generation produced no results for ${userId}`);
        }
    }
    catch (e) {
        console.error(`[Async] Generation failed for ${userId}`, e);
        await user_service_1.UserService.updateGenerationStatus(userId, 'failed');
    }
}
userRoutes.get('/dashboard', async (c) => {
    const payload = c.get('jwtPayload');
    if (!payload)
        return c.json({ error: 'Unauthorized' }, 401);
    const record = await user_service_1.UserService.getProfile(payload.id);
    if (!record) {
        return c.json({ status: 'needs_onboarding' });
    }
    // Check Status
    if (record.generationStatus === 'generating') {
        return c.json({ status: 'generating' });
    }
    // If careers exist and status is completed (or legacy idle with data), return them
    if (record.careers &&
        Array.isArray(record.careers) &&
        record.careers.length > 0) {
        return c.json({
            status: 'success',
            data: {
                profile: record.data,
                careers: record.careers,
            },
        });
    }
    // If failed, return error state (frontend allows retry)
    if (record.generationStatus === 'failed') {
        return c.json({ status: 'error', error: 'Generation failed' });
    }
    // If idle/missing, TRIGGER ASYNC GENERATION
    console.log('Triggering async generation...');
    // Update status immediately then fire background task
    await user_service_1.UserService.updateGenerationStatus(payload.id, 'generating');
    // Fire and forget (Node process continues)
    processCareerGeneration(payload.id, record.data);
    return c.json({ status: 'generating' });
});
userRoutes.post('/regenerate-careers', async (c) => {
    const payload = c.get('jwtPayload');
    if (!payload)
        return c.json({ error: 'Unauthorized' }, 401);
    const record = await user_service_1.UserService.getProfile(payload.id);
    if (!record)
        return c.json({ error: 'No profile found' }, 404);
    // Trigger Async
    await user_service_1.UserService.updateGenerationStatus(payload.id, 'generating');
    processCareerGeneration(payload.id, record.data);
    return c.json({ status: 'generating' });
});
