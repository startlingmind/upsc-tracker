
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async getMotivationalQuote(day: number, tasks: string[]) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am a UPSC (Civil Services) aspirant on Day ${day} of a rigorous 75-day challenge. 
        My focus areas today are: ${tasks.join(', ')}. 
        Provide a powerful, prestigious, and deeply motivational quote or a short inspiring paragraph (2-3 sentences) specifically for a future administrator. 
        Focus on discipline, the weight of responsibility, and the glory of the long haul. 
        Do not use generic cliches; make it sound like advice from a senior cabinet secretary or a legendary IAS officer.`,
        config: {
          temperature: 0.8,
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "The distance between a dream and reality is called discipline. Your seat in the academy is waiting.";
    }
  },

  async explainTopic(topic: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Explain the UPSC relevance and core concepts of "${topic}" in bullet points for a quick revision.`,
      });
      return response.text;
    } catch (error) {
      return "Topic explanation currently unavailable.";
    }
  }
};
