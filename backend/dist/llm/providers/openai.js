"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAIProvider {
    constructor(apiKey) {
        this.openai = new openai_1.default({ apiKey });
    }
    async generateContent(prompt, schema) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant. Output JSON matching this schema: ${JSON.stringify(schema)}`,
                },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
        });
        const content = response.choices[0].message.content || '{}';
        try {
            return JSON.parse(content);
        }
        catch (e) {
            console.error('OpenAI parsing error', e);
            throw e;
        }
    }
    async generateImage(description) {
        try {
            const response = await this.openai.images.generate({
                model: 'dall-e-3',
                prompt: description,
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json',
            });
            const b64 = response.data?.[0]?.b64_json;
            if (!b64)
                return null;
            return `data:image/png;base64,${b64}`;
        }
        catch (e) {
            console.error('OpenAI image generation failed', e);
            return null;
        }
    }
    async chat(context, question) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `Context: ${context}` },
                { role: 'user', content: question },
            ],
        });
        return response.choices[0].message.content || "I'm not sure.";
    }
}
exports.OpenAIProvider = OpenAIProvider;
