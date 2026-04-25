const db = require('../database/db');

exports.listar = async (req, res) => {
  try {
    const transferencias = await db.all(
      'SELECT * FROM transferencias WHERE oficina_id = ? ORDER BY data DESC',
      [req.user.oficina_id]
    );
    res.json(transferencias);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.criar = async (req, res) => {
  try {
    const { descricao, valor, conta_origem, conta_destino, data } = req.body;
    if (!descricao || !valor) return res.status(422).json({ error: 'Descrição e valor são obrigatórios' });
    const r = await db.run(
      'INSERT INTO transferencias (oficina_id, descricao, valor, conta_origem, conta_destino, data) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.oficina_id, descricao, valor, conta_origem || '', conta_destino || '', data || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletar = async (req, res) => {
  try {
    await db.run('DELETE FROM transferencias WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
