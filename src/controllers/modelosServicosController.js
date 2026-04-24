const db = require('../database/db');

exports.getModelos = async (req, res) => {
  const { oficina_id } = req.user;

  try {
    const modelos = await db.all(
      `SELECT * FROM modelos_servicos WHERE oficina_id = ? ORDER BY nome`,
      [oficina_id]
    );

    res.json(modelos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar modelos' });
  }
};

exports.createModelo = async (req, res) => {
  const { oficina_id } = req.user;
  const { nome, descricao, valor_padrao, categoria } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const result = await db.run(
      `INSERT INTO modelos_servicos (oficina_id, nome, descricao, valor_padrao, categoria)
       VALUES (?, ?, ?, ?, ?)`,
      [oficina_id, nome, descricao || '', valor_padrao || 0, categoria || 'servico']
    );

    res.json({ id: result.lastID, message: 'Modelo criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar modelo' });
  }
};

exports.updateModelo = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;
  const { nome, descricao, valor_padrao, categoria } = req.body;

  try {
    await db.run(
      `UPDATE modelos_servicos SET nome = ?, descricao = ?, valor_padrao = ?, categoria = ?
       WHERE id = ? AND oficina_id = ?`,
      [nome, descricao, valor_padrao, categoria, id, oficina_id]
    );

    res.json({ message: 'Modelo atualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar modelo' });
  }
};

exports.deleteModelo = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;

  try {
    await db.run(
      `DELETE FROM modelos_servicos WHERE id = ? AND oficina_id = ?`,
      [id, oficina_id]
    );

    res.json({ message: 'Modelo deletado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar modelo' });
  }
};
