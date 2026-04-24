const db = require('../database/db');

const getDateRange = (periodo) => {
  const hoje = new Date();
  let inicio, fim = hoje;

  if (periodo === 'mes') {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  } else if (periodo === 'trimestre') {
    const trimestre = Math.floor(hoje.getMonth() / 3);
    inicio = new Date(hoje.getFullYear(), trimestre * 3, 1);
  } else {
    inicio = new Date(hoje.getFullYear(), 0, 1);
  }

  return {
    inicio: inicio.toISOString().split('T')[0],
    fim: fim.toISOString().split('T')[0]
  };
};

exports.getRelatorios = async (req, res) => {
  const { periodo = 'mes' } = req.query;
  const { oficina_id } = req.user;
  const range = getDateRange(periodo);

  try {
    // Receita e Despesa
    const financeiro = await db.all(
      `SELECT
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receita,
        SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesa
       FROM lancamentos
       WHERE oficina_id = ? AND DATE(created_at) BETWEEN ? AND ?`,
      [oficina_id, range.inicio, range.fim]
    );

    const receita = financeiro[0]?.receita || 0;
    const despesa = financeiro[0]?.despesa || 0;

    // Ordens
    const ordens = await db.all(
      `SELECT status, COUNT(*) as total
       FROM ordens
       WHERE oficina_id = ? AND DATE(data_abertura) BETWEEN ? AND ?
       GROUP BY status`,
      [oficina_id, range.inicio, range.fim]
    );

    const ordensMap = {};
    ordens.forEach(o => { ordensMap[o.status] = o.total; });

    // Clientes
    const clientes = await db.all(
      `SELECT COUNT(*) as total FROM clientes WHERE oficina_id = ?`,
      [oficina_id]
    );

    const clientesNovos = await db.all(
      `SELECT COUNT(*) as total FROM clientes
       WHERE oficina_id = ? AND DATE(created_at) BETWEEN ? AND ?`,
      [oficina_id, range.inicio, range.fim]
    );

    // Veículos
    const veiculos = await db.all(
      `SELECT COUNT(*) as total FROM veiculos WHERE oficina_id = ?`,
      [oficina_id]
    );

    res.json({
      financeiro: {
        receita: receita || 0,
        despesa: despesa || 0,
        saldo: (receita || 0) - (despesa || 0),
      },
      ordens: {
        total: Object.values(ordensMap).reduce((s, v) => s + v, 0),
        concluidas: ordensMap.finalizada || 0,
        abiertas: (ordensMap['pré-orçamento'] || 0) + (ordensMap.orçamento || 0) + (ordensMap.andamento || 0),
      },
      clientes: {
        total: clientes[0]?.total || 0,
        novos: clientesNovos[0]?.total || 0,
      },
      veiculos: {
        total: veiculos[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar relatórios' });
  }
};
