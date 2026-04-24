import { useEffect, useState } from 'react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const empty = { codigo: '', nome: '', descricao: '', categoria: '', fabricante: '', unidade: 'un', estoque_atual: '', estoque_minimo: '', valor_custo: '', valor_venda: '' };

export default function Estoque() {
  const [pecas, setPecas] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [modalEstoque, setModalEstoque] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(empty);
  const [ajuste, setAjuste] = useState({ quantidade: '', tipo: 'entrada' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/pecas', { params: { busca } });
    setPecas(data);
  };

  useEffect(() => { load(); }, [busca]);

  const openNovo = () => { setForm(empty); setEditando(null); setModal(true); };
  const openEditar = (p) => {
    setForm({ codigo: p.codigo || '', nome: p.nome, descricao: p.descricao || '', categoria: p.categoria || '', fabricante: p.fabricante || '', unidade: p.unidade || 'un', estoque_atual: p.estoque_atual, estoque_minimo: p.estoque_minimo, valor_custo: p.valor_custo, valor_venda: p.valor_venda });
    setEditando(p.id); setModal(true);
  };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editando ? await api.put(`/pecas/${editando}`, form) : await api.post('/pecas', form);
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const deletar = async (id) => {
    if (!confirm('Remover esta peça do estoque?')) return;
    await api.delete(`/pecas/${id}`); load();
  };

  const salvarAjuste = async () => {
    if (!ajuste.quantidade) return;
    await api.patch(`/pecas/${modalEstoque.id}/estoque`, ajuste);
    setModalEstoque(null); setAjuste({ quantidade: '', tipo: 'entrada' }); load();
  };

  const baixoEstoque = pecas.filter(p => p.estoque_atual <= p.estoque_minimo);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Estoque</h1>
          <div className="page-header-sub">{pecas.length} peças cadastradas {baixoEstoque.length > 0 && <span style={{ color: 'var(--red)', marginLeft: 8 }}><i className="fas fa-exclamation-triangle"></i> {baixoEstoque.length} abaixo do mínimo</span>}</div>
        </div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Nova Peça</button>
      </div>

      <div className="filters">
        <input placeholder="Buscar por nome, código ou fabricante..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="card">
        {pecas.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma peça cadastrada.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Código</th><th>Nome</th><th>Categoria</th><th>Fabricante</th><th>Estoque</th><th>Mín.</th><th>Custo</th><th>Venda</th><th></th></tr></thead>
                <tbody>
                  {pecas.map(p => (
                    <tr key={p.id}>
                      <td>{p.codigo || '—'}</td>
                      <td><strong>{p.nome}</strong></td>
                      <td>{p.categoria || '—'}</td>
                      <td>{p.fabricante || '—'}</td>
                      <td>
                        <span style={{ color: p.estoque_atual <= p.estoque_minimo ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                          {p.estoque_atual} {p.unidade}
                          {p.estoque_atual <= p.estoque_minimo && <i className="fas fa-exclamation-triangle" style={{ marginLeft: 6 }}></i>}
                        </span>
                      </td>
                      <td>{p.estoque_minimo} {p.unidade}</td>
                      <td>{fmt(p.valor_custo)}</td>
                      <td>{fmt(p.valor_venda)}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" title="Ajustar estoque" onClick={() => { setModalEstoque(p); setAjuste({ quantidade: '', tipo: 'entrada' }); }}><i className="fas fa-boxes"></i></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditar(p)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(p.id)}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* Modal Nova/Editar Peça */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? 'Editar Peça' : 'Nova Peça'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Código</label><input name="codigo" placeholder="REF-001" value={form.codigo} onChange={handle} /></div>
                  <div className="form-group"><label>Nome *</label><input name="nome" placeholder="Nome da peça" value={form.nome} onChange={handle} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Categoria</label><input name="categoria" placeholder="Ex: Filtros" value={form.categoria} onChange={handle} /></div>
                  <div className="form-group"><label>Fabricante</label><input name="fabricante" placeholder="Ex: Bosch" value={form.fabricante} onChange={handle} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unidade</label>
                    <select name="unidade" value={form.unidade} onChange={handle}>
                      <option value="un">un</option><option value="kg">kg</option><option value="lt">lt</option><option value="m">m</option><option value="cx">cx</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Estoque mínimo</label><input name="estoque_minimo" type="number" placeholder="0" value={form.estoque_minimo} onChange={handle} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Estoque atual</label><input name="estoque_atual" type="number" placeholder="0" value={form.estoque_atual} onChange={handle} /></div>
                  <div className="form-group"><label>Valor de custo</label><input name="valor_custo" type="number" step="0.01" placeholder="0,00" value={form.valor_custo} onChange={handle} /></div>
                </div>
                <div className="form-group"><label>Valor de venda</label><input name="valor_venda" type="number" step="0.01" placeholder="0,00" value={form.valor_venda} onChange={handle} /></div>
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

      {/* Modal Ajuste de Estoque */}
      {modalEstoque && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalEstoque(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>Ajustar Estoque</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalEstoque(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--muted)', marginBottom: 16, fontSize: '0.88rem' }}>
                <strong style={{ color: 'var(--white)' }}>{modalEstoque.nome}</strong> — Atual: <strong style={{ color: 'var(--green)' }}>{modalEstoque.estoque_atual} {modalEstoque.unidade}</strong>
              </p>
              <div className="form-group">
                <label>Tipo</label>
                <select value={ajuste.tipo} onChange={e => setAjuste({ ...ajuste, tipo: e.target.value })}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input type="number" placeholder="0" value={ajuste.quantidade} onChange={e => setAjuste({ ...ajuste, quantidade: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModalEstoque(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarAjuste}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
