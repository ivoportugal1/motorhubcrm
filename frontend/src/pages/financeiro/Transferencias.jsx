import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const today = () => new Date().toISOString().split('T')[0];
const formatData = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
};
const emptyForm = { descricao: '', valor: '', conta_origem: '', conta_destino: '', data: today() };

export default function Transferencias() {
  const navigate = useNavigate();
  const [transferencias, setTransferencias] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => { const { data } = await api.get('/transferencias'); setTransferencias(data); };
  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/transferencias', form); setModal(false); setForm(emptyForm); load(); }
    catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const deletar = async (id) => { if (!confirm('Excluir?')) return; await api.delete(`/transferencias/${id}`); load(); };

  const total = transferencias.reduce((s, t) => s + t.valor, 0);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/financeiro')}><i className="fas fa-arrow-left"></i></button>
          <div><h1>Transferências</h1><div className="page-header-sub">{transferencias.length} registros — Total: {fmt(total)}</div></div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-plus"></i> Nova Transferência</button>
      </div>

      <div className="card">
        {transferencias.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma transferência registrada.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Data</th><th>Descrição</th><th>Origem</th><th>Destino</th><th>Valor</th><th></th></tr></thead>
                <tbody>
                  {transferencias.map(t => (
                    <tr key={t.id}>
                      <td>{formatData(t.data)}</td>
                      <td><strong>{t.descricao}</strong></td>
                      <td>{t.conta_origem || '—'}</td>
                      <td>{t.conta_destino || '—'}</td>
                      <td style={{ color: 'var(--yellow)', fontWeight: 600 }}>{fmt(t.valor)}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deletar(t.id)}><i className="fas fa-trash"></i></button></td>
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
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Nova Transferência</h3><button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group"><label>Descrição *</label><input name="descricao" placeholder="Ex: Transferência para conta corrente" value={form.descricao} onChange={handle} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Conta origem</label><input name="conta_origem" placeholder="Ex: Caixa, Conta X" value={form.conta_origem} onChange={handle} /></div>
                  <div className="form-group"><label>Conta destino</label><input name="conta_destino" placeholder="Ex: Banco Y" value={form.conta_destino} onChange={handle} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Valor *</label><input name="valor" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={handle} required /></div>
                  <div className="form-group"><label>Data</label><input name="data" type="date" value={form.data} onChange={handle} /></div>
                </div>
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
