import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

export default function Configuracoes() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('perfil');
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

  const handleThemeChange = (newTheme) => {
    if (newTheme === 'sistema') {
      localStorage.setItem('theme-mode', 'sistema');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    } else {
      localStorage.setItem('theme-mode', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      if (theme !== newTheme) toggleTheme();
    }
  };

  const currentThemeMode = localStorage.getItem('theme-mode') || theme;

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: 'fas fa-user' },
    { id: 'empresa', label: 'Empresa', icon: 'fas fa-building' },
    { id: 'unidades', label: 'Unidades', icon: 'fas fa-map-marker-alt' },
    { id: 'usuarios', label: 'Usuários', icon: 'fas fa-users' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Configurações</h1>
          <div className="page-header-sub">Gerencie dados da oficina e preferências do sistema</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              minWidth: 140,
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: tab === t.id ? '2px solid var(--red)' : 'none',
              color: tab === t.id ? 'var(--white)' : 'var(--muted)',
              fontWeight: tab === t.id ? 600 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className={t.icon}></i> {t.label}
          </button>
        ))}
      </div>

      {/* PERFIL TAB */}
      {tab === 'perfil' && (
        <div className="card" style={{ maxWidth: 800 }}>
          {saved && (
            <div style={{ background: 'rgba(46,196,182,.15)', border: '1px solid rgba(46,196,182,.3)', color: 'var(--green)', borderRadius: 8, padding: '11px 14px', marginBottom: 20, fontSize: '0.85rem' }}>
              ✓ Configurações salvas com sucesso
            </div>
          )}

          <form onSubmit={salvar}>
            {/* USER INFO */}
            <div style={{ marginBottom: 24 }}>
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

            {/* THEME SELECTOR */}
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)', marginBottom: 16 }}>Tema Visual</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { id: 'light', label: 'Claro', icon: 'fas fa-sun', desc: 'Tema claro para ambientes iluminados' },
                  { id: 'dark', label: 'Escuro', icon: 'fas fa-moon', desc: 'Tema escuro para conforto visual' },
                  { id: 'sistema', label: 'Sistema', icon: 'fas fa-circle-half-stroke', desc: 'Segue a preferência do SO' },
                ].map(option => (
                  <div
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    style={{
                      padding: 16,
                      border: currentThemeMode === option.id ? '2px solid var(--red)' : '1px solid var(--border)',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all .2s',
                      background: currentThemeMode === option.id ? 'rgba(230,57,70,.08)' : 'var(--dark3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <i className={`${option.icon}`} style={{ fontSize: '1.8rem', color: option.id === 'light' ? '#f4a261' : option.id === 'dark' ? '#6495ed' : 'var(--muted)' }}></i>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.9rem' }}>{option.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>{option.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i></> : <><i className="fas fa-check"></i> Salvar</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EMPRESA TAB */}
      {tab === 'empresa' && (
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
      )}

      {/* UNIDADES TAB */}
      {tab === 'unidades' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <i className="fas fa-map-marker-alt" style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.5 }}></i>
            <p style={{ marginBottom: 8 }}>Gerenciamento de unidades</p>
            <p style={{ fontSize: '0.85rem' }}>Configure múltiplas unidades/filiais da sua oficina</p>
          </div>
        </div>
      )}

      {/* USUÁRIOS TAB */}
      {tab === 'usuarios' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)' }}>Usuários da Oficina</h3>
            <button className="btn btn-primary btn-sm"><i className="fas fa-plus"></i> Novo Usuário</button>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <i className="fas fa-users" style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.5 }}></i>
            <p style={{ marginBottom: 8 }}>Gerencie usuários do sistema</p>
            <p style={{ fontSize: '0.85rem' }}>Vá para a página de Usuários para adicionar, editar ou remover usuários</p>
          </div>
        </div>
      )}
    </>
  );
}
