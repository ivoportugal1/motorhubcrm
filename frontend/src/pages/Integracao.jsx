import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Integracao() {
  const [config, setConfig] = useState({
    whatsapp_ativo: false,
    whatsapp_numero: '',
    whatsapp_token: '',
    smtp_ativo: false,
    smtp_host: '',
    smtp_usuario: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testeLoading, setTesteLoading] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await api.get('/integracao/config');
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };
    carregar();
  }, []);

  const handle = (e) => {
    const { name, value, type } = e.target;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? e.target.checked : value,
    });
  };

  const salvar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/integracao/config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const testarWhatsApp = async () => {
    if (!config.whatsapp_numero) {
      alert('Configure o número do WhatsApp primeiro');
      return;
    }
    setTesteLoading(true);
    try {
      await api.post('/integracao/whatsapp/teste', { numero: config.whatsapp_numero });
      alert('Mensagem de teste enviada!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao enviar teste');
    } finally {
      setTesteLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Integrações</h1>
          <div className="page-header-sub">Configure integrações externas</div>
        </div>
      </div>

      {saved && (
        <div style={{ background: 'rgba(46,196,182,.15)', border: '1px solid rgba(46,196,182,.3)', color: 'var(--green)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '0.85rem' }}>
          ✓ Configurações salvas com sucesso
        </div>
      )}

      <form onSubmit={salvar}>
        {/* WHATSAPP */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>
                <i className="fas fa-whatsapp" style={{ marginRight: 8, color: '#25d366' }}></i>
                WhatsApp Business
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
                Envie orçamentos e notificações via WhatsApp
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="whatsapp_ativo"
                name="whatsapp_ativo"
                checked={config.whatsapp_ativo}
                onChange={handle}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
              <label htmlFor="whatsapp_ativo" style={{ cursor: 'pointer', fontWeight: 600 }}>
                {config.whatsapp_ativo ? 'Ativo' : 'Inativo'}
              </label>
            </div>
          </div>

          {config.whatsapp_ativo && (
            <div style={{ background: 'var(--dark3)', padding: 16, borderRadius: 8, marginTop: 16 }}>
              <div className="form-group">
                <label>Número do WhatsApp *</label>
                <input
                  name="whatsapp_numero"
                  placeholder="+55 11 99999-9999"
                  value={config.whatsapp_numero}
                  onChange={handle}
                  disabled={!config.whatsapp_ativo}
                />
              </div>

              <div className="form-group">
                <label>Token da API (Twilio/Meta) *</label>
                <input
                  name="whatsapp_token"
                  type="password"
                  placeholder="Insira seu token"
                  value={config.whatsapp_token}
                  onChange={handle}
                  disabled={!config.whatsapp_ativo}
                />
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={testarWhatsApp}
                disabled={testeLoading}
              >
                {testeLoading ? <><i className="fas fa-spinner fa-spin"></i></> : <><i className="fas fa-paper-plane"></i> Enviar Teste</>}
              </button>

              <div style={{ background: 'rgba(100,149,237,.1)', border: '1px solid rgba(100,149,237,.3)', color: '#6495ed', borderRadius: 6, padding: 10, fontSize: '0.75rem', marginTop: 12 }}>
                <i className="fas fa-info-circle"></i> Use a API do Twilio (trial) ou Meta WhatsApp Business API para ativar
              </div>
            </div>
          )}
        </div>

        {/* EMAIL SMTP */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>
                <i className="fas fa-envelope" style={{ marginRight: 8, color: '#ff6b6b' }}></i>
                SMTP para E-mails
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
                Configure para enviar notificações por e-mail
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="smtp_ativo"
                name="smtp_ativo"
                checked={config.smtp_ativo}
                onChange={handle}
                style={{ width: 20, height: 20, cursor: 'pointer' }}
              />
              <label htmlFor="smtp_ativo" style={{ cursor: 'pointer', fontWeight: 600 }}>
                {config.smtp_ativo ? 'Ativo' : 'Inativo'}
              </label>
            </div>
          </div>

          {config.smtp_ativo && (
            <div style={{ background: 'var(--dark3)', padding: 16, borderRadius: 8, marginTop: 16 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Host SMTP *</label>
                  <input
                    name="smtp_host"
                    placeholder="smtp.gmail.com"
                    value={config.smtp_host}
                    onChange={handle}
                    disabled={!config.smtp_ativo}
                  />
                </div>
                <div className="form-group">
                  <label>Porta</label>
                  <input
                    name="smtp_porta"
                    type="number"
                    placeholder="587"
                    defaultValue="587"
                    disabled={!config.smtp_ativo}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Usuário/E-mail *</label>
                <input
                  name="smtp_usuario"
                  placeholder="seu-email@gmail.com"
                  value={config.smtp_usuario}
                  onChange={handle}
                  disabled={!config.smtp_ativo}
                />
              </div>

              <div className="form-group">
                <label>Senha *</label>
                <input
                  name="smtp_senha"
                  type="password"
                  placeholder="Senha de app"
                  disabled={!config.smtp_ativo}
                />
              </div>

              <div style={{ background: 'rgba(100,149,237,.1)', border: '1px solid rgba(100,149,237,.3)', color: '#6495ed', borderRadius: 6, padding: 10, fontSize: '0.75rem', marginTop: 12 }}>
                <i className="fas fa-info-circle"></i> Para Gmail, use Senha de App em Segurança da Conta
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><i className="fas fa-spinner fa-spin"></i></> : <><i className="fas fa-check"></i> Salvar Integrações</>}
          </button>
        </div>
      </form>
    </>
  );
}
