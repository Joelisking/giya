import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider } from '../types';

export class AnthropicProvider implements LLMProvider {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateContent<T = any>(
    prompt: string,
    schema?: any,
    images?: { data: string; mimeType: string }[]
  ): Promise<T> {
    // Anthropic is best with XML or just clear instructions for JSON
    const systemPrompt = `You are a JSON generator. Output only valid JSON. 
    ${schema ? `Ensure it matches this structure: ${JSON.stringify(schema)}` : ''}`;

    const content: any[] = [{ type: 'text', text: prompt }];

    if (images) {
      images.forEach((img) => {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mimeType as any, // Cast for simplicity, supports jpeg/png/gif/webp
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
    const text =
      message.content[0].type === 'text'
        ? message.content[0].text
        : '';

    // Attempt to extract JSON if wrapped in markdown code blocks
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) ||
      text.match(/{[\s\S]*}/);
    const jsonStr = jsonMatch
      ? jsonMatch[0].replace(/```json|```/g, '')
      : text;

    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Anthropic parsing error', e);
      throw e;
    }
  }

  async generateImage(description: string): Promise<string | null> {
    // Anthropic does not support image generation yet.
    // Returning null or maybe fallback to placeholder?
    console.warn('Anthropic does not support image generation.');
    return null;
  }

  async chat(context: string, question: string): Promise<string> {
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
