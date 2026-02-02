"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = void 0;
const hono_1 = require("hono");
const genai_1 = require("@google/genai");
const constants_1 = require("../../constants");
const factory_1 = require("../../llm/factory");
const aiRoutes = new hono_1.Hono();
exports.aiRoutes = aiRoutes;
// Routes are mounted at /api, so inside here they are /suggest-answers etc.
console.log('Mounting AI Routes');
aiRoutes.post('/suggest-answers', async (c) => {
    const { question, context } = await c.req.json();
    const provider = (0, factory_1.getLLMProvider)();
    const prompt = `Context so far: ${context}\nQuestion: ${question}\n${constants_1.SYSTEM_PROMPTS.SUGGESTION_GENERATOR}`;
    try {
        const schema = {
            type: genai_1.Type.ARRAY,
            items: { type: genai_1.Type.STRING },
        };
        const result = await provider.generateContent(prompt, schema);
        return c.json(result);
    }
    catch (e) {
        console.error(e);
        return c.json(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
    }
});
aiRoutes.post('/analyze-record', async (c) => {
    const { profile, career, fileData, mimeType } = await c.req.json();
    const provider = (0, factory_1.getLLMProvider)();
    const prompt = `User Profile: ${JSON.stringify(profile)}\nTarget Career: ${career.title}\n${constants_1.SYSTEM_PROMPTS.ACADEMIC_ANALYZER}`;
    const cleanBase64 = fileData.includes(',')
        ? fileData.split(',')[1]
        : fileData;
    try {
        const result = await provider.generateContent(prompt, null, [
            { data: cleanBase64, mimeType: mimeType },
        ]);
        return c.json(result);
    }
    catch (e) {
        console.error(e);
        return c.json(null);
    }
});
aiRoutes.post('/generate-careers', async (c) => {
    const { profile } = await c.req.json();
    const provider = (0, factory_1.getLLMProvider)();
    const prompt = `User Profile: ${JSON.stringify(profile)}. ${constants_1.SYSTEM_PROMPTS.CAREER_GENERATOR}`;
    const schema = {
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
    try {
        const result = await provider.generateContent(prompt, schema);
        return c.json(result);
    }
    catch (e) {
        console.error(e);
        return c.json([]);
    }
});
aiRoutes.post('/life-story', async (c) => {
    const { profile, career } = await c.req.json();
    const provider = (0, factory_1.getLLMProvider)();
    const prompt = `User Profile: ${JSON.stringify(profile)}. Career: ${career.title}. ${constants_1.SYSTEM_PROMPTS.LIFE_PREVIEW_STRUCTURE}`;
    const schema = {
        type: genai_1.Type.ARRAY,
        items: {
            type: genai_1.Type.OBJECT,
            properties: {
                title: { type: genai_1.Type.STRING },
                text: { type: genai_1.Type.STRING },
                imagePrompt: { type: genai_1.Type.STRING },
            },
            required: ['title', 'text', 'imagePrompt'],
        },
    };
    try {
        const result = await provider.generateContent(prompt, schema);
        return c.json(result);
    }
    catch (e) {
        console.error(e);
        return c.json([]);
    }
});
aiRoutes.post('/generate-image', async (c) => {
    const { description } = await c.req.json();
    const provider = (0, factory_1.getLLMProvider)();
    const prompt = `${constants_1.SYSTEM_PROMPTS.IMAGE_STYLE} ${description}`;
    try {
        const imageUrl = await provider.generateImage(prompt);
        return c.json({ imageUrl });
    }
    catch (e) {
        console.error(e);
        return c.json({ imageUrl: null });
    }
});
aiRoutes.post('/chat', async (c) => {
    const { profile, context, question } = await c.req.json();
    const provider = (0, factory_1.getLLMProvider)();
    try {
        const answer = await provider.chat(`User Profile: ${JSON.stringify(profile)}\nActive Focus: ${context}`, question);
        return c.json({ text: answer });
    }
    catch (e) {
        console.error(e);
        return c.json({ text: "I'm thinking... please try again." });
    }
});
