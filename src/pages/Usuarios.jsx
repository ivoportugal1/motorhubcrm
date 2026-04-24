import { useEffect, useState } from 'react';
import api from '../services/api';

const roleLabels = {
  admin: '👑 Administrador',
  gerente: '📊 Gerente',
  mecanico: '🔧 Mecânico',
  recepcionista: '📞 Recepcionista',
};

const roleColors = {
  admin: '#e74c3c',
  gerente: '#3498db',
  mecanico: '#f39c12',
  recepcionista: '#9b59b6',
};

const empty = { nome: '', email: '', role: 'mecanico', ativo: 1 };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
  };

  useEffect(() => { load(); }, []);

  const openNovo = () => { setForm(empty); setEditando(null); setModal(true); };
  const openEditar = (u) => { setForm({ nome: u.nome, email: u.email, role: u.role, ativo: u.ativo }); setEditando(u.id); setModal(true); };

  const handle = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? e.target.checked ? 1 : 0 : value });
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editando
        ? await api.put(`/usuarios/${editando}`, form)
        : await api.post('/usuarios', form);
      setModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
    finally { setSaving(false); }
  };

  const deletar = async (id) => {
    if (!confirm('Excluir este usuário?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao deletar');
    }
  };

  const toggleAtivo = async (id, ativo) => {
    try {
      await api.put(`/usuarios/${id}`, { ativo: ativo ? 0 : 1 });
      load();
    } catch (err) {
      alert('Erro ao atualizar');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Gerenciamento de Usuários</h1>
          <div className="page-header-sub">{usuarios.length} usuários cadastrados</div>
        </div>
        <button className="btn btn-primary" onClick={openNovo}><i className="fas fa-plus"></i> Novo Usuário</button>
      </div>

      <div className="card">
        {usuarios.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhum usuário encontrado.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Função</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.nome}</strong></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{u.email}</td>
                      <td>
                        <span style={{
                          color: roleColors[u.role],
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: u.ativo ? 'rgba(46,196,182,.15)' : 'rgba(231,76,60,.15)',
                          color: u.ativo ? 'var(--green)' : 'var(--red)',
                          padding: '3px 10px',
                          borderRadius: 100,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {u.ativo ? '✓ Ativo' : '✗ Inativo'}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleAtivo(u.id, u.ativo)}
                          title={u.ativo ? 'Desativar' : 'Ativar'}
                        >
                          <i className={u.ativo ? 'fas fa-lock-open' : 'fas fa-lock'}></i>
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditar(u)}><i className="fas fa-edit"></i></button>
                        <button className="btn btn-danger btn-sm" onClick={() => deletar(u.id)}><i className="fas fa-trash"></i></button>
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
              <h3>{editando ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome *</label>
                  <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handle} required />
                </div>

                <div className="form-group">
                  <label>E-mail *</label>
                  <input name="email" type="email" placeholder="usuario@email.com" value={form.email} onChange={handle} required />
                </div>

                <div className="form-group">
                  <label>Função *</label>
                  <select name="role" value={form.role} onChange={handle} required>
                    <option value="recepcionista">📞 Recepcionista</option>
                    <option value="mecanico">🔧 Mecânico</option>
                    <option value="gerente">📊 Gerente</option>
                    <option value="admin">👑 Administrador</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <input
                    type="checkbox"
                    id="ativo"
                    name="ativo"
                    checked={form.ativo === 1}
                    onChange={handle}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="ativo" style={{ margin: 0, cursor: 'pointer', fontSize: '0.9rem' }}>
                    Usuário ativo
                  </label>
                </div>

                {!editando && (
                  <div style={{ background: 'rgba(100,149,237,.1)', border: '1px solid rgba(100,149,237,.3)', color: '#6495ed', borderRadius: 8, padding: 12, fontSize: '0.85rem' }}>
                    <i className="fas fa-info-circle"></i> Uma senha temporária será enviada por e-mail
                  </div>
                )}
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
