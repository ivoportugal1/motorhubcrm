import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5173;

// Servir arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback - redireciona todas as rotas para index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend rodando na porta ${PORT}`);
});
