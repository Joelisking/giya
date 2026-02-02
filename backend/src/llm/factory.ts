import { LLMProvider } from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';

let providerInstance: LLMProvider | null = null;

export const getLLMProvider = (): LLMProvider => {
  if (providerInstance) {
    return providerInstance;
  }

  // Priority: OpenAI > Anthropic > Gemini
  if (process.env.OPENAI_API_KEY) {
    console.log('Using OpenAI Provider');
    providerInstance = new OpenAIProvider(process.env.OPENAI_API_KEY);
  } else if (process.env.ANTHROPIC_API_KEY) {
    console.log('Using Anthropic Provider');
    providerInstance = new AnthropicProvider(
      process.env.ANTHROPIC_API_KEY
    );
  } else if (process.env.GEMINI_API_KEY) {
    console.log('Using Gemini Provider');
    providerInstance = new GeminiProvider(process.env.GEMINI_API_KEY);
  } else {
    throw new Error(
      'No valid AI API Key found (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY)'
    );
  }

  return providerInstance;
};
