const db = require('../database/db');

exports.listar = async (req, res) => {
  try {
    const { busca, cliente_id } = req.query;
    const { oficina_id } = req.user;
    let sql = `SELECT v.*, c.nome as cliente_nome FROM veiculos v LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.oficina_id = ?`;
    const params = [oficina_id];
    if (cliente_id) { sql += ' AND v.cliente_id = ?'; params.push(cliente_id); }
    if (busca) { sql += ' AND (v.placa LIKE ? OR v.modelo LIKE ? OR v.marca LIKE ? OR c.nome LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`); }
    sql += ' ORDER BY v.placa ASC';
    const veiculos = await db.all(sql, params);
    res.json(veiculos);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.buscarPorId = async (req, res) => {
  try {
    const veiculo = await db.get(`SELECT v.*, c.nome as cliente_nome FROM veiculos v LEFT JOIN clientes c ON c.id = v.cliente_id WHERE v.id = ? AND v.oficina_id = ?`,
      [req.params.id, req.user.oficina_id]);
    if (!veiculo) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json(veiculo);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.criar = async (req, res) => {
  try {
    const { cliente_id, placa, modelo, marca, ano, cor, km_atual } = req.body;
    if (!placa) return res.status(422).json({ error: 'Placa é obrigatória' });
    const r = await db.run('INSERT INTO veiculos (oficina_id, cliente_id, placa, modelo, marca, ano, cor, km_atual) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.oficina_id, cliente_id || null, placa.toUpperCase(), modelo || '', marca || '', ano || null, cor || '', km_atual || 0]);
    const veiculo = await db.get('SELECT * FROM veiculos WHERE id = ?', [r.lastID]);
    res.status(201).json(veiculo);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.atualizar = async (req, res) => {
  try {
    const { cliente_id, placa, modelo, marca, ano, cor, km_atual, ativo } = req.body;
    await db.run('UPDATE veiculos SET cliente_id=?, placa=?, modelo=?, marca=?, ano=?, cor=?, km_atual=?, ativo=? WHERE id=? AND oficina_id=?',
      [cliente_id || null, placa?.toUpperCase() || '', modelo || '', marca || '', ano || null, cor || '', km_atual || 0, ativo ?? 1, req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletar = async (req, res) => {
  try {
    await db.run('DELETE FROM veiculos WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
