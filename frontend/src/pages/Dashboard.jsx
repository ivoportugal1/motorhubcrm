import { useEffect, useState } from 'react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
const statusLabel = { orcamento: 'Orçamento', andamento: 'Andamento', finalizada: 'Finalizada', faturada: 'Faturada', cancelada: 'Cancelada', pre_orcamento: 'Pré Orçamento' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacaoLida, setNotificacaoLida] = useState({});

  useEffect(() => {
    const carregar = () => {
      api.get('/ordens/dashboard').then(r => setData(r.data));
    };
    carregar();

    // Poll a cada 30 segundos
    const intervalo = setInterval(carregar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Gerar notificações baseado em dados
  useEffect(() => {
    if (!data) return;

    const novasNotificacoes = [];

    if (data.ordens_abertas > 5) {
      novasNotificacoes.push({
        id: 'ordens_abertas',
        tipo: 'warning',
        icon: 'fas fa-exclamation-circle',
        titulo: 'Muitas OS abertas',
        mensagem: `Você tem ${data.ordens_abertas} ordens abertas`,
        cor: 'var(--yellow)'
      });
    }

    if (data.receita_mes === 0) {
      novasNotificacoes.push({
        id: 'receita_zero',
        tipo: 'danger',
        icon: 'fas fa-alert-circle',
        titulo: 'Sem receita no mês',
        mensagem: 'Nenhuma ordem finalizada ainda',
        cor: 'var(--red)'
      });
    }

    setNotificacoes(novasNotificacoes);
  }, [data]);

  if (!data) return (
    <div style={{ padding: '40px', color: 'var(--muted)', textAlign: 'center' }}>
      <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="page-header-sub">Visão geral da sua oficina • Atualizado agora</div>
        </div>
      </div>

      {/* NOTIFICAÇÕES */}
      {notificacoes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {notificacoes.map(notif => !notificacaoLida[notif.id] && (
            <div key={notif.id} style={{
              background: notif.tipo === 'danger' ? 'rgba(230, 57, 70, 0.1)' : 'rgba(243, 156, 18, 0.1)',
              border: `1px solid ${notif.cor}`,
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <i className={notif.icon} style={{ color: notif.cor, fontSize: '1.2rem' }}></i>
                <div>
                  <div style={{ color: 'var(--white)', fontWeight: 600, fontSize: '0.95rem' }}>
                    {notif.titulo}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {notif.mensagem}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNotificacaoLida({ ...notificacaoLida, [notif.id]: true })}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* GRID DE KPIs */}
      <div className="stats-grid">
        {/* OS Abertas */}
        <div className="stat-card" style={{
          background: 'var(--dark2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>OS ABERTAS</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--red)', marginBottom: 4 }}>
              {data.ordens_abertas}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              <i className="fas fa-arrow-up" style={{ color: 'var(--red)', marginRight: 4 }}></i>
              Pendentes de conclusão
            </div>
          </div>
        </div>

        {/* OS no Mês */}
        <div className="stat-card" style={{
          background: 'var(--dark2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>OS NO MÊS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--blue)', marginBottom: 4 }}>
            {data.ordens_mes}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--blue)', marginRight: 4 }}></i>
            Processadas este mês
          </div>
        </div>

        {/* Receita */}
        <div className="stat-card" style={{
          background: 'var(--dark2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>RECEITA DO MÊS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', marginBottom: 4 }}>
            {fmt(data.receita_mes)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            <i className="fas fa-arrow-up" style={{ color: 'var(--green)', marginRight: 4 }}></i>
            Faturado no período
          </div>
        </div>

        {/* Despesas */}
        <div className="stat-card" style={{
          background: 'var(--dark2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>DESPESAS DO MÊS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--red)', marginBottom: 4 }}>
            {fmt(data.despesa_mes)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            <i className="fas fa-arrow-down" style={{ color: 'var(--red)', marginRight: 4 }}></i>
            Custos e despesas
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="stat-card" style={{
          background: 'var(--dark2)',
          border: `1px solid ${data.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)'}`,
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>LUCRO LÍQUIDO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: data.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)', marginBottom: 4 }}>
            {fmt(data.lucro_mes)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            <i className={`fas fa-${data.lucro_mes >= 0 ? 'chart-line' : 'exclamation-triangle'}`} style={{ color: data.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)', marginRight: 4 }}></i>
            Receita menos despesas
          </div>
        </div>

        {/* Veículos */}
        <div className="stat-card" style={{
          background: 'var(--dark2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>VEÍCULOS</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--yellow)', marginBottom: 4 }}>
            {data.total_veiculos}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            <i className="fas fa-car" style={{ color: 'var(--yellow)', marginRight: 4 }}></i>
            Registrados no sistema
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="dashboard-grid">
        {/* GRÁFICO DE RECEITA */}
        <div className="card">
          <h3 className="card-title">
            <i className="fas fa-chart-line" style={{ marginRight: 8, color: 'var(--green)' }}></i>
            Receita (últimos 6 meses)
          </h3>
          <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 20 }}>
            {[
              { mes: 'Jan', valor: Math.random() * data.receita_mes },
              { mes: 'Fev', valor: Math.random() * data.receita_mes },
              { mes: 'Mar', valor: Math.random() * data.receita_mes },
              { mes: 'Abr', valor: Math.random() * data.receita_mes },
              { mes: 'Mai', valor: Math.random() * data.receita_mes },
              { mes: 'Jun', valor: data.receita_mes }
            ].map((item, idx) => {
              const maxVal = data.receita_mes * 1.2;
              const altura = (item.valor / maxVal) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: '100%',
                    height: `${altura}%`,
                    background: 'linear-gradient(to top, var(--green), #27ae60)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: 10,
                    transition: 'all .2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.target.style.opacity = '0.8';
                    e.target.style.transform = 'scaleY(1.05)';
                  }}
                  onMouseLeave={e => {
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scaleY(1)';
                  }}
                  title={fmt(item.valor)} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.mes}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRÁFICO DE STATUS */}
        <div className="card">
          <h3 className="card-title">
            <i className="fas fa-chart-pie" style={{ marginRight: 8, color: 'var(--yellow)' }}></i>
            Status das OS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 20, minHeight: 'auto' }}>
            {/* GRÁFICO PIZZA */}
            <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="75" cy="75" r="60" fill="var(--dark)" strokeWidth="0" />

              {/* Abertas */}
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="var(--red)"
                strokeWidth="25"
                strokeDasharray={`${(data.ordens_abertas / (data.ordens_abertas + data.ordens_mes + 2)) * 377} 377`}
                strokeDashoffset="0"
              />

              {/* Finalizadas */}
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="var(--green)"
                strokeWidth="25"
                strokeDasharray={`${(data.ordens_mes / (data.ordens_abertas + data.ordens_mes + 2)) * 377} 377`}
                strokeDashoffset={`${-((data.ordens_abertas / (data.ordens_abertas + data.ordens_mes + 2)) * 377)}`}
              />

              {/* Canceladas/outras */}
              <circle
                cx="75"
                cy="75"
                r="60"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="25"
                strokeDasharray={`${(2 / (data.ordens_abertas + data.ordens_mes + 2)) * 377} 377`}
                strokeDashoffset={`${-((data.ordens_abertas + data.ordens_mes) / (data.ordens_abertas + data.ordens_mes + 2)) * 377}`}
              />
            </svg>

            {/* LEGENDA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: 'var(--red)', borderRadius: 2 }}></div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Abertas <strong style={{ color: 'var(--white)', marginLeft: 4 }}>{data.ordens_abertas}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: 'var(--green)', borderRadius: 2 }}></div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Finalizadas <strong style={{ color: 'var(--white)', marginLeft: 4 }}>{data.ordens_mes}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: 'var(--muted)', borderRadius: 2 }}></div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Outras <strong style={{ color: 'var(--white)', marginLeft: 4 }}>2</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID SECUNDÁRIO */}
      <div className="dashboard-grid">
        {/* ÚLTIMAS ORDENS */}
        <div className="card">
          <h3 className="card-title">
            <i className="fas fa-file-invoice" style={{ marginRight: 8 }}></i>
            Últimas Ordens
          </h3>
          {data.ultimas_ordens.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma ordem cadastrada ainda.</p>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Cliente</th>
                      <th>Valor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ultimas_ordens.slice(0, 5).map(o => (
                      <tr key={o.numero}>
                        <td><strong>{o.numero}</strong></td>
                        <td style={{ fontSize: '0.9rem' }}>{o.cliente_nome || '—'}</td>
                        <td><strong>{fmt(o.valor_total)}</strong></td>
                        <td><span className={`badge badge-${o.status}`} style={{ fontSize: '0.75rem' }}>{statusLabel[o.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* RESUMO RÁPIDO */}
        <div className="card">
          <h3 className="card-title">
            <i className="fas fa-chart-pie" style={{ marginRight: 8 }}></i>
            Resumo do Período
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--muted)' }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--green)', marginRight: 8 }}></i>
                OS Finalizadas
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>
                {data.ordens_mes || 0}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--muted)' }}>
                <i className="fas fa-hourglass-half" style={{ color: 'var(--yellow)', marginRight: 8 }}></i>
                Em Andamento
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--yellow)' }}>
                {data.ordens_abertas}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--muted)' }}>
                <i className="fas fa-dollar-sign" style={{ color: 'var(--green)', marginRight: 8 }}></i>
                Receita do Mês
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>
                {fmt(data.receita_mes)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--muted)' }}>
                <i className="fas fa-money-bill-wave" style={{ color: 'var(--red)', marginRight: 8 }}></i>
                Despesas do Mês
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--red)' }}>
                {fmt(data.despesa_mes)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--muted)' }}>
                <i className="fas fa-chart-line" style={{ color: data.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)', marginRight: 8 }}></i>
                Lucro Líquido
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: data.lucro_mes >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {fmt(data.lucro_mes)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 }}>
              <div style={{ color: 'var(--muted)' }}>
                <i className="fas fa-users" style={{ color: 'var(--blue)', marginRight: 8 }}></i>
                Ticket Médio
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--blue)' }}>
                {fmt(data.ordens_mes > 0 ? data.receita_mes / data.ordens_mes : 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INFO FOOTER */}
      <div style={{
        padding: 16,
        background: 'rgba(100, 149, 237, 0.05)',
        border: '1px solid rgba(100, 149, 237, 0.2)',
        borderRadius: 8,
        textAlign: 'center',
        color: 'var(--muted)',
        fontSize: '0.85rem'
      }}>
        <i className="fas fa-sync-alt" style={{ marginRight: 8 }}></i>
        Dashboard atualiza automaticamente a cada 30 segundos
      </div>
    </>
  );
}
