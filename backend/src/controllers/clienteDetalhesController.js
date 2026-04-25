const db = require('../database/db');

exports.getCliente = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;

  try {
    const cliente = await db.get(
      `SELECT * FROM clientes WHERE id = ? AND oficina_id = ?`,
      [id, oficina_id]
    );

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar cliente' });
  }
};

exports.getHistorico = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;

  try {
    const historico = [];

    // Ordens do cliente
    const ordens = await db.all(
      `SELECT id, numero, status, valor_total as valor, data_abertura as data
       FROM ordens WHERE cliente_id = ? AND oficina_id = ? ORDER BY data_abertura DESC`,
      [id, oficina_id]
    );

    ordens.forEach(o => {
      historico.push({
        tipo: 'ordem',
        titulo: `Ordem de Serviço #${o.numero}`,
        descricao: `Status: ${o.status}`,
        data: o.data,
        valor: o.valor,
      });
    });

    // Pagamentos do cliente
    const pagamentos = await db.all(
      `SELECT l.id, l.valor, l.data_pagamento as data, o.numero
       FROM lancamentos l
       LEFT JOIN ordens o ON l.ordem_id = o.id
       WHERE o.cliente_id = ? AND l.oficina_id = ? AND l.data_pagamento IS NOT NULL
       ORDER BY l.data_pagamento DESC`,
      [id, oficina_id]
    );

    pagamentos.forEach(p => {
      historico.push({
        tipo: 'pagamento',
        titulo: 'Pagamento Recebido',
        descricao: p.numero ? `OS #${p.numero}` : 'Pagamento',
        data: p.data,
        valor: p.valor,
      });
    });

    // Ordena por data decrescente
    historico.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json(historico);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar histórico' });
  }
};
