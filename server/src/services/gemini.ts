import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();


const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("ERRO: A variável GEMINI_API_KEY não foi encontrada no arquivo .env");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export interface GeneratedContentResponse {
  title: string;
  descriptionML: string;
  descriptionShopee: string;
  keywords: string[];
  instagramPost: string;
  instagramHashtags: string;
}

export async function generateEcommerceContent(productName: string, productLink?: string): Promise<GeneratedContentResponse> {
  const prompt = `
    Você é um especialista em SEO e Copywriting para E-commerce.
    Gere conteúdo de alta conversão para o produto: "${productName}" ${productLink ? `disponível no link: ${productLink}` : ''}.
    
    Siga estritamente as regras de retorno:
    - title: Título Otimizado, focado em SEO, 60-80 caracteres.
    - descriptionML: Descrição Mercado Livre detalhada, com tópicos e benefícios.
    - descriptionShopee: Descrição Shopee persuasiva e direta.
    - keywords: Array de strings contendo 10 palavras-chave de busca.
    - instagramPost: Texto para postagem de engajamento.
    - instagramHashtags: String com hashtags relevantes separadas por espaço.
  `;

  try {
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            descriptionML: { type: Type.STRING },
            descriptionShopee: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            instagramPost: { type: Type.STRING },
            instagramHashtags: { type: Type.STRING },
          },
          required: ['title', 'descriptionML', 'descriptionShopee', 'keywords', 'instagramPost', 'instagramHashtags'],
        },
      },
    });

    if (!response.text) {
      throw new Error('O modelo respondeu com um corpo de texto vazio.');
    }

    return JSON.parse(response.text) as GeneratedContentResponse;
  } catch (error: any) {
    console.error("Erro detalhado na chamada da API do Gemini:", error);
    throw new Error(`Falha na API do Gemini: ${error.message || error}`);
  }
}