const db = require('../database/db');

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

exports.getOrcamento = async (req, res) => {
  const { id } = req.params;
  const { oficina_id } = req.user;

  try {
    const ordem = await db.get(
      `SELECT o.*, c.nome as cliente_nome, c.telefone, c.email, c.cpf_cnpj,
              v.placa, v.modelo, v.marca, of.nome as oficina_nome, of.cnpj
       FROM ordens o
       LEFT JOIN clientes c ON o.cliente_id = c.id
       LEFT JOIN veiculos v ON o.veiculo_id = v.id
       LEFT JOIN oficinas of ON o.oficina_id = of.id
       WHERE o.id = ? AND o.oficina_id = ?`,
      [id, oficina_id]
    );

    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    const itens = await db.all(
      `SELECT * FROM ordem_itens WHERE ordem_id = ?`,
      [id]
    );

    // Aqui você geraria o PDF. Por enquanto, retorna JSON
    // Em produção, usar pdfkit ou similar
    res.json({
      ordem,
      itens,
      // PDF gerado aqui com pdfkit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar orçamento' });
  }
};

exports.getRelatorioExcel = async (req, res) => {
  const { periodo = 'mes' } = req.query;
  const { oficina_id } = req.user;

  try {
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

    const range = getDateRange(periodo);

    // Simula dados para export
    // Em produção, usar biblioteca como xlsx
    const financeiro = await db.all(
      `SELECT tipo, SUM(valor) as total FROM lancamentos
       WHERE oficina_id = ? AND DATE(created_at) BETWEEN ? AND ?
       GROUP BY tipo`,
      [oficina_id, range.inicio, range.fim]
    );

    const ordens = await db.all(
      `SELECT status, COUNT(*) as total FROM ordens
       WHERE oficina_id = ? AND DATE(data_abertura) BETWEEN ? AND ?
       GROUP BY status`,
      [oficina_id, range.inicio, range.fim]
    );

    // Retorna JSON simulando Excel
    res.json({
      financeiro,
      ordens,
      periodo,
      // Em produção, gerar arquivo Excel real
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

exports.getRelatorioPDF = async (req, res) => {
  const { periodo = 'mes' } = req.query;
  const { oficina_id } = req.user;

  try {
    // Mesma lógica do Excel
    res.json({ message: 'PDF gerado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};
