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
  const [modalUsuario, setModalUsuario] = useState(false);
  const [formUsuario, setFormUsuario] = useState({ nome: '', email: '', role: 'mecanico', senha: '' });
  const [savingUsuario, setSavingUsuario] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [modalUnidade, setModalUnidade] = useState(false);
  const [formUnidade, setFormUnidade] = useState({ nome: '', endereco: '', cidade: '', uf: '' });
  const [savingUnidade, setSavingUnidade] = useState(false);
  const [editandoUnidade, setEditandoUnidade] = useState(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const { data } = await api.get('/oficina/config');
        setConfig(data);
      } catch (err) {
        console.error(err);
      }
    };
    const carregarUnidades = async () => {
      try {
        const { data } = await api.get('/unidades');
        setUnidades(data);
      } catch (err) {
        console.error('Erro ao carregar unidades:', err);
      }
    };
    carregar();
    carregarUnidades();
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

  const salvarUsuario = async (e) => {
    e.preventDefault();
    if (!formUsuario.senha || formUsuario.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setSavingUsuario(true);
    try {
      await api.post('/usuarios', formUsuario);
      setFormUsuario({ nome: '', email: '', role: 'mecanico', senha: '' });
      setModalUsuario(false);
      alert('Usuário criado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setSavingUsuario(false);
    }
  };

  const salvarUnidade = async (e) => {
    e.preventDefault();
    if (!formUnidade.nome) {
      alert('Nome é obrigatório');
      return;
    }
    setSavingUnidade(true);
    try {
      if (editandoUnidade) {
        await api.put(`/unidades/${editandoUnidade}`, formUnidade);
      } else {
        await api.post('/unidades', formUnidade);
      }
      const { data } = await api.get('/unidades');
      setUnidades(data);
      setFormUnidade({ nome: '', endereco: '', cidade: '', uf: '' });
      setModalUnidade(false);
      setEditandoUnidade(null);
      alert(editandoUnidade ? 'Unidade atualizada!' : 'Unidade criada!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar unidade');
    } finally {
      setSavingUnidade(false);
    }
  };

  const deletarUnidade = async (id) => {
    if (!confirm('Deletar esta unidade?')) return;
    try {
      await api.delete(`/unidades/${id}`);
      setUnidades(unidades.filter(u => u.id !== id));
      alert('Unidade deletada!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao deletar unidade');
    }
  };

  const editarUnidade = (u) => {
    setFormUnidade({ nome: u.nome, endereco: u.endereco, cidade: u.cidade, uf: u.uf });
    setEditandoUnidade(u.id);
    setModalUnidade(true);
  };

  const novaUnidade = () => {
    setFormUnidade({ nome: '', endereco: '', cidade: '', uf: '' });
    setEditandoUnidade(null);
    setModalUnidade(true);
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)' }}>Unidades/Filiais</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={novaUnidade}
            >
              <i className="fas fa-plus"></i> Nova Unidade
            </button>
          </div>

          {unidades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <i className="fas fa-map-marker-alt" style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.5 }}></i>
              <p style={{ marginBottom: 8 }}>Nenhuma unidade cadastrada</p>
              <p style={{ fontSize: '0.85rem' }}>Clique em "Nova Unidade" para adicionar uma filial</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {unidades.map(u => (
                <div
                  key={u.id}
                  style={{
                    background: 'var(--dark3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 16,
                    alignItems: 'start'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--white)', marginBottom: 8 }}>{u.nome}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>
                      <i className="fas fa-map-marker-alt" style={{ marginRight: 6 }}></i>
                      {u.endereco}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {u.cidade}, {u.uf}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => editarUnidade(u)}><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => deletarUnidade(u.id)}><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USUÁRIOS TAB */}
      {tab === 'usuarios' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--white)' }}>Usuários da Oficina</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalUsuario(true)}
            >
              <i className="fas fa-plus"></i> Novo Usuário
            </button>
          </div>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
            <i className="fas fa-users" style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.5 }}></i>
            <p style={{ marginBottom: 8 }}>Gerencie usuários do sistema</p>
            <p style={{ fontSize: '0.85rem' }}>Clique em "Novo Usuário" para criar uma conta ou vá para a página de Usuários para ver todos</p>
          </div>
        </div>
      )}

      {/* MODAL NOVO USUÁRIO */}
      {modalUsuario && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalUsuario(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Novo Usuário</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalUsuario(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={salvarUsuario}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    name="nome"
                    placeholder="Nome completo"
                    value={formUsuario.nome}
                    onChange={e => setFormUsuario({ ...formUsuario, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>E-mail *</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="usuario@email.com"
                    value={formUsuario.email}
                    onChange={e => setFormUsuario({ ...formUsuario, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Função *</label>
                  <select
                    name="role"
                    value={formUsuario.role}
                    onChange={e => setFormUsuario({ ...formUsuario, role: e.target.value })}
                    required
                  >
                    {user?.role === 'admin' ? (
                      <>
                        <option value="recepcionista">📞 Recepcionista</option>
                        <option value="mecanico">🔧 Mecânico</option>
                        <option value="gerente">📊 Gerente</option>
                        <option value="admin">👑 Administrador</option>
                      </>
                    ) : (
                      <>
                        <option value="recepcionista">📞 Recepcionista</option>
                        <option value="mecanico">🔧 Mecânico</option>
                        <option value="gerente">📊 Gerente</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Senha *</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formUsuario.senha}
                    onChange={e => setFormUsuario({ ...formUsuario, senha: e.target.value })}
                    required
                    minLength="6"
                  />
                </div>

                <div style={{ background: 'rgba(46,196,182,.1)', border: '1px solid rgba(46,196,182,.3)', color: '#2ec4b6', borderRadius: 8, padding: 12, fontSize: '0.85rem' }}>
                  <i className="fas fa-lock"></i> A senha será definida agora pelo administrador
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalUsuario(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingUsuario}>
                  {savingUsuario ? <><i className="fas fa-spinner fa-spin"></i></> : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA/EDITAR UNIDADE */}
      {modalUnidade && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalUnidade(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editandoUnidade ? 'Editar Unidade' : 'Nova Unidade/Filial'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalUnidade(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={salvarUnidade}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome da Unidade *</label>
                  <input
                    placeholder="Ex: Oficina Principal"
                    value={formUnidade.nome}
                    onChange={e => setFormUnidade({ ...formUnidade, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Endereço *</label>
                  <input
                    placeholder="Rua, número"
                    value={formUnidade.endereco}
                    onChange={e => setFormUnidade({ ...formUnidade, endereco: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cidade *</label>
                    <input
                      placeholder="São Paulo"
                      value={formUnidade.cidade}
                      onChange={e => setFormUnidade({ ...formUnidade, cidade: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>UF *</label>
                    <input
                      placeholder="SP"
                      maxLength="2"
                      value={formUnidade.uf}
                      onChange={e => setFormUnidade({ ...formUnidade, uf: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalUnidade(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingUnidade}>
                  {savingUnidade ? <><i className="fas fa-spinner fa-spin"></i></> : editandoUnidade ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
