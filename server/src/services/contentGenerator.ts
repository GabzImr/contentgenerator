import { PrismaClient } from '@prisma/client';
import { generateEcommerceContent } from './gemini.js';

const prisma = new PrismaClient();

// Função utilitária para calcular o score de SEO do título (0 - 100)
function calculateTitleScore(title: string): number {
  let score = 100;
  const len = title.length;

  // Penaliza se estiver fora do range ideal de 60-80 caracteres
  if (len < 60) {
    score -= (60 - len) * 2;
  } else if (len > 80) {
    score -= (len - 80) * 2;
  }

  // Garante que o score não fique negativo
  return Math.max(0, Math.min(100, score));
}

export async function createProductAndContent(
  name: string, 
  link?: string,
  costPrice = 0,
  marketplaceFee = 0,
  desiredMargin = 0
) {
  // 1. Chama o Gemini para criar a copy
  const aiData = await generateEcommerceContent(name, link);

  // 2. Calcula o Preço Sugerido (Fórmula de Markup por dentro)
  // Preço = Custo / (1 - (Taxa% + Margem%) / 100)
  const totalDeductions = (marketplaceFee + desiredMargin) / 100;
  const suggestedPrice = totalDeductions < 1 
    ? costPrice / (1 - totalDeductions) 
    : costPrice * (1 + (marketplaceFee + desiredMargin) / 100);

  // 3. Calcula o Score do Título gerado pela IA
  const titleScore = calculateTitleScore(aiData.title);

  // 4. Salva tudo unificado no banco de dados
  const result = await prisma.product.create({
    data: {
      name,
      link,
      costPrice,
      marketplaceFee,
      desiredMargin,
      suggestedPrice,
      contents: {
        create: {
          title: aiData.title,
          titleScore,
          descriptionML: aiData.descriptionML,
          descriptionShopee: aiData.descriptionShopee,
          keywords: JSON.stringify(aiData.keywords),
          instagramPost: aiData.instagramPost,
          instagramHashtags: aiData.instagramHashtags,
        },
      },
    },
    include: {
      contents: true,
    },
  });

  return result;
}