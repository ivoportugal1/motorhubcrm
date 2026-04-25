import { useEffect, useState } from 'react';
import api from '../services/api';

const empty = { nome: '', descricao: '', valor_padrao: '', categoria: 'servico' };

export default function ModelosServicos() {
  const [modelos, setModelos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/modelos-servicos');
    setModelos(data);
  };

  useEffect(() => { load(); }, []);

  const openNovo = () => { setForm(empty); setEditando(null); setModal(true); };
  const openEditar = (m) => { setForm({ nome: m.nome, descricao: m.descricao, valor_padrao: m.valor_padrao, categoria: m.categoria }); setEditando(m.id); setModal(true); };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editando ? await api.put(`/modelos-servicos/${editando}`, form) : await api.post('/modelos-servicos', form);
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir este modelo?')) return;
    try {
      await api.delete(`/modelos-servicos/${id}`);
      load();
    } catch (err) {
      alert('Erro ao deletar');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Modelos de Serviços</h1>
          <div className="page-header-sub">Templates para agilizar a criação de ordens</div>
        </div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Novo Modelo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {modelos.map(m => (
          <div key={m.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div>
                <h3 style={{ color: 'var(--white)', fontWeight: 700, margin: 0, marginBottom: 4, fontSize: '1rem' }}>
                  {m.nome}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {m.categoria}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEditar(m)}><i className="fas fa-edit"></i></button>
                <button className="btn btn-danger btn-sm" onClick={() => deletar(m.id)}><i className="fas fa-trash"></i></button>
              </div>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0 0 12px 0' }}>
              {m.descricao || 'Sem descrição'}
            </p>

            <div style={{ background: 'var(--dark3)', padding: 10, borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>VALOR PADRÃO</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--yellow)' }}>
                R$ {parseFloat(m.valor_padrao || 0).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modelos.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 56 }}>
          <i className="fas fa-file-alt" style={{ fontSize: '3rem', color: 'var(--muted)', marginBottom: 20 }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: 12 }}>Nenhum modelo criado</h3>
          <p style={{ color: 'var(--muted)' }}>Crie modelos de serviços para agilizar a criação de ordens</p>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? 'Editar Modelo' : 'Novo Modelo de Serviço'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Serviço *</label>
                  <input name="nome" placeholder="Ex: Troca de óleo" value={form.nome} onChange={handle} required />
                </div>

                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    name="descricao"
                    placeholder="Detalhe o serviço..."
                    value={form.descricao}
                    onChange={handle}
                    rows="3"
                    style={{ fontFamily: 'inherit', background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '10px 12px', resize: 'vertical' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valor Padrão (R$)</label>
                    <input name="valor_padrao" type="number" step="0.01" placeholder="0,00" value={form.valor_padrao} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label>Categoria</label>
                    <select name="categoria" value={form.categoria} onChange={handle}>
                      <option value="servico">Serviço</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="diagnostico">Diagnóstico</option>
                      <option value="reparo">Reparo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i></> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
