import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const empty = { nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '', data_nascimento: '', placa: '', marca: '', modelo: '', ano: '' };

const mascaraCpfCnpj = (v) => {
  const nums = v.replace(/\D/g, '');
  if (nums.length <= 11) return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
  return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').slice(0, 18);
};

const mascaraTelefone = (v) => {
  const nums = v.replace(/\D/g, '').slice(0, 11);
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export default function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/clientes', { params: { busca } });
    setClientes(data);
  };

  useEffect(() => { load(); }, [busca]);

  const openNovo = () => { setForm(empty); setEditando(null); setModal(true); };
  const openEditar = (c) => { setForm({ nome: c.nome, cpf_cnpj: c.cpf_cnpj || '', telefone: c.telefone || '', email: c.email || '', endereco: c.endereco || '', data_nascimento: c.data_nascimento || '' }); setEditando(c.id); setModal(true); };

  const handle = (e) => {
    let valor = e.target.value;
    if (e.target.name === 'cpf_cnpj') valor = mascaraCpfCnpj(valor);
    if (e.target.name === 'telefone') valor = mascaraTelefone(valor);
    setForm({ ...form, [e.target.name]: valor });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dadosCliente = { nome: form.nome, cpf_cnpj: form.cpf_cnpj, telefone: form.telefone, email: form.email, endereco: form.endereco, data_nascimento: form.data_nascimento };

      if (editando) {
        await api.put(`/clientes/${editando}`, dadosCliente);
      } else {
        const { data: novoCliente } = await api.post('/clientes', dadosCliente);
        if (form.placa) {
          await api.post('/veiculos', {
            cliente_id: novoCliente.id,
            placa: form.placa,
            marca: form.marca,
            modelo: form.modelo,
            ano: form.ano || null
          });
        }
      }

      setModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro');
    } finally {
      setSaving(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir este cliente?')) return;
    await api.delete(`/clientes/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Clientes</h1><div className="page-header-sub">{clientes.length} cadastrados</div></div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Novo Cliente</button>
      </div>

      <div className="filters">
        <input placeholder="Buscar por nome, CPF/CNPJ ou telefone..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <div className="card">
        {clientes.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhum cliente encontrado.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Telefone</th><th>E-mail</th><th>Endereço</th><th></th></tr></thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/app/clientes/${c.id}`)}>
                      <td><strong>{c.nome}</strong></td>
                      <td>{c.cpf_cnpj || '—'}</td>
                      <td>{c.telefone || '—'}</td>
                      <td>{c.email || '—'}</td>
                      <td>{c.endereco || '—'}</td>
                      <td style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditar(c)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(c.id)}><i className="fas fa-trash"></i></button>
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
              <h3>{editando ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ maxHeight: 'calc(90vh - 140px)', overflow: 'auto' }}>
                <div className="form-group"><label>Nome *</label><input name="nome" placeholder="Nome completo" value={form.nome} onChange={handle} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>CPF / CNPJ</label><input name="cpf_cnpj" placeholder="000.000.000-00" value={form.cpf_cnpj} onChange={handle} /></div>
                  <div className="form-group"><label>Telefone</label><input name="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={handle} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>E-mail</label><input name="email" type="email" placeholder="cliente@email.com" value={form.email} onChange={handle} /></div>
                  <div className="form-group"><label>Data de Nascimento</label><input name="data_nascimento" type="date" value={form.data_nascimento} onChange={handle} /></div>
                </div>
                <div className="form-group"><label>Endereço</label><input name="endereco" placeholder="Rua, número, bairro..." value={form.endereco} onChange={handle} /></div>

                <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} />
                <h4 style={{ marginBottom: 12 }}>Veículo (opcional)</h4>

                <div className="form-group"><label>Placa</label><input name="placa" placeholder="ABC-1234" value={form.placa} onChange={handle} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Marca</label><input name="marca" placeholder="Toyota, Fiat..." value={form.marca} onChange={handle} /></div>
                  <div className="form-group"><label>Modelo</label><input name="modelo" placeholder="Corolla, Uno..." value={form.modelo} onChange={handle} /></div>
                </div>
                <div className="form-group"><label>Ano</label><input name="ano" type="number" placeholder="2024" value={form.ano} onChange={handle} /></div>
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
