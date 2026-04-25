import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Configuracoes() {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    uf: '',
    cep: '',
    cnpj: '',
    inscricao_estadual: '',
    horario_abertura: '',
    horario_fechamento: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await api.get('/oficina/config');
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };
    carregar();
  }, []);

  const handle = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

  const salvar = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/oficina/config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Configurações</h1>
          <div className="page-header-sub">Dados da oficina e preferências</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        {saved && (
          <div style={{ background: 'rgba(46,196,182,.15)', border: '1px solid rgba(46,196,182,.3)', color: 'var(--green)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '0.85rem' }}>
            ✓ Configurações salvas com sucesso
          </div>
        )}

        <form onSubmit={salvar}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Dados da Oficina</h3>

            <div className="form-group">
              <label>Nome da Oficina *</label>
              <input name="nome" value={config.nome} onChange={handle} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={config.email} onChange={handle} />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input name="telefone" value={config.telefone} onChange={handle} placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <input name="endereco" value={config.endereco} onChange={handle} placeholder="Rua, número" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cidade</label>
                <input name="cidade" value={config.cidade} onChange={handle} />
              </div>
              <div className="form-group">
                <label>UF</label>
                <input name="uf" value={config.uf} onChange={handle} maxLength="2" />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <input name="cep" value={config.cep} onChange={handle} placeholder="00000-000" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Dados Fiscais</h3>

            <div className="form-row">
              <div className="form-group">
                <label>CNPJ</label>
                <input name="cnpj" value={config.cnpj} onChange={handle} placeholder="00.000.000/0000-00" />
              </div>
              <div className="form-group">
                <label>Inscrição Estadual</label>
                <input name="inscricao_estadual" value={config.inscricao_estadual} onChange={handle} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Horário de Funcionamento</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Abertura</label>
                <input name="horario_abertura" type="time" value={config.horario_abertura} onChange={handle} />
              </div>
              <div className="form-group">
                <label>Fechamento</label>
                <input name="horario_fechamento" type="time" value={config.horario_fechamento} onChange={handle} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin"></i></> : <><i className="fas fa-check"></i> Salvar Configurações</>}
            </button>
          </div>
        </form>
      </div>

      {/* USER INFO */}
      <div className="card" style={{ maxWidth: 800, marginTop: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Informações da Conta</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>NOME</div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>{user?.nome || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>EMAIL</div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>{user?.email || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>PLANO</div>
            <div style={{ color: 'var(--green)', fontWeight: 600, textTransform: 'capitalize' }}>{user?.plano || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>DATA DE CADASTRO</div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>
              {user?.criado_em ? new Date(user.criado_em).toLocaleDateString('pt-BR') : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
