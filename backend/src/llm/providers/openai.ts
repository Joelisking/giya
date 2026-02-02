import OpenAI from 'openai';
import { LLMProvider } from '../types';

export class OpenAIProvider implements LLMProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Convert a Google @google/genai Type-based schema to JSON Schema
   * so it can be used with OpenAI's structured output.
   */
  private convertSchema(googleSchema: any): any {
    if (!googleSchema) return { type: 'string' };

    const schemaType = String(googleSchema.type).toLowerCase();
    const result: any = { type: schemaType };

    if (schemaType === 'array' && googleSchema.items) {
      result.items = this.convertSchema(googleSchema.items);
    }

    if (schemaType === 'object' && googleSchema.properties) {
      result.properties = {};
      const allKeys: string[] = [];
      for (const [key, value] of Object.entries(googleSchema.properties)) {
        result.properties[key] = this.convertSchema(value as any);
        allKeys.push(key);
      }
      // strict mode requires all properties in required
      result.required = googleSchema.required || allKeys;
      result.additionalProperties = false;
    }

    return result;
  }

  async generateContent<T = any>(
    prompt: string,
    schema?: any
  ): Promise<T> {
    const params: any = {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    };

    if (schema) {
      // Use OpenAI structured output — wrap in a "result" key since
      // json_schema mode requires a top-level object, not a bare array.
      const converted = this.convertSchema(schema);
      params.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              result: converted,
            },
            required: ['result'],
            additionalProperties: false,
          },
        },
      };
    } else {
      params.response_format = { type: 'json_object' };
    }

    const response = await this.openai.chat.completions.create(params);
    const content = response.choices[0].message.content || '{}';

    try {
      const parsed = JSON.parse(content);
      // If we wrapped in a "result" key, unwrap it
      return schema ? parsed.result : parsed;
    } catch (e) {
      console.error('OpenAI parsing error', e);
      throw e;
    }
  }

  async generateImage(description: string): Promise<string | null> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: description,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      });
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) return null;
      return `data:image/png;base64,${b64}`;
    } catch (e) {
      console.error('OpenAI image generation failed', e);
      return null;
    }
  }

  async chat(context: string, question: string): Promise<string> {
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
