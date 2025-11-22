import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

// Initialize AI. Ensure process.env.API_KEY is set in your environment or passed securely.
// In this demo environment, we rely on the user having the key in env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDescription = async (title: string, category: Category, location: string): Promise<string> => {
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
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Nuk mund të gjenerohej përshkrimi. Ju lutem provoni përsëri.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Shërbimi AI nuk është i disponueshëm për momentin.";
  }
};

export const checkSpam = async (text: string): Promise<boolean> => {
  try {
    const prompt = `
      Analyze the following text (in Albanian) for a classified ad. 
      Is it spam, a scam, or inappropriate content? 
      Reply ONLY with "YES" or "NO".
      
      Text: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const cleanResponse = response.text?.trim().toUpperCase();
    return cleanResponse === "YES";
  } catch (error) {
    console.error("Gemini Spam Check Error:", error);
    return false; // Fail open if AI is down, or closed if strict
  }
};