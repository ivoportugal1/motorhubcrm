import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const fmtDate = (d) => {
  if (!d) return '—';
  try {
    const date = new Date(d + 'T00:00:00');
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
};
const today = () => new Date().toISOString().split('T')[0];
const emptyForm = { tipo: 'receita', descricao: '', categoria: '', tipo_despesa: '', usuario_id: '', valor: '', data_vencimento: today(), status: 'pendente' };

const abas = [
  { key: 'todos', label: 'Todos' },
  { key: 'receita', label: 'A Receber' },
  { key: 'despesa', label: 'A Pagar' },
];

export default function Contas() {
  const navigate = useNavigate();
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [aba, setAba] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const params = { busca };
    if (aba !== 'todos') params.tipo = aba;
    if (statusFiltro) params.status = statusFiltro;
    const [l, r, u] = await Promise.all([api.get('/financeiro', { params }), api.get('/financeiro/resumo'), api.get('/usuarios')]);
    setLancamentos(l.data);
    setResumo(r.data);
    setUsuarios(u.data || []);
  };

  useEffect(() => { load(); }, [aba, statusFiltro, busca]);

  const openNovo = () => { setForm(emptyForm); setEditando(null); setModal(true); };
  const openEditar = (l) => { setForm({ tipo: l.tipo, descricao: l.descricao, categoria: l.categoria || '', tipo_despesa: l.tipo_despesa || '', usuario_id: l.usuario_id || '', valor: l.valor, data_vencimento: l.data_vencimento || today(), status: l.status }); setEditando(l.id); setModal(true); };
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { editando ? await api.put(`/financeiro/${editando}`, form) : await api.post('/financeiro', form); setModal(false); load(); }
    catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const pagar = async (id) => { await api.patch(`/financeiro/${id}/pagar`); load(); };
  const deletar = async (id) => { if (!confirm('Excluir?')) return; await api.delete(`/financeiro/${id}`); load(); };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/financeiro')}><i className="fas fa-arrow-left"></i></button>
          <div><h1>Contas — Pagar / Receber</h1></div>
        </div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Novo Lançamento</button>
      </div>

      {resumo && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card"><div className="stat-icon green"><i className="fas fa-arrow-up"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(resumo.receitas_mes)}</div><div className="stat-label">Receitas do mês</div></div></div>
          <div className="stat-card"><div className="stat-icon red"><i className="fas fa-arrow-down"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(resumo.despesas_mes)}</div><div className="stat-label">Despesas do mês</div></div></div>
          <div className="stat-card"><div className="stat-icon" style={{ background: resumo.lucro_mes >= 0 ? 'rgba(46,196,182,.15)' : 'rgba(230,57,70,.15)', color: resumo.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)' }}><i className="fas fa-balance-scale"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem', color: resumo.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(resumo.lucro_mes)}</div><div className="stat-label">Lucro do mês</div></div></div>
          <div className="stat-card"><div className="stat-icon yellow"><i className="fas fa-clock"></i></div><div><div className="stat-value" style={{ fontSize: '1rem' }}>{fmt(resumo.a_receber.total)}</div><div className="stat-label">A receber ({resumo.a_receber.qtd})</div></div></div>
        </div>
      )}

      <div className="filters">
        <input placeholder="Buscar descrição ou categoria..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="atrasado">Atrasado</option>
          <option value="pago">Pago</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="status-tabs" style={{ marginBottom: 16 }}>
        {abas.map(a => <button key={a.key} className={`status-tab${aba === a.key ? ' active' : ''}`} onClick={() => setAba(a.key)}>{a.label}</button>)}
      </div>

      <div className="card">
        {lancamentos.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhum lançamento encontrado.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Vencimento</th><th>Pagamento</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {lancamentos.map(l => (
                    <tr key={l.id}>
                      <td><span style={{ color: l.tipo === 'receita' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '0.8rem' }}><i className={`fas fa-arrow-${l.tipo === 'receita' ? 'up' : 'down'}`} style={{ marginRight: 4 }}></i>{l.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
                      <td><strong>{l.descricao}</strong></td>
                      <td>{l.categoria || '—'}</td>
                      <td style={{ color: l.tipo === 'receita' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{fmt(l.valor)}</td>
                      <td>{fmtDate(l.data_vencimento)}</td>
                      <td>{fmtDate(l.data_pagamento)}</td>
                      <td><span className={`badge badge-${l.status === 'pago' ? 'finalizada' : l.status === 'cancelado' ? 'cancelada' : l.status === 'atrasado' ? 'cancelada' : 'orcamento'}`} style={l.status === 'atrasado' ? { background: 'rgba(230,57,70,0.2)', color: 'var(--red)', border: '1px solid var(--red)' } : {}}>{l.status === 'pago' ? 'Pago' : l.status === 'cancelado' ? 'Cancelado' : l.status === 'atrasado' ? '⚠️ Atrasado' : 'Pendente'}</span></td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        {l.status === 'pendente' && <button className="btn btn-outline btn-sm" title="Pagar" onClick={() => pagar(l.id)}><i className="fas fa-check"></i></button>}
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditar(l)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(l.id)}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header"><h3>{editando ? 'Editar Lançamento' : 'Novo Lançamento'}</h3><button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Tipo *</label><select name="tipo" value={form.tipo} onChange={handle}><option value="receita">Receita</option><option value="despesa">Despesa</option></select></div>
                  <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handle}><option value="pendente">Pendente</option><option value="atrasado">Atrasado</option><option value="pago">Pago</option><option value="cancelado">Cancelado</option></select></div>
                </div>

                {form.tipo === 'despesa' && (
                  <div className="form-group">
                    <label>Tipo de Despesa</label>
                    <select name="tipo_despesa" value={form.tipo_despesa} onChange={handle}>
                      <option value="">Selecionar tipo...</option>
                      <option value="operacional">Operacional</option>
                      <option value="funcionario">Pagamento de Funcionário</option>
                      <option value="outras">Outras</option>
                    </select>
                  </div>
                )}

                {form.tipo === 'despesa' && form.tipo_despesa === 'funcionario' && (
                  <div className="form-group">
                    <label>Funcionário *</label>
                    <select name="usuario_id" value={form.usuario_id} onChange={handle} required>
                      <option value="">Selecionar funcionário...</option>
                      {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                  </div>
                )}

                <div className="form-group"><label>Descrição *</label><input name="descricao" placeholder={form.tipo === 'despesa' && form.tipo_despesa === 'funcionario' ? 'Ex: Salário, Adiantamento...' : 'Ex: Pagamento OS #1027'} value={form.descricao} onChange={handle} required /></div>
                <div className="form-row">
                  {!(form.tipo === 'despesa' && form.tipo_despesa === 'funcionario') && (
                    <div className="form-group"><label>Categoria</label><input name="categoria" placeholder="Ex: Serviços, Peças..." value={form.categoria} onChange={handle} /></div>
                  )}
                  <div className="form-group" style={{ flex: form.tipo === 'despesa' && form.tipo_despesa === 'funcionario' ? '1' : undefined }}><label>Valor *</label><input name="valor" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={handle} required /></div>
                </div>
                <div className="form-group"><label>Data de vencimento</label><input name="data_vencimento" type="date" value={form.data_vencimento} onChange={handle} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><i className="fas fa-spinner fa-spin"></i></> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
