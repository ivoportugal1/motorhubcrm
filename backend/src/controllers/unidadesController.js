const db = require('../database/db');

exports.getUnidades = async (req, res) => {
  const { oficina_id } = req.user;

  try {
    const unidades = await db.all(
      `SELECT * FROM unidades WHERE oficina_id = ? ORDER BY nome`,
      [oficina_id]
    );

    res.json(unidades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar unidades' });
  }
};

exports.createUnidade = async (req, res) => {
  const { oficina_id } = req.user;
  const { nome, endereco, cidade, uf, telefone, email } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  try {
    const result = await db.run(
      `INSERT INTO unidades (oficina_id, nome, endereco, cidade, uf, telefone, email, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [oficina_id, nome, endereco, cidade, uf, telefone, email]
    );

    res.json({
      id: result.lastID,
      message: 'Unidade criada com sucesso'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar unidade' });
  }
};

exports.updateUnidade = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;
  const { nome, endereco, cidade, uf, telefone, email, ativo } = req.body;

  try {
    await db.run(
      `UPDATE unidades SET nome = ?, endereco = ?, cidade = ?, uf = ?, telefone = ?, email = ?, ativo = ?
       WHERE id = ? AND oficina_id = ?`,
      [nome, endereco, cidade, uf, telefone, email, ativo, id, oficina_id]
    );

    res.json({ message: 'Unidade atualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar unidade' });
  }
};

exports.deleteUnidade = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;

  try {
    await db.run(
      `DELETE FROM unidades WHERE id = ? AND oficina_id = ?`,
      [id, oficina_id]
    );

    res.json({ message: 'Unidade deletada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar unidade' });
  }
};
