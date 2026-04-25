import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const mascaraCpfCnpj = (v) => {
  const nums = v.replace(/\D/g, '');
  if (nums.length <= 11) return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
  return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').slice(0, 18);
};

const mascaraTelefone = (v) => {
  const nums = v.replace(/\D/g, '').slice(0, 11);
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};
const statusLabel = { todas: 'Todas', pre_orcamento: 'Pré Orç.', orcamento: 'Orçamento', andamento: 'Andamento', finalizada: 'Finalizada', faturada: 'Faturada', cancelada: 'Cancelada' };
const statusList = Object.keys(statusLabel);

const emptyForm = { cliente_id: '', veiculo_id: '', km: '', tipo: 'oficina', observacoes: '', itens: [] };
const emptyItem = { descricao: '', tipo: 'servico', quantidade: 1, valor_unitario: '' };
const emptyCliente = { nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '', data_nascimento: '', placa: '', marca: '', modelo: '', ano: '' };

export default function Ordens() {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState([]);
  const [meta, setMeta] = useState({ quantidade: 0, total: 0 });
  const [status, setStatus] = useState('todas');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteFiltrados, setClienteFiltrados] = useState([]);

  const [modalCadastroCliente, setModalCadastroCliente] = useState(false);
  const [formNovoCliente, setFormNovoCliente] = useState(emptyCliente);
  const [savingCliente, setSavingCliente] = useState(false);

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

  const carregarClientes = async () => {
    const { data } = await api.get('/clientes');
    setClientes(data || []);
  };

  const carregarVeiculos = async (cliente_id) => {
    if (!cliente_id) {
      setVeiculos([]);
      return;
    }
    const { data } = await api.get(`/clientes/${cliente_id}`);
    setVeiculos(data.veiculos || []);
  };

  const openModal = async () => {
    setForm(emptyForm);
    setBuscaCliente('');
    await carregarClientes();
    setModal(true);
  };

  const closeModal = () => setModal(false);

  const handleForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectCliente = async (cliente_id) => {
    setForm({ ...form, cliente_id, veiculo_id: '' });
    carregarVeiculos(cliente_id);
  };

  const openCadastroCliente = () => {
    setFormNovoCliente(emptyCliente);
    setModalCadastroCliente(true);
  };

  const closeCadastroCliente = () => {
    setModalCadastroCliente(false);
  };

  const handleNovoCliente = (e) => {
    let valor = e.target.value;
    if (e.target.name === 'cpf_cnpj') valor = mascaraCpfCnpj(valor);
    if (e.target.name === 'telefone') valor = mascaraTelefone(valor);
    setFormNovoCliente({ ...formNovoCliente, [e.target.name]: valor });
  };

  const saveNovoCliente = async (e) => {
    e.preventDefault();
    setSavingCliente(true);
    try {
      const dadosCliente = { nome: formNovoCliente.nome, cpf_cnpj: formNovoCliente.cpf_cnpj, telefone: formNovoCliente.telefone, email: formNovoCliente.email, endereco: formNovoCliente.endereco };
      const { data: novoCliente } = await api.post('/clientes', dadosCliente);

      if (formNovoCliente.placa) {
        await api.post('/veiculos', {
          cliente_id: novoCliente.id,
          placa: formNovoCliente.placa,
          marca: formNovoCliente.marca,
          modelo: formNovoCliente.modelo,
          ano: formNovoCliente.ano || null
        });
      }

      await carregarClientes();
      setForm({ ...form, cliente_id: novoCliente.id, veiculo_id: '' });
      await carregarVeiculos(novoCliente.id);
      setModalCadastroCliente(false);
      alert('Cliente cadastrado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setSavingCliente(false);
    }
  };

  const addItem = () => setForm({ ...form, itens: [...form.itens, { ...emptyItem }] });
  const removeItem = (i) => setForm({ ...form, itens: form.itens.filter((_, idx) => idx !== i) });
  const handleItem = (i, field, value) => {
    const itens = [...form.itens];
    itens[i] = { ...itens[i], [field]: value };
    setForm({ ...form, itens });
  };

  const totalItens = form.itens.reduce((s, i) => s + ((+i.quantidade || 0) * (+i.valor_unitario || 0)), 0);

  const clienteSelecionado = clientes.find(c => c.id === parseInt(form.cliente_id));

  const save = async (e) => {
    e.preventDefault();
    if (!form.cliente_id) {
      alert('Selecione um cliente');
      return;
    }
    setSaving(true);
    try {
      await api.post('/ordens', {
        cliente_id: form.cliente_id,
        veiculo_id: form.veiculo_id || null,
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

      {modal && !modalCadastroCliente && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3>Nova Ordem de Serviço</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                {/* CLIENTE */}
                <div className="form-group">
                  <label>Cliente *</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                    <select
                      name="cliente_id"
                      value={form.cliente_id}
                      onChange={(e) => handleSelectCliente(parseInt(e.target.value))}
                      required
                      style={{ flex: 1 }}
                    >
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nome} {c.telefone ? `(${c.telefone})` : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={openCadastroCliente}
                      style={{ whiteSpace: 'nowrap' }}
                      title="Cadastrar novo cliente"
                    >
                      <i className="fas fa-plus"></i> Novo
                    </button>
                  </div>
                </div>

                {/* DADOS DO CLIENTE */}
                {clienteSelecionado && (
                  <div style={{
                    background: 'rgba(230, 57, 70, 0.1)',
                    border: '1px solid var(--red)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16
                  }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--white)' }}>
                      <strong>📋 {clienteSelecionado.nome}</strong>
                      {clienteSelecionado.telefone && <div>📱 {clienteSelecionado.telefone}</div>}
                      {clienteSelecionado.email && <div>✉️ {clienteSelecionado.email}</div>}
                      {clienteSelecionado.cpf_cnpj && <div>ID: {clienteSelecionado.cpf_cnpj}</div>}
                    </div>
                  </div>
                )}

                {/* DADOS DO CLIENTE */}
                {clienteSelecionado && (
                  <div style={{ background: 'rgba(100, 149, 237, 0.1)', border: '1px solid rgba(100, 149, 237, 0.3)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <div><strong>{clienteSelecionado.nome}</strong></div>
                      {clienteSelecionado.telefone && <div>📱 {clienteSelecionado.telefone}</div>}
                      {clienteSelecionado.email && <div>✉️ {clienteSelecionado.email}</div>}
                    </div>
                  </div>
                )}

                {/* VEÍCULO */}
                {form.cliente_id && (
                  <div className="form-group">
                    <label>Veículo</label>
                    <select name="veiculo_id" value={form.veiculo_id} onChange={handleForm}>
                      <option value="">Selecione um veículo</option>
                      {veiculos.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo} ({v.ano})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* TIPO E KM */}
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

                {/* OBSERVAÇÕES */}
                <div className="form-group">
                  <label>Observações</label>
                  <textarea name="observacoes" placeholder="Observações sobre o serviço..." value={form.observacoes} onChange={handleForm} style={{ height: 120, fontFamily: 'inherit', resize: 'vertical', background: 'var(--dark3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, padding: 10 }} />
                </div>

                {/* ITENS */}
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
                <button type="submit" className="btn btn-primary" disabled={saving || !form.cliente_id}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : 'Criar OS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalCadastroCliente && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeCadastroCliente()}>
          <div className="modal" style={{ maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h3>Cadastrar Novo Cliente</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeCadastroCliente}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={saveNovoCliente}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome *</label>
                  <input name="nome" placeholder="Nome completo" value={formNovoCliente.nome} onChange={handleNovoCliente} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>CPF / CNPJ</label>
                    <input name="cpf_cnpj" placeholder="000.000.000-00" value={formNovoCliente.cpf_cnpj} onChange={handleNovoCliente} />
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input name="telefone" placeholder="(00) 00000-0000" value={formNovoCliente.telefone} onChange={handleNovoCliente} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input name="email" type="email" placeholder="cliente@email.com" value={formNovoCliente.email} onChange={handleNovoCliente} />
                  </div>
                  <div className="form-group">
                    <label>Data de Nascimento</label>
                    <input name="data_nascimento" type="date" value={formNovoCliente.data_nascimento} onChange={handleNovoCliente} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Endereço</label>
                  <input name="endereco" placeholder="Rua, número, bairro..." value={formNovoCliente.endereco} onChange={handleNovoCliente} />
                </div>

                <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} />
                <h4 style={{ marginBottom: 12 }}>Veículo (opcional)</h4>

                <div className="form-group">
                  <label>Placa</label>
                  <input name="placa" placeholder="ABC-1234" value={formNovoCliente.placa} onChange={handleNovoCliente} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Marca</label>
                    <input name="marca" placeholder="Toyota, Fiat..." value={formNovoCliente.marca} onChange={handleNovoCliente} />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input name="modelo" placeholder="Corolla, Uno..." value={formNovoCliente.modelo} onChange={handleNovoCliente} />
                  </div>
                  <div className="form-group">
                    <label>Ano</label>
                    <input name="ano" type="number" placeholder="2024" value={formNovoCliente.ano} onChange={handleNovoCliente} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeCadastroCliente}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={savingCliente}>
                  {savingCliente ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
