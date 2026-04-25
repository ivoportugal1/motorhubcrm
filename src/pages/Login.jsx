import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.senha);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Motor<span>Hub</span></div>
        <p className="auth-subtitle">Sistema de gestão para oficinas mecânicas</p>
        <h2>Entrar na sua conta</h2>
        {error && <div className="alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input name="senha" type="password" placeholder="••••••••" value={form.senha} onChange={handle} required />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Entrando...</> : 'Entrar'}
          </button>
        </form>
        <p className="auth-footer">Não tem conta? <Link to="/register">Criar conta grátis</Link></p>
      </div>
    </div>
  );
}
