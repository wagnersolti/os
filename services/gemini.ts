
import { GoogleGenAI } from "@google/genai";
import { ServiceOrder } from "../types";

export const aiAssistant = {
  async summarizeOS(os: ServiceOrder) {
    // Correctly initialize GoogleGenAI with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise esta Ordem de Serviço e forneça um resumo profissional para o cliente:
        Cliente: ${os.customerName}
        Descrição: ${os.description}
        Itens: ${os.items.map(i => `${i.name} (Qtd: ${i.quantity})`).join(', ')}
        Total: R$ ${os.totalAmount.toFixed(2)}
        Status: ${os.status}`,
        config: {
          systemInstruction: "Você é um assistente técnico especializado em atendimento ao cliente. Responda de forma clara, educada e profissional em português brasileiro."
        }
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Não foi possível gerar o resumo automático no momento.";
    }
  },

  async suggestTechnicalFix(problem: string) {
    // Correctly initialize GoogleGenAI with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Baseado no problema técnico descrito: "${problem}", sugira 3 passos possíveis para o diagnóstico ou solução técnica.`,
        config: {
          systemInstruction: "Você é um consultor técnico experiente. Dê passos objetivos e úteis."
        }
      });
      return response.text;
    } catch (error) {
      return "Sugestão técnica indisponível.";
    }
  }
};
