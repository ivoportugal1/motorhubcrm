import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ClienteDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const [clienteRes, historicoRes] = await Promise.all([
          api.get(`/clientes/${id}`),
          api.get(`/clientes/${id}/historico`),
        ]);
        setCliente(clienteRes.data);
        setHistorico(historicoRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 56 }}>
        <p style={{ color: 'var(--muted)' }}>Cliente não encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clientes')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1>{cliente.nome}</h1>
            <div className="page-header-sub">{cliente.cpf_cnpj || 'S/ CPF/CNPJ'}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* INFO CLIENTE */}
        <div className="card">
          <h3 className="card-title">Informações</h3>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>TELEFONE</div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>{cliente.telefone || '—'}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>E-MAIL</div>
            <div style={{ color: 'var(--white)', fontWeight: 600, wordBreak: 'break-all' }}>{cliente.email || '—'}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>ENDEREÇO</div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>{cliente.endereco || '—'}</div>
          </div>

          {cliente.data_nascimento && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>DATA NASCIMENTO</div>
              <div style={{ color: 'var(--white)', fontWeight: 600 }}>
                {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>DESDE</div>
            <div style={{ color: 'var(--white)', fontWeight: 600 }}>
              {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="card">
          <h3 className="card-title">
            <i className="fas fa-history" style={{ marginRight: 8 }}></i>
            Histórico de Atividades
          </h3>

          {historico.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma atividade registrada</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {historico.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr',
                    gap: 12,
                    paddingBottom: 12,
                    borderBottom: idx < historico.length - 1 ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: item.tipo === 'ordem' ? 'rgba(244,162,97,.15)' : item.tipo === 'pagamento' ? 'rgba(46,196,182,.15)' : 'rgba(100,149,237,.15)',
                      color: item.tipo === 'ordem' ? 'var(--yellow)' : item.tipo === 'pagamento' ? 'var(--green)' : '#6495ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}
                  >
                    <i className={item.tipo === 'ordem' ? 'fas fa-wrench' : item.tipo === 'pagamento' ? 'fas fa-check' : 'fas fa-file'}></i>
                  </div>

                  <div>
                    <div style={{ color: 'var(--white)', fontWeight: 600, marginBottom: 4 }}>
                      {item.titulo}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                      {item.descricao}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.75rem' }}>
                      {new Date(item.data).toLocaleDateString('pt-BR')} às {new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {item.valor && (
                      <div style={{ color: 'var(--yellow)', fontWeight: 600, fontSize: '0.9rem', marginTop: 4 }}>
                        {fmt(item.valor)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
