const db = require('../database/db');

exports.getConfig = async (req, res) => {
  const { oficina_id } = req.user;

  try {
    const config = await db.get(
      `SELECT nome, email, telefone, endereco, cidade, uf, cep, cnpj, inscricao_estadual, horario_abertura, horario_fechamento
       FROM oficinas WHERE id = ?`,
      [oficina_id]
    );

    res.json(config || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar configurações' });
  }
};

exports.updateConfig = async (req, res) => {
  const { oficina_id } = req.user;
  const { nome, email, telefone, endereco, cidade, uf, cep, cnpj, inscricao_estadual, horario_abertura, horario_fechamento } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome da oficina é obrigatório' });
  }

  try {
    await db.run(
      `UPDATE oficinas SET
        nome = ?, email = ?, telefone = ?, endereco = ?, cidade = ?, uf = ?, cep = ?,
        cnpj = ?, inscricao_estadual = ?, horario_abertura = ?, horario_fechamento = ?
       WHERE id = ?`,
      [nome, email, telefone, endereco, cidade, uf, cep, cnpj, inscricao_estadual, horario_abertura, horario_fechamento, oficina_id]
    );

    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};
