const db = require('../database/db');

exports.listar = async (req, res) => {
  try {
    const { busca } = req.query;
    const { oficina_id } = req.user;
    let sql = 'SELECT * FROM clientes WHERE oficina_id = ?';
    const params = [oficina_id];
    if (busca) { sql += ' AND (nome LIKE ? OR cpf_cnpj LIKE ? OR telefone LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`); }
    sql += ' ORDER BY nome ASC';
    const clientes = await db.all(sql, params);
    res.json(clientes);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.buscarPorId = async (req, res) => {
  try {
    const cliente = await db.get('SELECT * FROM clientes WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    const veiculos = await db.all('SELECT * FROM veiculos WHERE cliente_id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ...cliente, veiculos });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.criar = async (req, res) => {
  try {
    const { nome, cpf_cnpj, telefone, email, endereco } = req.body;
    if (!nome) return res.status(422).json({ error: 'Nome é obrigatório' });
    const r = await db.run('INSERT INTO clientes (oficina_id, nome, cpf_cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.oficina_id, nome, cpf_cnpj || '', telefone || '', email || '', endereco || '']);
    const cliente = await db.get('SELECT * FROM clientes WHERE id = ?', [r.lastID]);
    res.status(201).json(cliente);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.atualizar = async (req, res) => {
  try {
    const { nome, cpf_cnpj, telefone, email, endereco } = req.body;
    await db.run('UPDATE clientes SET nome=?, cpf_cnpj=?, telefone=?, email=?, endereco=? WHERE id=? AND oficina_id=?',
      [nome, cpf_cnpj || '', telefone || '', email || '', endereco || '', req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletar = async (req, res) => {
  try {
    await db.run('DELETE FROM clientes WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
