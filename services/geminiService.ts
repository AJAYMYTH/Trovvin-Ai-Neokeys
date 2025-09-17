import { GoogleGenAI, Chat } from "@google/genai";
import { Tone, Message } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are Myth AI, a helpful and friendly writing assistant. Your goal is to help users improve their writing, answer questions, and brainstorm ideas. Keep your responses concise and clear.',
      },
    });
  }
  return chatInstance;
};


export const correctText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Please correct the grammar and spelling in the following text. Only return the corrected text, without any explanation, preamble, or markdown formatting. Text: "${text}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Error in correctText:", error);
    throw new Error("The AI service failed to correct the text. Please check your connection and try again.");
  }
};

export const enhanceText = async (text: string, tone: Tone): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite the following text to have a more ${tone.toLowerCase()} tone. Only return the rewritten text, without any explanation, preamble, or markdown formatting. Text: "${text}"`,
    });
    return response.text;
  } catch (error) {
    console.error("Error in enhanceText:", error);
    throw new Error(`The AI service failed to enhance the text. Please check your connection and try again.`);
  }
};

export const getChatStream = async (history: Message[], newMessage: string) => {
    try {
        const chat = getChatInstance();
        // The Gemini SDK for JS doesn't have a direct way to load history into a new stream.
        // We simulate it by creating a new chat session if needed or continue with the existing one.
        // For a stateless approach with history, you could pass the history with each generateContentStream call.
        // Let's use sendMessageStream which maintains history within the chat instance.
        
        // This is a simplified approach. A real app might need more complex history management.
        // If the current chat history in the service doesn't match the UI, it should be re-initialized.
        // For this app, we will use a single persistent chat session.
        const result = await chat.sendMessageStream({ message: newMessage });
        return result;
    } catch (error) {
        console.error("Error in getChatStream:", error);
        throw new Error("The AI chat service is unavailable. Please try again in a moment.");
    }
};