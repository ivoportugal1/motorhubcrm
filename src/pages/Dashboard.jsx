import { useEffect, useState } from 'react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const statusLabel = { orcamento: 'Orçamento', andamento: 'Andamento', finalizada: 'Finalizada', faturada: 'Faturada', cancelada: 'Cancelada', pre_orcamento: 'Pré Orçamento' };

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/ordens/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) return <div style={{ color: 'var(--muted)' }}><i className="fas fa-spinner fa-spin"></i> Carregando...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="page-header-sub">Visão geral da sua oficina</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon red"><i className="fas fa-file-invoice"></i></div>
          <div><div className="stat-value">{data.ordens_abertas}</div><div className="stat-label">OS Abertas</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-calendar-check"></i></div>
          <div><div className="stat-value">{data.ordens_mes}</div><div className="stat-label">OS no mês</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-dollar-sign"></i></div>
          <div><div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(data.receita_mes)}</div><div className="stat-label">Receita do mês</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><i className="fas fa-car"></i></div>
          <div><div className="stat-value">{data.total_veiculos}</div><div className="stat-label">Veículos</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Últimas Ordens</div>
        {data.ultimas_ordens.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma ordem cadastrada ainda.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Número</th><th>Cliente</th><th>Placa</th><th>Valor</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.ultimas_ordens.map(o => (
                    <tr key={o.numero}>
                      <td><strong>{o.numero}</strong></td>
                      <td>{o.cliente_nome || '—'}</td>
                      <td>{o.placa || '—'}</td>
                      <td>{fmt(o.valor_total)}</td>
                      <td><span className={`badge badge-${o.status}`}>{statusLabel[o.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </>
  );
}
