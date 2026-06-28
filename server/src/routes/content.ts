import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createProductAndContent } from '../services/contentGenerator.js';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const generateSchema = z.object({
  name: z.string().min(2, 'Nome do produto é obrigatório'),
  link: z.string().url('Link inválido').or(z.literal('')).optional(),
  costPrice: z.number().nonnegative().optional(),
  marketplaceFee: z.number().nonnegative().optional(),
  desiredMargin: z.number().nonnegative().optional(),
});

// POST /api/generate
router.post('/generate', async (req: Request, res: Response) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
    return;
  }

  const { name, link, costPrice, marketplaceFee, desiredMargin } = parsed.data;

  try {
    const result = await createProductAndContent(
      name, 
      link || undefined,
      costPrice,
      marketplaceFee,
      desiredMargin
    );
    res.status(201).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro na rota /generate:', message);
    res.status(500).json({ error: message });
  }
});

// GET /api/contents
router.get('/contents', async (_req: Request, res: Response) => {
  try {
    const contents = await prisma.product.findMany({
      include: { contents: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contents);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar dados';
    console.error('❌ Erro na rota /contents:', message);
    res.status(500).json({ error: message });
  }
});

// DELETE /api/contents/:id
router.delete('/contents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Conteúdo removido com sucesso' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao deletar registro';
    console.error('❌ Erro na rota /contents/:id DELETE:', message);
    res.status(500).json({ error: message });
  }
});

export default router;