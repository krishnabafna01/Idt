
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export class GeminiService {
  private ai: any;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing. Please set it in your environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || "" });
  }

  async *streamDoubtSolution(history: Message[], currentMessage: string, imageBase64?: string) {
    if (!process.env.API_KEY) {
      yield "Error: API Key is missing. Please configure it in your Vercel project settings.";
      return;
    }

    try {
      const model = 'gemini-3-flash-preview';
      
      const contents: any[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const currentParts: any[] = [{ text: currentMessage || "Please explain this IDT concept from the image." }];
      
      if (imageBase64) {
        const [header, data] = imageBase64.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        currentParts.push({
          inlineData: {
            mimeType,
            data
          }
        });
      }

      contents.push({
        role: 'user',
        parts: currentParts
      });

      const result = await this.ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      for await (const chunk of result) {
        const response = chunk as GenerateContentResponse;
        yield response.text || "";
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
