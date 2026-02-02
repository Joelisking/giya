"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const genai_1 = require("@google/genai");
class GeminiProvider {
    constructor(apiKey) {
        this.model = 'gemini-1.5-flash';
        this.fastModel = 'gemini-3-flash-preview';
        this.imageModel = 'gemini-2.5-flash-image';
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    async generateContent(prompt, schema, images) {
        const config = {
            responseMimeType: 'application/json',
        };
        if (schema) {
            config.responseSchema = schema;
        }
        const contents = [{ text: prompt }];
        if (images) {
            images.forEach((img) => {
                contents.push({
                    inlineData: {
                        data: img.data,
                        mimeType: img.mimeType,
                    },
                });
            });
        }
        const response = await this.ai.models.generateContent({
            model: this.model,
            contents: { parts: contents }, // Correct structure for mixed content
            config,
        });
        try {
            return JSON.parse(response.text || '{}');
        }
        catch (e) {
            console.error('Gemini content generation failed', e);
            throw e;
        }
    }
    async generateImage(description) {
        const response = await this.ai.models.generateContent({
            model: this.imageModel,
            contents: {
                parts: [{ text: description }],
            },
            config: {
                imageConfig: {
                    aspectRatio: '16:9',
                },
            },
        });
        for (const part of response.candidates?.[0]?.content?.parts ||
            []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    }
    async chat(context, question) {
        const response = await this.ai.models.generateContent({
            model: this.fastModel,
            contents: `Context: ${context}\nQuestion: ${question}\nAnswer as a helpful assistant.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        return response.text || "I'm not sure how to answer that.";
    }
}
exports.GeminiProvider = GeminiProvider;
