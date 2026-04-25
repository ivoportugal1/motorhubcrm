const db = require('../database/db');

exports.getConfig = async (req, res) => {
  const { oficina_id } = req.user;

  try {
    const config = await db.get(
      `SELECT * FROM integracao WHERE oficina_id = ?`,
      [oficina_id]
    );

    res.json(config || {
      whatsapp_ativo: false,
      whatsapp_numero: '',
      smtp_ativo: false,
      smtp_host: '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar configurações' });
  }
};

exports.updateConfig = async (req, res) => {
  const { oficina_id } = req.user;
  const { whatsapp_ativo, whatsapp_numero, whatsapp_token, smtp_ativo, smtp_host, smtp_usuario } = req.body;

  try {
    const existing = await db.get(`SELECT id FROM integracao WHERE oficina_id = ?`, [oficina_id]);

    if (existing) {
      await db.run(
        `UPDATE integracao SET whatsapp_ativo = ?, whatsapp_numero = ?, whatsapp_token = ?,
         smtp_ativo = ?, smtp_host = ?, smtp_usuario = ? WHERE oficina_id = ?`,
        [whatsapp_ativo ? 1 : 0, whatsapp_numero, whatsapp_token, smtp_ativo ? 1 : 0, smtp_host, smtp_usuario, oficina_id]
      );
    } else {
      await db.run(
        `INSERT INTO integracao (oficina_id, whatsapp_ativo, whatsapp_numero, whatsapp_token, smtp_ativo, smtp_host, smtp_usuario)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [oficina_id, whatsapp_ativo ? 1 : 0, whatsapp_numero, whatsapp_token, smtp_ativo ? 1 : 0, smtp_host, smtp_usuario]
      );
    }

    res.json({ message: 'Configurações atualizadas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
};

exports.testarWhatsApp = async (req, res) => {
  const { numero } = req.body;
  const { oficina_id } = req.user;

  try {
    // Aqui você enviaria uma mensagem de teste via Twilio ou Meta API
    // Por enquanto, simular sucesso
    console.log(`Enviando mensagem de teste para ${numero}`);

    res.json({ message: 'Mensagem de teste enviada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar teste' });
  }
};

exports.enviarOrcamentoWhatsApp = async (req, res) => {
  const { ordemId, numeroDestino } = req.body;
  const { oficina_id } = req.user;

  try {
    const ordem = await db.get(`SELECT * FROM ordens WHERE id = ? AND oficina_id = ?`, [ordemId, oficina_id]);

    if (!ordem) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    // Aqui você enviaria o orçamento via WhatsApp
    // Por enquanto, simular
    console.log(`Enviando orçamento da OS #${ordem.numero} para ${numeroDestino}`);

    res.json({ message: 'Orçamento enviado via WhatsApp' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar orçamento' });
  }
};
