import { useEffect, useState } from 'react';
import api from '../services/api';

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
const emptyForm = { veiculo_id: '', cliente_id: '', tipo_servico: '', km_atual: '', km_proximo: '', data_ultimo: '', data_proximo: '', observacoes: '' };

export default function Manutencao() {
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [aba, setAba] = useState('agenda');
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [m, v, c, a] = await Promise.all([
      api.get('/manutencoes', { params: { busca } }),
      api.get('/veiculos'),
      api.get('/clientes'),
      api.get('/manutencoes/alertas'),
    ]);
    setManutencoes(m.data);
    setVeiculos(v.data);
    setClientes(c.data);
    setAlertas(a.data);
  };

  useEffect(() => { load(); }, [busca]);

  const openNovo = () => { setForm(emptyForm); setEditando(null); setModal(true); };
  const openEditar = (m) => {
    setForm({ veiculo_id: m.veiculo_id, cliente_id: m.cliente_id || '', tipo_servico: m.tipo_servico, km_atual: m.km_atual, km_proximo: m.km_proximo, data_ultimo: m.data_ultimo || '', data_proximo: m.data_proximo || '', observacoes: m.observacoes || '' });
    setEditando(m.id); setModal(true);
  };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onVeiculoChange = (e) => {
    const v = veiculos.find(v => v.id == e.target.value);
    setForm({ ...form, veiculo_id: e.target.value, cliente_id: v?.cliente_id || '', km_atual: v?.km_atual || '' });
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editando ? await api.put(`/manutencoes/${editando}`, form) : await api.post('/manutencoes', form);
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir este agendamento?')) return;
    await api.delete(`/manutencoes/${id}`); load();
  };

  const lista = aba === 'agenda' ? manutencoes : alertas;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Manutenção Preventiva</h1>
          <div className="page-header-sub">
            Total: {manutencoes.length}
            {alertas.length > 0 && <span style={{ color: 'var(--red)', marginLeft: 10, fontWeight: 600 }}><i className="fas fa-bell"></i> {alertas.length} alertas</span>}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Novo Agendamento</button>
      </div>

      <div className="status-tabs" style={{ marginBottom: 16 }}>
        <button className={`status-tab${aba === 'agenda' ? ' active' : ''}`} onClick={() => setAba('agenda')}>
          <i className="fas fa-calendar-alt"></i> Agenda
        </button>
        <button className={`status-tab${aba === 'alertas' ? ' active' : ''}`} onClick={() => setAba('alertas')} style={{ position: 'relative' }}>
          <i className="fas fa-exclamation-triangle"></i> Alerta de manutenção
          {alertas.length > 0 && <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>{alertas.length}</span>}
        </button>
      </div>

      <div className="filters">
        <input placeholder="Buscar por placa, cliente ou tipo de serviço..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="card">
        {lista.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{aba === 'alertas' ? 'Nenhum alerta de manutenção.' : 'Nenhum agendamento cadastrado.'}</p>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Vida útil</th><th>KM Rodada</th><th>Próx. Data</th><th>Situação</th><th></th></tr>
                </thead>
                <tbody>
                  {lista.map(m => {
                    const alertaKm = m.km_proximo && m.veiculo_km >= m.km_proximo;
                    const alertaData = m.data_proximo && m.data_proximo <= today();
                    return (
                      <tr key={m.id}>
                        <td>{m.cliente_nome || '—'}</td>
                        <td><strong style={{ color: 'var(--red)' }}>{m.placa}</strong> {m.modelo ? `| ${m.modelo}` : ''}</td>
                        <td>{m.tipo_servico}</td>
                        <td>
                          {m.km_proximo ? <span>até {m.km_proximo.toLocaleString('pt-BR')} km</span> : '—'}
                          {m.data_proximo && <><br /><small style={{ color: 'var(--muted)' }}>{fmtDate(m.data_proximo)}</small></>}
                        </td>
                        <td>{m.veiculo_km ? m.veiculo_km.toLocaleString('pt-BR') + ' km' : '—'}</td>
                        <td>{fmtDate(m.data_proximo)}</td>
                        <td>
                          {(alertaKm || alertaData)
                            ? <span className="badge badge-cancelada"><i className="fas fa-exclamation-triangle"></i> Vencida</span>
                            : <span className="badge badge-andamento">Em dia</span>
                          }
                        </td>
                        <td style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditar(m)}><i className="fas fa-edit"></i></button>
                          <button className="btn btn-danger btn-sm" onClick={() => deletar(m.id)}><i className="fas fa-trash"></i></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Veículo *</label>
                    <select name="veiculo_id" value={form.veiculo_id} onChange={onVeiculoChange} required>
                      <option value="">Selecionar veículo...</option>
                      {veiculos.map(v => <option key={v.id} value={v.id}>{v.placa} — {v.modelo || v.marca || ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Cliente</label>
                    <select name="cliente_id" value={form.cliente_id} onChange={handle}>
                      <option value="">Selecionar cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Tipo de Serviço *</label>
                  <input name="tipo_servico" placeholder="Ex: Troca de óleo, Revisão, Filtros..." value={form.tipo_servico} onChange={handle} required />
                </div>
                <div className="form-row">
                  <div className="form-group"><label>KM Atual</label><input name="km_atual" type="number" placeholder="85000" value={form.km_atual} onChange={handle} /></div>
                  <div className="form-group"><label>Próxima revisão (KM)</label><input name="km_proximo" type="number" placeholder="95000" value={form.km_proximo} onChange={handle} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Último serviço</label><input name="data_ultimo" type="date" value={form.data_ultimo} onChange={handle} /></div>
                  <div className="form-group"><label>Próxima data</label><input name="data_proximo" type="date" value={form.data_proximo} onChange={handle} /></div>
                </div>
                <div className="form-group"><label>Observações</label><input name="observacoes" placeholder="Detalhes do serviço..." value={form.observacoes} onChange={handle} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
