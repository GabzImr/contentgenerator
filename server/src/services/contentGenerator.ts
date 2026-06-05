import { PrismaClient } from '@prisma/client';
import { generateEcommerceContent } from './gemini.js';

const prisma = new PrismaClient();

export async function createProductAndContent(name: string, link?: string) {
  
  const aiData = await generateEcommerceContent(name, link);

  
  const result = await prisma.product.create({
    data: {
      name,
      link,
      contents: {
        create: {
          title: aiData.title,
          descriptionML: aiData.descriptionML,
          descriptionShopee: aiData.descriptionShopee,
          keywords: JSON.stringify(aiData.keywords),
          instagramPost: aiData.instagramPost,
          instagramHashtags: aiData.instagramHashtags,
        }
      }
    },
    include: {
      contents: true
    }
  });

  return result;
} 