import { GoogleGenAI, Type } from '@google/genai';

export interface GeneratedContentResponse {
  title: string;
  descriptionML: string;
  descriptionShopee: string;
  keywords: string[];
  instagramPost: string;
  instagramHashtags: string;
  scarcityHook: string;      // Novo campo: Gatilho de escassez/urgência
  couponSuggestion: string;  // Novo campo: Cupom sugerido de acordo com o nicho
}

export async function generateEcommerceContent(
  productName: string,
  productLink?: string
): Promise<GeneratedContentResponse> {

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não encontrada. Verifique o arquivo .env na raiz do projeto.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Você é um especialista em SEO, Copywriting e Estratégia de Vendas para E-commerce.
    Gere conteúdo de alta conversão para o produto: "${productName}"${productLink ? ` disponível no link: ${productLink}` : ''}.

    Siga estritamente as regras de retorno:
    - title: Título Otimizado, focado em SEO, 60-80 caracteres.
    - descriptionML: Descrição Mercado Livre detalhada, com tópicos e benefícios.
    - descriptionShopee: Descrição Shopee persuasiva e direta.
    - keywords: Array de strings contendo 10 palavras-chave de busca.
    - instagramPost: Texto para postagem de engajamento.
    - instagramHashtags: String com hashtags relevantes separadas por espaço.
    - scarcityHook: Uma frase curta e matadora de gatilho de escassez ou urgência para usar em Stories ou respostas a clientes.
    - couponSuggestion: Uma sugestão de nome criativo de cupom de desconto baseado no produto (ex: FONE10, PROMOOUTLET).
  `;

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
            items: { type: Type.STRING },
          },
          instagramPost: { type: Type.STRING },
          instagramHashtags: { type: Type.STRING },
          scarcityHook: { type: Type.STRING },
          couponSuggestion: { type: Type.STRING },
        },
        required: [
          'title',
          'descriptionML',
          'descriptionShopee',
          'keywords',
          'instagramPost',
          'instagramHashtags',
          'scarcityHook',
          'couponSuggestion'
        ],
      },
    },
  });

  const rawText = response.text;

  if (!rawText) {
    throw new Error('O Gemini retornou uma resposta vazia.');
  }

  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned) as GeneratedContentResponse;
}