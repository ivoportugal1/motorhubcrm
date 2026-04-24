import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const today = () => new Date().toISOString().split('T')[0];
const emptyMov = { tipo: 'entrada', descricao: '', valor: '', forma_pagamento: 'dinheiro' };

export default function Caixa() {
  const navigate = useNavigate();
  const [caixa, setCaixa] = useState(undefined);
  const [historico, setHistorico] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalAbrir, setModalAbrir] = useState(false);
  const [form, setForm] = useState(emptyMov);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [c, h] = await Promise.all([api.get('/caixa/atual'), api.get('/caixa/historico')]);
    setCaixa(c.data);
    setHistorico(h.data);
  };

  useEffect(() => { load(); }, []);

  const abrir = async () => {
    setSaving(true);
    try { await api.post('/caixa/abrir', { saldo_inicial: saldoInicial || 0 }); setModalAbrir(false); load(); }
    catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const fechar = async () => {
    if (!confirm('Fechar o caixa de hoje?')) return;
    await api.post('/caixa/fechar'); load();
  };

  const addMov = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/caixa/movimentos', form); setModal(false); setForm(emptyMov); load(); }
    catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const delMov = async (id) => {
    if (!confirm('Excluir movimento?')) return;
    await api.delete(`/caixa/movimentos/${id}`); load();
  };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/financeiro')}><i className="fas fa-arrow-left"></i></button>
          <div><h1>Caixa</h1><div className="page-header-sub">{today()}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {caixa
            ? <><button className="btn btn-primary" onClick={() => setModal(true)}><i className="fas fa-plus"></i> Novo Movimento</button>
                <button className="btn btn-danger" onClick={fechar}><i className="fas fa-lock"></i> Fechar Caixa</button></>
            : <button className="btn btn-primary" onClick={() => setModalAbrir(true)}><i className="fas fa-lock-open"></i> Abrir Caixa</button>
          }
        </div>
      </div>

      {caixa === undefined ? (
        <p style={{ color: 'var(--muted)' }}><i className="fas fa-spinner fa-spin"></i> Carregando...</p>
      ) : caixa === null ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: 'var(--muted)', marginBottom: 16 }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: 8 }}>Caixa fechado</h3>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Nenhum caixa aberto hoje. Clique em "Abrir Caixa" para começar.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card"><div className="stat-icon blue"><i className="fas fa-wallet"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(caixa.saldo_inicial)}</div><div className="stat-label">Saldo inicial</div></div></div>
            <div className="stat-card"><div className="stat-icon green"><i className="fas fa-arrow-up"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(caixa.entradas)}</div><div className="stat-label">Entradas</div></div></div>
            <div className="stat-card"><div className="stat-icon red"><i className="fas fa-arrow-down"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(caixa.saidas)}</div><div className="stat-label">Saídas</div></div></div>
            <div className="stat-card"><div className="stat-icon yellow"><i className="fas fa-coins"></i></div><div><div className="stat-value" style={{ fontSize: '1.1rem', color: caixa.saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(caixa.saldo)}</div><div className="stat-label">Saldo atual</div></div></div>
          </div>
          <div className="card">
            <div className="card-title">Movimentos de hoje</div>
            {caixa.movimentos.length === 0
              ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhum movimento registrado.</p>
              : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Tipo</th><th>Descrição</th><th>Forma</th><th>Valor</th><th></th></tr></thead>
                    <tbody>
                      {caixa.movimentos.map(m => (
                        <tr key={m.id}>
                          <td><span style={{ color: m.tipo === 'entrada' ? 'var(--green)' : 'var(--red)', fontWeight: 600, fontSize: '0.8rem' }}><i className={`fas fa-arrow-${m.tipo === 'entrada' ? 'up' : 'down'}`} style={{ marginRight: 4 }}></i>{m.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span></td>
                          <td>{m.descricao}</td>
                          <td style={{ textTransform: 'capitalize' }}>{m.forma_pagamento}</td>
                          <td style={{ color: m.tipo === 'entrada' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{fmt(m.valor)}</td>
                          <td><button className="btn btn-danger btn-sm" onClick={() => delMov(m.id)}><i className="fas fa-trash"></i></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </>
      )}

      {historico.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">Histórico</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data</th><th>Status</th><th>Saldo Inicial</th><th>Saldo Final</th></tr></thead>
              <tbody>
                {historico.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td><span className={`badge ${h.status === 'aberto' ? 'badge-andamento' : 'badge-finalizada'}`}>{h.status === 'aberto' ? 'Aberto' : 'Fechado'}</span></td>
                    <td>{fmt(h.saldo_inicial)}</td>
                    <td>{h.saldo_final != null ? fmt(h.saldo_final) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAbrir && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalAbrir(false)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header"><h3>Abrir Caixa</h3><button className="btn btn-ghost btn-sm" onClick={() => setModalAbrir(false)}><i className="fas fa-times"></i></button></div>
            <div className="modal-body">
              <div className="form-group"><label>Saldo inicial (R$)</label><input type="number" step="0.01" placeholder="0,00" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalAbrir(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={abrir} disabled={saving}>{saving ? <><i className="fas fa-spinner fa-spin"></i></> : 'Abrir Caixa'}</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Novo Movimento</h3><button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button></div>
            <form onSubmit={addMov}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Tipo</label><select name="tipo" value={form.tipo} onChange={handle}><option value="entrada">Entrada</option><option value="saida">Saída</option></select></div>
                  <div className="form-group"><label>Forma de pagamento</label><select name="forma_pagamento" value={form.forma_pagamento} onChange={handle}><option value="dinheiro">Dinheiro</option><option value="pix">PIX</option><option value="cartao_credito">Cartão Crédito</option><option value="cartao_debito">Cartão Débito</option><option value="boleto">Boleto</option></select></div>
                </div>
                <div className="form-group"><label>Descrição *</label><input name="descricao" placeholder="Ex: Pagamento OS #1027" value={form.descricao} onChange={handle} required /></div>
                <div className="form-group"><label>Valor *</label><input name="valor" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={handle} required /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><i className="fas fa-spinner fa-spin"></i></> : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
