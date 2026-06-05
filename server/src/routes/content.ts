import { Router } from 'express';

import { PrismaClient } from '@prisma/client';

import { createProductAndContent } from '../services/contentGenerator.js';

import { z } from 'zod';





const router = Router();

const prisma = new PrismaClient();



const generateSchema = z.object({

  name: z.string().min(2, "Nome do produto é obrigatório"),

  link: z.string().url("Link inválido").or(z.literal('')).optional(),

});



router.post('/generate', async (req, res) => {

  try {

    const { name, link } = generateSchema.parse(req.body);

    const result = await createProductAndContent(name, link || undefined);

    res.status(201).json(result);

  } catch (error: any) {

    res.status(400).json({ error: error.message || 'Erro ao processar requisição' });

  }

});



router.get('/contents', async (req, res) => {

  const contents = await prisma.product.findMany({

    include: { contents: true },

    orderBy: { createdAt: 'desc' }

  });

  res.json(contents);

});



router.delete('/contents/:id', async (req, res) => {

  try {

    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Conteúdo removido com sucesso' });

  } catch (error) {

    res.status(500).json({ error: 'Erro ao deletar registro' });

  }

});



export default router;