const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, oficina_id: user.oficina_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { nome_oficina, email_oficina, telefone, plano, nome, email, senha } = req.body;
    if (!nome_oficina || !email_oficina || !nome || !email || !senha)
      return res.status(422).json({ error: 'Preencha todos os campos obrigatórios' });

    if (!emailRegex.test(email))
      return res.status(422).json({ error: 'Formato de e-mail inválido' });

    if (senha.length < 6)
      return res.status(422).json({ error: 'A senha deve ter no mínimo 6 caracteres' });

    if (nome.length > 100 || email.length > 150 || nome_oficina.length > 150)
      return res.status(422).json({ error: 'Campo excede o tamanho máximo permitido' });

    const emailExiste = await db.get('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (emailExiste) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hash = bcrypt.hashSync(senha, 10);
    const oficina = await db.run('INSERT INTO oficinas (nome, email, telefone, plano) VALUES (?, ?, ?, ?)',
      [nome_oficina, email_oficina, telefone || '', plano || 'acelera']);

    const usuario = await db.run('INSERT INTO usuarios (oficina_id, nome, email, senha, role) VALUES (?, ?, ?, ?, ?)',
      [oficina.lastID, nome, email, hash, 'admin']);

    const user = await db.get('SELECT * FROM usuarios WHERE id = ?', [usuario.lastID]);
    res.status(201).json({ token: makeToken(user), user: { id: user.id, nome: user.nome, email: user.email, role: user.role, oficina_id: user.oficina_id } });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: err.message || 'Erro desconhecido', detail: err.toString(), code: err.code });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(422).json({ error: 'E-mail e senha são obrigatórios' });

    if (!emailRegex.test(email))
      return res.status(422).json({ error: 'Formato de e-mail inválido' });

    const user = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!user || !bcrypt.compareSync(senha, user.senha))
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });

    res.json({ token: makeToken(user), user: { id: user.id, nome: user.nome, email: user.email, role: user.role, oficina_id: user.oficina_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await db.get(`
      SELECT u.id, u.nome, u.email, u.role, u.oficina_id, o.nome as oficina_nome, o.plano
      FROM usuarios u JOIN oficinas o ON o.id = u.oficina_id
      WHERE u.id = ?`, [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
