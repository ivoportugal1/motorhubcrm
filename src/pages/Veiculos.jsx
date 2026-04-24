import { useEffect, useState } from 'react';
import api from '../services/api';

const empty = { cliente_id: '', placa: '', modelo: '', marca: '', ano: '', cor: '', km_atual: '' };

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [v, c] = await Promise.all([
      api.get('/veiculos', { params: { busca } }),
      api.get('/clientes'),
    ]);
    setVeiculos(v.data);
    setClientes(c.data);
  };

  useEffect(() => { load(); }, [busca]);

  const openNovo = () => { setForm(empty); setEditando(null); setModal(true); };
  const openEditar = (v) => {
    setForm({ cliente_id: v.cliente_id || '', placa: v.placa, modelo: v.modelo || '', marca: v.marca || '', ano: v.ano || '', cor: v.cor || '', km_atual: v.km_atual || '' });
    setEditando(v.id); setModal(true);
  };

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editando ? await api.put(`/veiculos/${editando}`, form) : await api.post('/veiculos', form);
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir este veículo?')) return;
    await api.delete(`/veiculos/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Veículos</h1><div className="page-header-sub">{veiculos.length} cadastrados</div></div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Novo Veículo</button>
      </div>

      <div className="filters">
        <input placeholder="Buscar por placa, modelo, marca ou cliente..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="card">
        {veiculos.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhum veículo encontrado.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Placa</th><th>Marca/Modelo</th><th>Ano</th><th>Cor</th><th>KM</th><th>Cliente</th><th></th></tr></thead>
                <tbody>
                  {veiculos.map(v => (
                    <tr key={v.id}>
                      <td><strong style={{ color: 'var(--red)' }}>{v.placa}</strong></td>
                      <td>{[v.marca, v.modelo].filter(Boolean).join(' / ') || '—'}</td>
                      <td>{v.ano || '—'}</td>
                      <td>{v.cor || '—'}</td>
                      <td>{v.km_atual ? v.km_atual.toLocaleString('pt-BR') + ' km' : '—'}</td>
                      <td>{v.cliente_nome || '—'}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditar(v)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(v.id)}><i className="fas fa-trash"></i></button>
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
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? 'Editar Veículo' : 'Novo Veículo'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Placa *</label>
                    <input name="placa" placeholder="ABC-1234" value={form.placa} onChange={handle} required style={{ textTransform: 'uppercase' }} />
                  </div>
                  <div className="form-group">
                    <label>Cliente</label>
                    <select name="cliente_id" value={form.cliente_id} onChange={handle}>
                      <option value="">Selecionar cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Marca</label><input name="marca" placeholder="Ex: Volkswagen" value={form.marca} onChange={handle} /></div>
                  <div className="form-group"><label>Modelo</label><input name="modelo" placeholder="Ex: Gol 1.0" value={form.modelo} onChange={handle} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Ano</label><input name="ano" type="number" placeholder="2020" value={form.ano} onChange={handle} /></div>
                  <div className="form-group"><label>Cor</label><input name="cor" placeholder="Branco" value={form.cor} onChange={handle} /></div>
                </div>
                <div className="form-group"><label>KM Atual</label><input name="km_atual" type="number" placeholder="85000" value={form.km_atual} onChange={handle} /></div>
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
