import { useEffect, useState } from 'react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const statusLabel = { todas: 'Todas', pre_orcamento: 'Pré Orç.', orcamento: 'Orçamento', andamento: 'Andamento', finalizada: 'Finalizada', faturada: 'Faturada', cancelada: 'Cancelada' };
const statusList = Object.keys(statusLabel);

const emptyForm = { cliente_nome: '', placa: '', modelo: '', km: '', tipo: 'oficina', observacoes: '', itens: [] };
const emptyItem = { descricao: '', tipo: 'servico', quantidade: 1, valor_unitario: '' };

export default function Ordens() {
  const [ordens, setOrdens] = useState([]);
  const [meta, setMeta] = useState({ quantidade: 0, total: 0 });
  const [status, setStatus] = useState('todas');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { busca };
      if (status !== 'todas') params.status = status;
      const { data } = await api.get('/ordens', { params });
      setOrdens(data.ordens);
      setMeta({ quantidade: data.quantidade, total: data.total });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, busca]);

  const openModal = () => { setForm(emptyForm); setModal(true); };
  const closeModal = () => setModal(false);

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addItem = () => setForm({ ...form, itens: [...form.itens, { ...emptyItem }] });
  const removeItem = (i) => setForm({ ...form, itens: form.itens.filter((_, idx) => idx !== i) });
  const handleItem = (i, field, value) => {
    const itens = [...form.itens];
    itens[i] = { ...itens[i], [field]: value };
    setForm({ ...form, itens });
  };

  const totalItens = form.itens.reduce((s, i) => s + ((+i.quantidade || 0) * (+i.valor_unitario || 0)), 0);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/ordens', {
        km: form.km,
        tipo: form.tipo,
        observacoes: form.observacoes,
        itens: form.itens.map(i => ({ ...i, quantidade: +i.quantidade, valor_unitario: +i.valor_unitario }))
      });
      setModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, novoStatus) => {
    await api.patch(`/ordens/${id}/status`, { status: novoStatus });
    load();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Ordens de Serviço</h1>
          <div className="page-header-sub">
            {meta.quantidade} ordens &nbsp;|&nbsp; Total: {fmt(meta.total)}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <i className="fas fa-plus"></i> Nova OS
        </button>
      </div>

      <div className="filters">
        <input placeholder="Buscar por cliente, placa ou número..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="status-tabs">
        {statusList.map(s => (
          <button key={s} className={`status-tab${status === s ? ' active' : ''}`} onClick={() => setStatus(s)}>
            {statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="card">
        {loading
          ? <p style={{ color: 'var(--muted)' }}><i className="fas fa-spinner fa-spin"></i> Carregando...</p>
          : ordens.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma ordem encontrada.</p>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Abertura</th><th>Finalização</th><th>Número</th><th>Cliente</th><th>Veículo</th><th>KM</th><th>Valor</th><th>Status</th><th></th></tr>
                  </thead>
                  <tbody>
                    {ordens.map(o => (
                      <tr key={o.id}>
                        <td>{o.data_abertura ? new Date(o.data_abertura).toLocaleDateString('pt-BR') : '—'}</td>
                        <td>{o.data_finalizacao ? new Date(o.data_finalizacao).toLocaleDateString('pt-BR') : '—'}</td>
                        <td><strong style={{ color: 'var(--red)' }}>{o.numero}</strong></td>
                        <td>{o.cliente_nome || '—'}</td>
                        <td>{o.placa ? `${o.placa} | ${o.modelo || ''}` : '—'}</td>
                        <td>{o.km || '—'}</td>
                        <td>{fmt(o.valor_total)}</td>
                        <td><span className={`badge badge-${o.status}`}>{statusLabel[o.status]}</span></td>
                        <td>
                          <select
                            style={{ background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, padding: '4px 8px', fontSize: '0.78rem' }}
                            value={o.status}
                            onChange={e => changeStatus(o.id, e.target.value)}
                          >
                            {statusList.filter(s => s !== 'todas').map(s => (
                              <option key={s} value={s}>{statusLabel[s]}</option>
                            ))}
                          </select>
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>Nova Ordem de Serviço</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo</label>
                    <select name="tipo" value={form.tipo} onChange={handleForm}>
                      <option value="oficina">Oficina</option>
                      <option value="loja">Loja</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>KM atual</label>
                    <input name="km" type="number" placeholder="Ex: 85000" value={form.km} onChange={handleForm} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Observações</label>
                  <input name="observacoes" placeholder="Observações sobre o serviço..." value={form.observacoes} onChange={handleForm} />
                </div>

                <div className="items-section">
                  <h4>Itens / Serviços</h4>
                  {form.itens.map((item, i) => (
                    <div key={i} className="item-row">
                      <input placeholder="Descrição do serviço ou peça" value={item.descricao} onChange={e => handleItem(i, 'descricao', e.target.value)} />
                      <input type="number" placeholder="Qtd" style={{ width: 60 }} value={item.quantidade} onChange={e => handleItem(i, 'quantidade', e.target.value)} />
                      <input type="number" placeholder="Valor unit." style={{ width: 110 }} value={item.valor_unitario} onChange={e => handleItem(i, 'valor_unitario', e.target.value)} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}><i className="fas fa-trash"></i></button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" onClick={addItem} style={{ marginTop: 8 }}>
                    <i className="fas fa-plus"></i> Adicionar item
                  </button>
                  {form.itens.length > 0 && (
                    <div style={{ marginTop: 12, textAlign: 'right', color: 'var(--white)', fontWeight: 700 }}>
                      Total: {fmt(totalItens)}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : 'Criar OS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
