const db = require('../database/db');

exports.listar = async (req, res) => {
  try {
    const { tipo, status, busca, data_inicio, data_fim } = req.query;
    const { oficina_id } = req.user;

    let sql = 'SELECT * FROM lancamentos WHERE oficina_id = ?';
    const params = [oficina_id];

    if (tipo)   { sql += ' AND tipo = ?'; params.push(tipo); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (busca)  { sql += ' AND (descricao LIKE ? OR categoria LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`); }
    if (data_inicio) { sql += ' AND date(data_vencimento) >= ?'; params.push(data_inicio); }
    if (data_fim)    { sql += ' AND date(data_vencimento) <= ?'; params.push(data_fim); }

    sql += ' ORDER BY data_vencimento DESC';

    const lancamentos = await db.all(sql, params);
    res.json(lancamentos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.criar = async (req, res) => {
  try {
    const { tipo, descricao, categoria, valor, data_vencimento, status, ordem_id } = req.body;
    if (!descricao || !valor) return res.status(422).json({ error: 'Descrição e valor são obrigatórios' });

    const r = await db.run(
      'INSERT INTO lancamentos (oficina_id, tipo, descricao, categoria, valor, data_vencimento, status, ordem_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.oficina_id, tipo || 'receita', descricao, categoria || '', valor, data_vencimento || null, status || 'pendente', ordem_id || null]
    );
    const lancamento = await db.get('SELECT * FROM lancamentos WHERE id = ?', [r.lastID]);
    res.status(201).json(lancamento);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.pagar = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const data_pagamento = req.body.data_pagamento || new Date().toISOString().split('T')[0];

    // Buscar lançamento para pegar o valor
    const lancamento = await db.get('SELECT * FROM lancamentos WHERE id = ? AND oficina_id = ?', [req.params.id, oficina_id]);
    if (!lancamento) return res.status(404).json({ error: 'Lançamento não encontrado' });

    // Atualizar status do lançamento para pago
    await db.run(
      'UPDATE lancamentos SET status = ?, data_pagamento = ? WHERE id = ? AND oficina_id = ?',
      ['pago', data_pagamento, req.params.id, oficina_id]
    );

    // Se for receita (entrada), criar movimento no caixa
    if (lancamento.tipo === 'receita') {
      // Buscar caixa aberto do dia
      const caixa = await db.get('SELECT * FROM caixas WHERE oficina_id = ? AND status = ? AND date(data) = date(?)', [oficina_id, 'aberto', data_pagamento]);

      if (caixa) {
        await db.run(
          'INSERT INTO caixa_movimentos (caixa_id, oficina_id, tipo, descricao, valor, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?)',
          [caixa.id, oficina_id, 'entrada', lancamento.descricao, lancamento.valor, 'dinheiro']
        );
      }
    }

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.atualizar = async (req, res) => {
  try {
    const { tipo, descricao, categoria, valor, data_vencimento, status } = req.body;
    await db.run(
      'UPDATE lancamentos SET tipo=?, descricao=?, categoria=?, valor=?, data_vencimento=?, status=? WHERE id=? AND oficina_id=?',
      [tipo, descricao, categoria || '', valor, data_vencimento || null, status, req.params.id, req.user.oficina_id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletar = async (req, res) => {
  try {
    await db.run('DELETE FROM lancamentos WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resumo = async (req, res) => {
  try {
    const { oficina_id } = req.user;

    const [receitas_mes, despesas_mes, a_receber, a_pagar, ultimos] = await Promise.all([
      db.get("SELECT COALESCE(SUM(valor),0) as total FROM lancamentos WHERE oficina_id=? AND tipo='receita' AND status='pago' AND strftime('%Y-%m',data_pagamento)=strftime('%Y-%m','now')", [oficina_id]),
      db.get("SELECT COALESCE(SUM(valor),0) as total FROM lancamentos WHERE oficina_id=? AND tipo='despesa' AND status='pago' AND strftime('%Y-%m',data_pagamento)=strftime('%Y-%m','now')", [oficina_id]),
      db.get("SELECT COALESCE(SUM(valor),0) as total, COUNT(*) as qtd FROM lancamentos WHERE oficina_id=? AND tipo='receita' AND status='pendente'", [oficina_id]),
      db.get("SELECT COALESCE(SUM(valor),0) as total, COUNT(*) as qtd FROM lancamentos WHERE oficina_id=? AND tipo='despesa' AND status='pendente'", [oficina_id]),
      db.all("SELECT * FROM lancamentos WHERE oficina_id=? ORDER BY created_at DESC LIMIT 10", [oficina_id]),
    ]);

    res.json({
      receitas_mes: receitas_mes.total,
      despesas_mes: despesas_mes.total,
      lucro_mes: receitas_mes.total - despesas_mes.total,
      a_receber: { total: a_receber.total, qtd: a_receber.qtd },
      a_pagar: { total: a_pagar.total, qtd: a_pagar.qtd },
      ultimos_lancamentos: ultimos,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
