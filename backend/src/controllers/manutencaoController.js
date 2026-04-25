const db = require('../database/db');

exports.listar = async (req, res) => {
  try {
    const { status, busca } = req.query;
    const { oficina_id } = req.user;

    let sql = `
      SELECT m.*, v.placa, v.modelo, v.marca, v.km_atual as veiculo_km, c.nome as cliente_nome
      FROM manutencoes m
      JOIN veiculos v ON v.id = m.veiculo_id
      LEFT JOIN clientes c ON c.id = m.cliente_id
      WHERE m.oficina_id = ?`;
    const params = [oficina_id];

    if (status) { sql += ' AND m.status = ?'; params.push(status); }
    if (busca)  { sql += ' AND (v.placa LIKE ? OR c.nome LIKE ? OR m.tipo_servico LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`); }
    sql += ' ORDER BY m.data_proximo ASC';

    const manutencoes = await db.all(sql, params);

    // marca alertas
    const hoje = new Date().toISOString().split('T')[0];
    const result = manutencoes.map(m => ({
      ...m,
      alerta_data: m.data_proximo && m.data_proximo <= hoje,
      alerta_km: m.km_proximo && m.veiculo_km >= m.km_proximo,
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.criar = async (req, res) => {
  try {
    const { veiculo_id, cliente_id, tipo_servico, km_atual, km_proximo, data_ultimo, data_proximo, observacoes } = req.body;
    if (!veiculo_id || !tipo_servico) return res.status(422).json({ error: 'Veículo e tipo de serviço são obrigatórios' });

    const r = await db.run(
      'INSERT INTO manutencoes (oficina_id, veiculo_id, cliente_id, tipo_servico, km_atual, km_proximo, data_ultimo, data_proximo, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.oficina_id, veiculo_id, cliente_id || null, tipo_servico, km_atual || 0, km_proximo || 0, data_ultimo || null, data_proximo || null, observacoes || '']
    );
    res.status(201).json({ id: r.lastID });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.atualizar = async (req, res) => {
  try {
    const { tipo_servico, km_atual, km_proximo, data_ultimo, data_proximo, status, observacoes } = req.body;
    await db.run(
      'UPDATE manutencoes SET tipo_servico=?, km_atual=?, km_proximo=?, data_ultimo=?, data_proximo=?, status=?, observacoes=? WHERE id=? AND oficina_id=?',
      [tipo_servico, km_atual || 0, km_proximo || 0, data_ultimo || null, data_proximo || null, status || 'ativo', observacoes || '', req.params.id, req.user.oficina_id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletar = async (req, res) => {
  try {
    await db.run('DELETE FROM manutencoes WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.alertas = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const hoje = new Date().toISOString().split('T')[0];

    const alertas = await db.all(`
      SELECT m.*, v.placa, v.modelo, v.km_atual as veiculo_km, c.nome as cliente_nome
      FROM manutencoes m
      JOIN veiculos v ON v.id = m.veiculo_id
      LEFT JOIN clientes c ON c.id = m.cliente_id
      WHERE m.oficina_id = ? AND m.status = 'ativo'
        AND (m.data_proximo <= ? OR v.km_atual >= m.km_proximo)
      ORDER BY m.data_proximo ASC`, [oficina_id, hoje]);

    res.json(alertas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
