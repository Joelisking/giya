import { GoogleGenAI, Type } from '@google/genai';
import { LLMProvider } from '../types';

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenAI;
  private model = 'gemini-3-pro-preview';
  private fastModel = 'gemini-3-flash-preview';
  private imageModel = 'gemini-2.5-flash-image';

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateContent<T = any>(
    prompt: string,
    schema?: any,
    images?: { data: string; mimeType: string }[]
  ): Promise<T> {
    const config: any = {
      responseMimeType: 'application/json',
    };

    if (schema) {
      config.responseSchema = schema;
    }

    const contents: any[] = [{ text: prompt }];
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
    } catch (e) {
      console.error('Gemini content generation failed', e);
      throw e;
    }
  }

  async generateImage(description: string): Promise<string | null> {
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

  async chat(context: string, question: string): Promise<string> {
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
