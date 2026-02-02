"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AnthropicProvider {
    constructor(apiKey) {
        this.anthropic = new sdk_1.default({ apiKey });
    }
    async generateContent(prompt, schema, images) {
        // Anthropic is best with XML or just clear instructions for JSON
        const systemPrompt = `You are a JSON generator. Output only valid JSON. 
    ${schema ? `Ensure it matches this structure: ${JSON.stringify(schema)}` : ''}`;
        const content = [{ type: 'text', text: prompt }];
        if (images) {
            images.forEach((img) => {
                content.push({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: img.mimeType, // Cast for simplicity, supports jpeg/png/gif/webp
                        data: img.data,
                    },
                });
            });
        }
        const message = await this.anthropic.messages.create({
            model: 'claude-3-opus-20240229',
            max_tokens: 4000,
            system: systemPrompt,
            messages: [{ role: 'user', content: content }],
        });
        // Simple extraction of JSON from text block if needed
        const text = message.content[0].type === 'text'
            ? message.content[0].text
            : '';
        // Attempt to extract JSON if wrapped in markdown code blocks
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
            text.match(/{[\s\S]*}/);
        const jsonStr = jsonMatch
            ? jsonMatch[0].replace(/```json|```/g, '')
            : text;
        try {
            return JSON.parse(jsonStr);
        }
        catch (e) {
            console.error('Anthropic parsing error', e);
            throw e;
        }
    }
    async generateImage(description) {
        // Anthropic does not support image generation yet.
        // Returning null or maybe fallback to placeholder?
        console.warn('Anthropic does not support image generation.');
        return null;
    }
    async chat(context, question) {
        const message = await this.anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            system: `Context: ${context}`,
            messages: [{ role: 'user', content: question }],
        });
        return message.content[0].type === 'text'
            ? message.content[0].text
            : '';
    }
}
exports.AnthropicProvider = AnthropicProvider;
