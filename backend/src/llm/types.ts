export interface LLMProvider {
  /**
   * Generates structured content based on a prompt and optional schema.
   * Supports optional image attachments (base64 data).
   */
  generateContent<T = any>(
    prompt: string,
    schema?: any,
    images?: { data: string; mimeType: string }[]
  ): Promise<T>;

  /**
   * Generates an image based on a description.
   * Returns a base64 data URL string or null if generation fails.
   */
  generateImage(description: string): Promise<string | null>;

  /**
   * Chat completion for conversational interactions.
   */
  chat(context: string, question: string): Promise<string>;
}
