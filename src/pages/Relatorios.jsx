import { useEffect, useState } from 'react';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function Relatorios() {
  const [periodo, setPeriodo] = useState('mes');
  const [relatorios, setRelatorios] = useState({
    financeiro: { receita: 0, despesa: 0, saldo: 0 },
    ordens: { total: 0, concluidas: 0, abiertas: 0 },
    clientes: { total: 0, novos: 0 },
    veiculos: { total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        // GET /relatorios?periodo=mes|trimestre|ano
        const { data } = await api.get(`/relatorios?periodo=${periodo}`);
        setRelatorios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [periodo]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Relatórios</h1>
          <div className="page-header-sub">Análise de dados e métricas</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['mes', 'trimestre', 'ano'].map(p => (
            <button
              key={p}
              className={`btn btn-sm ${periodo === p ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriodo(p)}
            >
              {p === 'mes' ? 'Este Mês' : p === 'trimestre' ? 'Este Trimestre' : 'Este Ano'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {/* FINANCEIRO */}
          <div className="card">
            <h3 className="card-title"><i className="fas fa-chart-line" style={{ marginRight: 8, color: 'var(--green)' }}></i>Desempenho Financeiro</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>RECEITA</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>{fmt(relatorios.financeiro.receita)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>DESPESA</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--red)' }}>{fmt(relatorios.financeiro.despesa)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>SALDO</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: relatorios.financeiro.saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {fmt(relatorios.financeiro.saldo)}
                </div>
              </div>
            </div>
          </div>

          {/* ORDENS */}
          <div className="card">
            <h3 className="card-title"><i className="fas fa-wrench" style={{ marginRight: 8, color: 'var(--yellow)' }}></i>Ordens de Serviço</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>TOTAL</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--white)' }}>{relatorios.ordens.total}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>CONCLUÍDAS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>{relatorios.ordens.concluidas}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>ABERTAS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--yellow)' }}>{relatorios.ordens.abiertas}</div>
              </div>
            </div>
          </div>

          {/* CLIENTES */}
          <div className="card">
            <h3 className="card-title"><i className="fas fa-users" style={{ marginRight: 8, color: '#6c5ce7' }}></i>Base de Clientes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>TOTAL</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--white)' }}>{relatorios.clientes.total}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>NOVOS</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0984e3' }}>{relatorios.clientes.novos}</div>
              </div>
            </div>
          </div>

          {/* VEÍCULOS */}
          <div className="card">
            <h3 className="card-title"><i className="fas fa-car" style={{ marginRight: 8, color: '#fdcb6e' }}></i>Frota de Veículos</h3>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>TOTAL CADASTRADO</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--white)' }}>{relatorios.veiculos.total}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
