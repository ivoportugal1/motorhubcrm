require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/ordens',   require('./routes/ordens'));
app.use('/api/clientes',    require('./routes/clientes'));
app.use('/api/veiculos',    require('./routes/veiculos'));
app.use('/api/pecas',       require('./routes/pecas'));
app.use('/api/financeiro',    require('./routes/financeiro'));
app.use('/api/caixa',         require('./routes/caixa'));
app.use('/api/transferencias',require('./routes/transferencias'));
app.use('/api/manutencoes',   require('./routes/manutencoes'));
app.use('/api/relatorios',       require('./routes/relatorios'));
app.use('/api/oficina',          require('./routes/oficinas'));
app.use('/api/alertas',          require('./routes/alertas'));
app.use('/api/usuarios',         require('./routes/usuarios'));
app.use('/api/modelos-servicos', require('./routes/modelosServicos'));
app.use('/api/clientes',         require('./routes/clienteDetalhes'));
app.use('/api/documentos',       require('./routes/documentos'));
app.use('/api/integracao',       require('./routes/integracao'));
app.use('/api/unidades',         require('./routes/unidades'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MotorHub API rodando na porta ${PORT}`));
