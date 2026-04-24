import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const tipoIcones = {
  manutencao: { icon: 'fas fa-tools', cor: '#f39c12', bg: 'rgba(243,156,18,.15)' },
  estoque: { icon: 'fas fa-boxes', cor: '#e74c3c', bg: 'rgba(231,76,60,.15)' },
  financeiro: { icon: 'fas fa-dollar-sign', cor: '#27ae60', bg: 'rgba(39,174,96,.15)' },
  orcamento: { icon: 'fas fa-file-invoice', cor: '#3498db', bg: 'rgba(52,152,219,.15)' },
  aniversario: { icon: 'fas fa-birthday-cake', cor: '#e91e63', bg: 'rgba(233,30,99,.15)' },
};

export default function Alertas() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/alertas');
        setAlertas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const alertasFiltrados = filtro === 'todos'
    ? alertas
    : alertas.filter(a => a.tipo === filtro);

  const contadores = {
    todos: alertas.length,
    manutencao: alertas.filter(a => a.tipo === 'manutencao').length,
    estoque: alertas.filter(a => a.tipo === 'estoque').length,
    financeiro: alertas.filter(a => a.tipo === 'financeiro').length,
    orcamento: alertas.filter(a => a.tipo === 'orcamento').length,
    aniversario: alertas.filter(a => a.tipo === 'aniversario').length,
  };

  const abrirDetalhes = (alerta) => {
    if (alerta.tipo === 'manutencao') navigate(`/manutencao`);
    else if (alerta.tipo === 'estoque') navigate(`/estoque`);
    else if (alerta.tipo === 'financeiro') navigate(`/financeiro/contas`);
    else if (alerta.tipo === 'orcamento') navigate(`/ordens`);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Alertas e Notificações</h1>
          <div className="page-header-sub">Monitoramento em tempo real do seu negócio</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['todos', 'manutencao', 'estoque', 'financeiro', 'orcamento', 'aniversario'].map(tipo => (
            <button
              key={tipo}
              className={`btn btn-sm ${filtro === tipo ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFiltro(tipo)}
              style={{ position: 'relative' }}
            >
              {tipo === 'todos' && '📊 Todos'}
              {tipo === 'manutencao' && '🔧 Manutenção'}
              {tipo === 'estoque' && '📦 Estoque'}
              {tipo === 'financeiro' && '💰 Financeiro'}
              {tipo === 'orcamento' && '📋 Orçamentos'}
              {tipo === 'aniversario' && '🎂 Aniversários'}
              {contadores[tipo] > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  background: 'var(--red)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {contadores[tipo]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        </div>
      ) : alertasFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 56 }}>
          <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: 'var(--green)', marginBottom: 20 }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: 12 }}>Nenhum alerta</h3>
          <p style={{ color: 'var(--muted)' }}>Seu negócio está em dia!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {alertasFiltrados.map((alerta, idx) => {
            const tipo = tipoIcones[alerta.tipo];
            return (
              <div
                key={idx}
                className="card"
                onClick={() => abrirDetalhes(alerta)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: 16, transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--dark3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--dark2)'}
              >
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  background: tipo.bg,
                  color: tipo.cor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0
                }}>
                  <i className={tipo.icon}></i>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 4 }}>
                    {alerta.titulo}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {alerta.mensagem}
                  </div>
                  {alerta.detalhes && (
                    <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 4 }}>
                      {alerta.detalhes}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: tipo.cor, fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                    {alerta.urgencia === 'critica' && '🔴 CRÍTICO'}
                    {alerta.urgencia === 'alta' && '🟠 ALTO'}
                    {alerta.urgencia === 'media' && '🟡 MÉDIO'}
                    {alerta.urgencia === 'baixa' && '🟢 BAIXO'}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                    {alerta.dataAlerta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
