import { GoogleGenerativeAI } from '@google/generative-ai';

// Check if API key is available
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let model: any = null;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export { model };

export async function generateContent(prompt: string): Promise<string> {
  try {
    if (!model || !apiKey) {
      console.warn('Gemini API key not configured, using fallback content');
      throw new Error('Gemini API not available');
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}