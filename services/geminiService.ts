import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

// Get API key from Vite environment variables (browser-safe)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Validate API key exists
if (!apiKey) {
  console.error('⚠️ GEMINI API KEY MISSING: Please add VITE_GEMINI_API_KEY to your .env file');
}

// Initialize AI with proper error handling
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateDescription = async (title: string, category: Category, location: string): Promise<string> => {
  // Check if AI is initialized
  if (!ai) {
    return "AI service is not configured. Please add your Gemini API key to the .env file.";
  }

  try {
    const prompt = `
      Ti je një asistent i zgjuar për një faqe shitblerjesh online shqiptare.
      Shkruaj një përshkrim tërheqës, të qartë dhe profesional në gjuhën Shqipe për një njoftim me këto të dhëna:
      Titulli: ${title}
      Kategoria: ${category}
      Vendndodhja: ${location}

      Përshkrimi duhet të jetë rreth 3-4 fjali, të tingëllojë natyral dhe të nxisë blerësit të kontaktojnë. Mos shto tituj, vetëm tekstin e përshkrimit.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    return response.text || "Nuk mund të gjenerohej përshkrimi. Ju lutem provoni përsëri.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Provide helpful error messages
    if (error?.message?.includes('API key')) {
      return "Invalid API key. Please check your Gemini API key in .env file.";
    }
    if (error?.message?.includes('quota')) {
      return "AI service quota exceeded. Please try again later.";
    }
    
    return "Shërbimi AI nuk është i disponueshëm për momentin. Ju lutem shkruani përshkrimin manualisht.";
  }
};

export const checkSpam = async (text: string): Promise<boolean> => {
  // Check if AI is initialized
  if (!ai) {
    console.warn('⚠️ Spam detection skipped: Gemini API not configured');
    return false; // Fail open - don't block users if AI is down
  }

  try {
    const prompt = `
      Analyze the following text (in Albanian) for a classified ad. 
      Is it spam, a scam, or inappropriate content? 
      Reply ONLY with "YES" or "NO".
      
      Text: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    const cleanResponse = response.text?.trim().toUpperCase();
    return cleanResponse === "YES";
  } catch (error) {
    console.error("Gemini Spam Check Error:", error);
    return false; // Fail open - don't block legitimate users if AI fails
  }
};
