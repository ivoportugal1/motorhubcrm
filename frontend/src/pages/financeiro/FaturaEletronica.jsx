import { useNavigate } from 'react-router-dom';

export default function FaturaEletronica() {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/financeiro')}><i className="fas fa-arrow-left"></i></button>
          <div><h1>Fatura Eletrônica</h1><div className="page-header-sub">NF-e / NFS-e / NFC-e</div></div>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 56 }}>
        <i className="fas fa-file-invoice-dollar" style={{ fontSize: '3rem', color: 'var(--yellow)', marginBottom: 20 }}></i>
        <h3 style={{ color: 'var(--white)', marginBottom: 12 }}>Integração com Emissor de NF-e</h3>
        <p style={{ color: 'var(--muted)', maxWidth: 420, margin: '0 auto 24px' }}>
          Este módulo requer integração com um emissor fiscal homologado (ex: Focus NFe, NFe.io).
          Disponível no plano <strong style={{ color: 'var(--red)' }}>Turbo</strong>.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['NF-e (Produto)', 'NFS-e (Serviço)', 'NFC-e (Consumidor)'].map(tipo => (
            <div key={tipo} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 24px', minWidth: 140 }}>
              <i className="fas fa-file-alt" style={{ color: 'var(--yellow)', fontSize: '1.4rem', marginBottom: 8 }}></i>
              <div style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>{tipo}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
