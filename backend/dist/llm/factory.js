"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLMProvider = void 0;
const gemini_1 = require("./providers/gemini");
const openai_1 = require("./providers/openai");
const anthropic_1 = require("./providers/anthropic");
let providerInstance = null;
const getLLMProvider = () => {
    if (providerInstance) {
        return providerInstance;
    }
    // Priority: OpenAI > Anthropic > Gemini
    if (process.env.OPENAI_API_KEY) {
        console.log('Using OpenAI Provider');
        providerInstance = new openai_1.OpenAIProvider(process.env.OPENAI_API_KEY);
    }
    else if (process.env.ANTHROPIC_API_KEY) {
        console.log('Using Anthropic Provider');
        providerInstance = new anthropic_1.AnthropicProvider(process.env.ANTHROPIC_API_KEY);
    }
    else if (process.env.GEMINI_API_KEY) {
        console.log('Using Gemini Provider');
        providerInstance = new gemini_1.GeminiProvider(process.env.GEMINI_API_KEY);
    }
    else {
        throw new Error('No valid AI API Key found (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY)');
    }
    return providerInstance;
};
exports.getLLMProvider = getLLMProvider;
