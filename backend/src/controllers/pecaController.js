const db = require('../database/db');

exports.listar = async (req, res) => {
  try {
    const { busca, categoria } = req.query;
    const { oficina_id } = req.user;
    let sql = 'SELECT * FROM pecas WHERE oficina_id = ? AND ativo = 1';
    const params = [oficina_id];
    if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
    if (busca) { sql += ' AND (nome LIKE ? OR codigo LIKE ? OR fabricante LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`); }
    sql += ' ORDER BY nome ASC';
    const pecas = await db.all(sql, params);
    res.json(pecas);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.criar = async (req, res) => {
  try {
    const { codigo, nome, descricao, categoria, fabricante, unidade, estoque_atual, estoque_minimo, valor_custo, valor_venda } = req.body;
    if (!nome) return res.status(422).json({ error: 'Nome é obrigatório' });
    const r = await db.run(
      'INSERT INTO pecas (oficina_id, codigo, nome, descricao, categoria, fabricante, unidade, estoque_atual, estoque_minimo, valor_custo, valor_venda) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.oficina_id, codigo || '', nome, descricao || '', categoria || '', fabricante || '', unidade || 'un', estoque_atual || 0, estoque_minimo || 0, valor_custo || 0, valor_venda || 0]
    );
    const peca = await db.get('SELECT * FROM pecas WHERE id = ?', [r.lastID]);
    res.status(201).json(peca);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.atualizar = async (req, res) => {
  try {
    const { codigo, nome, descricao, categoria, fabricante, unidade, estoque_atual, estoque_minimo, valor_custo, valor_venda } = req.body;
    await db.run(
      'UPDATE pecas SET codigo=?, nome=?, descricao=?, categoria=?, fabricante=?, unidade=?, estoque_atual=?, estoque_minimo=?, valor_custo=?, valor_venda=? WHERE id=? AND oficina_id=?',
      [codigo || '', nome, descricao || '', categoria || '', fabricante || '', unidade || 'un', estoque_atual || 0, estoque_minimo || 0, valor_custo || 0, valor_venda || 0, req.params.id, req.user.oficina_id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deletar = async (req, res) => {
  try {
    await db.run('UPDATE pecas SET ativo = 0 WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.ajustarEstoque = async (req, res) => {
  try {
    const { quantidade, tipo } = req.body;
    const op = tipo === 'entrada' ? '+' : '-';
    await db.run(`UPDATE pecas SET estoque_atual = estoque_atual ${op} ? WHERE id = ? AND oficina_id = ?`,
      [Math.abs(quantidade), req.params.id, req.user.oficina_id]);
    const peca = await db.get('SELECT * FROM pecas WHERE id = ?', [req.params.id]);
    res.json(peca);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.produtosVendidos = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    const { oficina_id } = req.user;

    const produtosVendidos = await db.all(`
      SELECT
        p.id,
        p.nome,
        SUM(oi.quantidade) as quantidade_vendida,
        SUM(oi.valor_total) as total_vendido
      FROM ordem_itens oi
      JOIN pecas p ON p.id = SUBSTRING_INDEX(oi.descricao, ' ', 1)::INTEGER OR p.nome = oi.descricao
      JOIN ordens o ON o.id = oi.ordem_id
      WHERE o.oficina_id = ? AND o.status IN ('finalizada', 'faturada')
      AND DATE(o.data_finalizacao) >= ? AND DATE(o.data_finalizacao) <= ?
      GROUP BY p.id, p.nome
      ORDER BY quantidade_vendida DESC
      LIMIT 10
    `, [oficina_id, data_inicio || '2000-01-01', data_fim || new Date().toISOString().split('T')[0]]);

    res.json(produtosVendidos || []);
  } catch (err) {
    // Se houver erro na query complexa, retornar um query mais simples
    try {
      const simples = await db.all(`
        SELECT
          'Produtos da Ordem' as nome,
          COUNT(DISTINCT oi.ordem_id) as quantidade_vendida,
          SUM(oi.valor_total) as total_vendido
        FROM ordem_itens oi
        JOIN ordens o ON o.id = oi.ordem_id
        WHERE o.oficina_id = ? AND o.status IN ('finalizada', 'faturada')
        AND DATE(o.data_finalizacao) >= ? AND DATE(o.data_finalizacao) <= ?
      `, [req.user.oficina_id, req.query.data_inicio || '2000-01-01', req.query.data_fim || new Date().toISOString().split('T')[0]]);
      res.json(simples || []);
    } catch (err2) {
      res.json([]);
    }
  }
};
