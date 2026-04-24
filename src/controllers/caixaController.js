const db = require('../database/db');

exports.caixaAtual = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const hoje = new Date().toISOString().split('T')[0];
    const caixa = await db.get("SELECT * FROM caixas WHERE oficina_id = ? AND date(data) = ? AND status = 'aberto'", [oficina_id, hoje]);
    if (!caixa) return res.json(null);
    const movimentos = await db.all('SELECT * FROM caixa_movimentos WHERE caixa_id = ? ORDER BY created_at DESC', [caixa.id]);
    const entradas = movimentos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
    const saidas   = movimentos.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
    res.json({ ...caixa, movimentos, entradas, saidas, saldo: caixa.saldo_inicial + entradas - saidas });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.historico = async (req, res) => {
  try {
    const caixas = await db.all('SELECT * FROM caixas WHERE oficina_id = ? ORDER BY data DESC LIMIT 30', [req.user.oficina_id]);
    res.json(caixas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.abrir = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const hoje = new Date().toISOString().split('T')[0];
    const existente = await db.get("SELECT id FROM caixas WHERE oficina_id = ? AND date(data) = ? AND status = 'aberto'", [oficina_id, hoje]);
    if (existente) return res.status(409).json({ error: 'Já existe um caixa aberto hoje' });
    const r = await db.run('INSERT INTO caixas (oficina_id, data, saldo_inicial) VALUES (?, ?, ?)',
      [oficina_id, hoje, req.body.saldo_inicial || 0]);
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.fechar = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const hoje = new Date().toISOString().split('T')[0];
    const caixa = await db.get("SELECT * FROM caixas WHERE oficina_id = ? AND date(data) = ? AND status = 'aberto'", [oficina_id, hoje]);
    if (!caixa) return res.status(404).json({ error: 'Nenhum caixa aberto' });
    const movimentos = await db.all('SELECT * FROM caixa_movimentos WHERE caixa_id = ?', [caixa.id]);
    const entradas = movimentos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.valor, 0);
    const saidas   = movimentos.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.valor, 0);
    const saldo_final = caixa.saldo_inicial + entradas - saidas;
    await db.run("UPDATE caixas SET status = 'fechado', saldo_final = ? WHERE id = ?", [saldo_final, caixa.id]);
    res.json({ saldo_final });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addMovimento = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const hoje = new Date().toISOString().split('T')[0];
    const caixa = await db.get("SELECT * FROM caixas WHERE oficina_id = ? AND date(data) = ? AND status = 'aberto'", [oficina_id, hoje]);
    if (!caixa) return res.status(404).json({ error: 'Abra o caixa antes de registrar movimentos' });
    const { tipo, descricao, valor, forma_pagamento } = req.body;
    if (!descricao || !valor) return res.status(422).json({ error: 'Descrição e valor são obrigatórios' });
    await db.run('INSERT INTO caixa_movimentos (caixa_id, oficina_id, tipo, descricao, valor, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?)',
      [caixa.id, oficina_id, tipo || 'entrada', descricao, valor, forma_pagamento || 'dinheiro']);
    res.status(201).json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.delMovimento = async (req, res) => {
  try {
    await db.run('DELETE FROM caixa_movimentos WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
