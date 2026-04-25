const db = require('../database/db');

const gerarNumero = async (oficina_id) => {
  const row = await db.get('SELECT COUNT(*) as total FROM ordens WHERE oficina_id = ?', [oficina_id]);
  return `D#${String(row.total + 1).padStart(4, '0')}`;
};

exports.listar = async (req, res) => {
  try {
    const { status, tipo, busca } = req.query;
    const { oficina_id } = req.user;

    let sql = `
      SELECT o.*, c.nome as cliente_nome, v.placa, v.modelo, v.marca
      FROM ordens o
      LEFT JOIN clientes c ON c.id = o.cliente_id
      LEFT JOIN veiculos v ON v.id = o.veiculo_id
      WHERE o.oficina_id = ?`;
    const params = [oficina_id];

    if (status && status !== 'todas') { sql += ' AND o.status = ?'; params.push(status); }
    if (tipo)  { sql += ' AND o.tipo = ?'; params.push(tipo); }
    if (busca) { sql += ' AND (c.nome LIKE ? OR o.numero LIKE ? OR v.placa LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`); }
    sql += ' ORDER BY o.data_abertura DESC';

    const ordens = await db.all(sql, params);
    const total = ordens.reduce((s, o) => s + (o.valor_total || 0), 0);
    res.json({ ordens, quantidade: ordens.length, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const ordem = await db.get(`
      SELECT o.*, c.nome as cliente_nome, v.placa, v.modelo, v.marca
      FROM ordens o
      LEFT JOIN clientes c ON c.id = o.cliente_id
      LEFT JOIN veiculos v ON v.id = o.veiculo_id
      WHERE o.id = ? AND o.oficina_id = ?`, [req.params.id, req.user.oficina_id]);

    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada' });
    const itens = await db.all('SELECT * FROM ordem_itens WHERE ordem_id = ?', [ordem.id]);
    res.json({ ...ordem, itens });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const { cliente_id, veiculo_id, km, tipo, observacoes, notas, itens } = req.body;

    const numero = await gerarNumero(oficina_id);
    const valor_total = (itens || []).reduce((s, i) => s + ((+i.quantidade || 0) * (+i.valor_unitario || 0)), 0);

    const ordem = await db.run(`
      INSERT INTO ordens (oficina_id, numero, cliente_id, veiculo_id, km, tipo, observacoes, notas, valor_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [oficina_id, numero, cliente_id || null, veiculo_id || null, km || 0, tipo || 'oficina', observacoes || '', notas || '', valor_total]);

    if (itens && itens.length) {
      for (const item of itens) {
        await db.run('INSERT INTO ordem_itens (ordem_id, descricao, tipo, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)',
          [ordem.lastID, item.descricao, item.tipo || 'servico', item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario]);
      }
    }

    res.status(201).json({ id: ordem.lastID, numero });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validos = ['pre_orcamento', 'orcamento', 'andamento', 'finalizada', 'cancelada', 'faturada'];
    if (!validos.includes(status)) return res.status(422).json({ error: 'Status inválido' });

    const ordem = await db.get('SELECT * FROM ordens WHERE id = ? AND oficina_id = ?', [req.params.id, req.user.oficina_id]);
    if (!ordem) return res.status(404).json({ error: 'Ordem não encontrada' });

    const data_finalizacao = ['finalizada', 'faturada'].includes(status) ? new Date().toISOString() : null;
    await db.run('UPDATE ordens SET status = ?, data_finalizacao = ? WHERE id = ? AND oficina_id = ?',
      [status, data_finalizacao, req.params.id, req.user.oficina_id]);

    // Criar lançamento em Financeiro quando faturar
    if (status === 'faturada' && ordem.valor_total > 0) {
      await db.run(`
        INSERT INTO lancamentos (oficina_id, tipo, descricao, categoria, valor, status, ordem_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.oficina_id, 'receita', `Ordem ${ordem.numero}`, 'servico', ordem.valor_total, 'pendente', req.params.id]);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { cliente_id, veiculo_id, km, observacoes, notas, itens } = req.body;
    const valor_total = (itens || []).reduce((s, i) => s + ((+i.quantidade || 0) * (+i.valor_unitario || 0)), 0);

    await db.run('UPDATE ordens SET cliente_id=?, veiculo_id=?, km=?, observacoes=?, notas=?, valor_total=? WHERE id=? AND oficina_id=?',
      [cliente_id || null, veiculo_id || null, km || 0, observacoes || '', notas || '', valor_total, req.params.id, req.user.oficina_id]);

    if (itens) {
      await db.run('DELETE FROM ordem_itens WHERE ordem_id = ?', [req.params.id]);
      for (const item of itens) {
        await db.run('INSERT INTO ordem_itens (ordem_id, descricao, tipo, quantidade, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.id, item.descricao, item.tipo || 'servico', item.quantidade, item.valor_unitario, item.quantidade * item.valor_unitario]);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const { oficina_id } = req.user;
    const [abertas, mes, veiculos, clientes, ultimas] = await Promise.all([
      db.get("SELECT COUNT(*) as total FROM ordens WHERE oficina_id=? AND status IN ('orcamento','andamento','pre_orcamento')", [oficina_id]),
      db.get("SELECT COUNT(*) as total, SUM(valor_total) as receita FROM ordens WHERE oficina_id=? AND strftime('%Y-%m', data_abertura)=strftime('%Y-%m','now')", [oficina_id]),
      db.get('SELECT COUNT(*) as total FROM veiculos WHERE oficina_id=? AND ativo=1', [oficina_id]),
      db.get('SELECT COUNT(*) as total FROM clientes WHERE oficina_id=?', [oficina_id]),
      db.all(`SELECT o.numero, o.status, o.valor_total, o.data_abertura, c.nome as cliente_nome, v.placa
              FROM ordens o
              LEFT JOIN clientes c ON c.id=o.cliente_id
              LEFT JOIN veiculos v ON v.id=o.veiculo_id
              WHERE o.oficina_id=? ORDER BY o.data_abertura DESC LIMIT 5`, [oficina_id]),
    ]);
    res.json({
      ordens_abertas: abertas.total,
      ordens_mes: mes.total,
      receita_mes: mes.receita || 0,
      total_veiculos: veiculos.total,
      total_clientes: clientes.total,
      ultimas_ordens: ultimas,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
