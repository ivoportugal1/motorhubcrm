import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome_oficina: '', email_oficina: '', telefone: '', plano: 'acelera', nome: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Motor<span>Hub</span></div>
        <p className="auth-subtitle">Crie sua conta e gerencie sua oficina</p>
        <h2>Criar conta grátis</h2>
        {error && <div className="alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Nome da oficina *</label>
            <input name="nome_oficina" placeholder="Ex: Auto Center Silva" value={form.nome_oficina} onChange={handle} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>E-mail da oficina *</label>
              <input name="email_oficina" type="email" placeholder="oficina@email.com" value={form.email_oficina} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input name="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={handle} />
            </div>
          </div>
          <div className="form-group">
            <label>Plano *</label>
            <select name="plano" value={form.plano} onChange={handle}>
              <option value="acelera">Acelera — R$ 287/mês</option>
              <option value="turbo">Turbo — R$ 487/mês</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Seu nome *</label>
              <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Seu e-mail *</label>
              <input name="email" type="email" placeholder="voce@email.com" value={form.email} onChange={handle} required />
            </div>
          </div>
          <div className="form-group">
            <label>Senha *</label>
            <input name="senha" type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={handle} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Criando...</> : 'Criar conta grátis'}
          </button>
        </form>
        <p className="auth-footer">Já tem conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  );
}
