const db = require('../database/db');

const formatarData = (date) => {
  if (!date) return 'Hoje';
  const d = new Date(date);
  const hoje = new Date();
  const diff = Math.floor((hoje - d) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff > 1 && diff <= 7) return `${diff} dias atrás`;
  if (diff > 7 && diff <= 30) return `${Math.floor(diff / 7)} semanas atrás`;
  return d.toLocaleDateString('pt-BR');
};

const determinarUrgencia = (dias) => {
  if (dias <= 0) return 'critica';
  if (dias <= 3) return 'alta';
  if (dias <= 7) return 'media';
  return 'baixa';
};

exports.getAlertas = async (req, res) => {
  const { oficina_id } = req.user;
  const alertas = [];

  try {
    // 1. MANUTENÇÃO PREVENTIVA VENCIDA
    const manutencoes = await db.all(
      `SELECT m.*, v.placa, c.nome as cliente_nome
       FROM manutencoes m
       JOIN veiculos v ON m.veiculo_id = v.id
       LEFT JOIN clientes c ON m.cliente_id = c.id
       WHERE m.oficina_id = ? AND m.status = 'ativo'
       AND (m.data_proximo < DATE('now') OR m.km_proximo < 0)
       ORDER BY m.data_proximo ASC`,
      [oficina_id]
    );

    manutencoes.forEach(m => {
      const diasVencido = Math.floor(
        (new Date() - new Date(m.data_proximo)) / (1000 * 60 * 60 * 24)
      );
      alertas.push({
        tipo: 'manutencao',
        titulo: `Manutenção vencida: ${m.tipo_servico}`,
        mensagem: `Veículo ${m.placa} (${m.cliente_nome || 'S/cliente'})`,
        detalhes: `Vencido há ${diasVencido} dias`,
        urgencia: determinarUrgencia(-diasVencido),
        dataAlerta: formatarData(m.data_proximo),
      });
    });

    // 2. ESTOQUE BAIXO
    const pecas = await db.all(
      `SELECT * FROM pecas
       WHERE oficina_id = ? AND estoque_atual <= estoque_minimo AND ativo = 1
       ORDER BY estoque_atual ASC`,
      [oficina_id]
    );

    pecas.forEach(p => {
      const deficit = p.estoque_minimo - p.estoque_atual;
      alertas.push({
        tipo: 'estoque',
        titulo: `Estoque baixo: ${p.nome}`,
        mensagem: `${p.estoque_atual} unidades disponíveis`,
        detalhes: `Mínimo: ${p.estoque_minimo} unidades`,
        urgencia: deficit > 5 ? 'critica' : deficit > 3 ? 'alta' : 'media',
        dataAlerta: formatarData(p.created_at),
      });
    });

    // 3. CONTAS A RECEBER VENCIDAS
    const contasVencidas = await db.all(
      `SELECT l.*, c.nome as cliente_nome
       FROM lancamentos l
       LEFT JOIN ordens o ON l.ordem_id = o.id
       LEFT JOIN clientes c ON o.cliente_id = c.id
       WHERE l.oficina_id = ? AND l.tipo = 'receita' AND l.status = 'pendente'
       AND l.data_vencimento < DATE('now')
       ORDER BY l.data_vencimento ASC`,
      [oficina_id]
    );

    contasVencidas.forEach(c => {
      const diasVencido = Math.floor(
        (new Date() - new Date(c.data_vencimento)) / (1000 * 60 * 60 * 24)
      );
      alertas.push({
        tipo: 'financeiro',
        titulo: `Conta a receber vencida`,
        mensagem: `${c.cliente_nome || 'Cliente sem nome'} - R$ ${c.valor.toFixed(2)}`,
        detalhes: `Vencido há ${diasVencido} dias`,
        urgencia: determinarUrgencia(-diasVencido),
        dataAlerta: formatarData(c.data_vencimento),
      });
    });

    // 4. ORÇAMENTOS EXPIRADOS (7+ dias sem atividade)
    const orcamentosExpirados = await db.all(
      `SELECT o.*, c.nome as cliente_nome, v.placa
       FROM ordens o
       LEFT JOIN clientes c ON o.cliente_id = c.id
       LEFT JOIN veiculos v ON o.veiculo_id = v.id
       WHERE o.oficina_id = ? AND o.status IN ('pré-orçamento', 'orçamento')
       AND DATE(o.data_abertura) < DATE('now', '-7 days')
       ORDER BY o.data_abertura ASC`,
      [oficina_id]
    );

    orcamentosExpirados.forEach(o => {
      const diasAberto = Math.floor(
        (new Date() - new Date(o.data_abertura)) / (1000 * 60 * 60 * 24)
      );
      alertas.push({
        tipo: 'orcamento',
        titulo: `Orçamento expirado`,
        mensagem: `OS #${o.numero} - ${o.cliente_nome || 'Cliente sem nome'}`,
        detalhes: `Aberto há ${diasAberto} dias`,
        urgencia: diasAberto > 30 ? 'critica' : diasAberto > 15 ? 'alta' : 'media',
        dataAlerta: formatarData(o.data_abertura),
      });
    });

    // 5. ANIVERSÁRIOS DE CLIENTES (próximos 7 dias)
    const hoje = new Date();
    const proximaSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

    const aniversarios = await db.all(
      `SELECT * FROM clientes
       WHERE oficina_id = ? AND data_nascimento IS NOT NULL`,
      [oficina_id]
    );

    aniversarios.forEach(c => {
      if (!c.data_nascimento) return;

      const parts = c.data_nascimento.split('-');
      let data_nasc = new Date(`${hoje.getFullYear()}-${parts[1]}-${parts[2]}`);

      if (data_nasc < hoje) {
        data_nasc = new Date(`${hoje.getFullYear() + 1}-${parts[1]}-${parts[2]}`);
      }

      if (data_nasc >= hoje && data_nasc <= proximaSemana) {
        const diasFaltam = Math.floor((data_nasc - hoje) / (1000 * 60 * 60 * 24));

        alertas.push({
          tipo: 'aniversario',
          titulo: `Aniversário de ${c.nome}`,
          mensagem: `Cliente aniversariante em ${diasFaltam} dias`,
          detalhes: `Oportunidade para enviar uma mensagem personalizada`,
          urgencia: diasFaltam === 0 ? 'alta' : 'media',
          dataAlerta: formatarData(data_nasc),
        });
      }
    });

    // Ordena por urgência
    const ordemUrgencia = { critica: 0, alta: 1, media: 2, baixa: 3 };
    alertas.sort((a, b) => ordemUrgencia[a.urgencia] - ordemUrgencia[b.urgencia]);

    res.json(alertas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar alertas' });
  }
};

exports.getContagemAlertas = async (req, res) => {
  const { oficina_id } = req.user;

  try {
    const alertas = await db.all(
      `SELECT
        (SELECT COUNT(*) FROM manutencoes WHERE oficina_id = ? AND status = 'ativo' AND data_proximo < DATE('now')) as manutencao,
        (SELECT COUNT(*) FROM pecas WHERE oficina_id = ? AND estoque_atual <= estoque_minimo AND ativo = 1) as estoque,
        (SELECT COUNT(*) FROM lancamentos WHERE oficina_id = ? AND tipo = 'receita' AND status = 'pendente' AND data_vencimento < DATE('now')) as financeiro`,
      [oficina_id, oficina_id, oficina_id]
    );

    const total = Object.values(alertas[0] || {}).reduce((s, v) => s + (v || 0), 0);

    res.json({ ...alertas[0], total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao contar alertas' });
  }
};
