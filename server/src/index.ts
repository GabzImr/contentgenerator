// ✅ dotenv PRIMEIRO, antes de qualquer outro import
// Assim o GEMINI_API_KEY já está disponível quando o gemini.ts for carregado
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Sobe dois níveis: src/ → server/ → raiz do projeto (onde fica o .env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import contentRouter from './routes/content.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use('/api', contentRouter);

app.listen(PORT, () => {
  const chaveCofigurada = process.env.GEMINI_API_KEY ? '✅ SIM' : '❌ NÃO — verifique o .env!';
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔑 GEMINI_API_KEY carregada: ${chaveCofigurada}`);
});
