const db = require('../database/db');
const bcrypt = require('bcryptjs');

exports.getUsuarios = async (req, res) => {
  const { oficina_id } = req.user;

  try {
    const usuarios = await db.all(
      `SELECT id, nome, email, role, ativo, created_at
       FROM usuarios WHERE oficina_id = ? ORDER BY nome`,
      [oficina_id]
    );

    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
};

exports.createUsuario = async (req, res) => {
  const { oficina_id } = req.user;
  const { nome, email, role = 'mecanico', senha, ativo = 1 } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    await db.run(
      `INSERT INTO usuarios (oficina_id, nome, email, senha, role, ativo) VALUES (?, ?, ?, ?, ?, ?)`,
      [oficina_id, nome, email, senhaHash, role, ativo]
    );

    res.json({
      message: 'Usuário criado com sucesso'
    });
  } catch (err) {
    console.error(err);
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

exports.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;
  const { nome, email, role, ativo } = req.body;

  try {
    await db.run(
      `UPDATE usuarios SET nome = ?, email = ?, role = ?, ativo = ?
       WHERE id = ? AND oficina_id = ?`,
      [nome, email, role, ativo, id, oficina_id]
    );

    res.json({ message: 'Usuário atualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

exports.deleteUsuario = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;

  try {
    await db.run(
      `DELETE FROM usuarios WHERE id = ? AND oficina_id = ?`,
      [id, oficina_id]
    );

    res.json({ message: 'Usuário deletado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};
