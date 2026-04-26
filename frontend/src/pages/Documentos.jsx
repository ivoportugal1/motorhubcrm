import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Documentos() {
  const [ordens, setOrdens] = useState([]);
  const [relatorios, setRelatorios] = useState([]);
  const [periodo, setPeriodo] = useState('mes');
  const [loadingOrdens, setLoadingOrdens] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoadingOrdens(true);
        const { data } = await api.get('/ordens');
        setOrdens(data.slice(0, 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrdens(false);
      }
    };
    carregar();
  }, []);

  const exportarOrcamentoPDF = async (ordemId) => {
    try {
      const response = await api.get(`/documentos/orcamento/${ordemId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orcamento_${ordemId}.pdf`;
      link.click();
    } catch (err) {
      alert('Erro ao gerar PDF');
    }
  };

  const exportarRelatorioExcel = async () => {
    try {
      const response = await api.get(`/documentos/relatorio/excel?periodo=${periodo}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${periodo}.xlsx`;
      link.click();
    } catch (err) {
      alert('Erro ao gerar Excel');
    }
  };

  const exportarRelatorioPDF = async () => {
    try {
      const response = await api.get(`/documentos/relatorio/pdf?periodo=${periodo}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${periodo}.pdf`;
      link.click();
    } catch (err) {
      alert('Erro ao gerar PDF');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Exportar Documentos</h1>
          <div className="page-header-sub">Gere orçamentos em PDF e relatórios em Excel</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ORÇAMENTOS */}
        <div className="card">
          <h3 className="card-title"><i className="fas fa-file-pdf" style={{ marginRight: 8, color: '#e74c3c' }}></i>Orçamentos em PDF</h3>

          {loadingOrdens ? (
            <p style={{ color: 'var(--muted)' }}>Carregando ordens...</p>
          ) : ordens.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Nenhuma ordem disponível</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ordens.map(ordem => (
                <div
                  key={ordem.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 12,
                    background: 'var(--dark3)',
                    borderRadius: 6
                  }}
                >
                  <div>
                    <div style={{ color: 'var(--white)', fontWeight: 600 }}>OS #{ordem.numero}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                      {ordem.cliente_nome || 'Sem cliente'} - {ordem.veiculo_placa || 'Sem veículo'}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => exportarOrcamentoPDF(ordem.id)}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RELATÓRIOS */}
        <div className="card">
          <h3 className="card-title"><i className="fas fa-table" style={{ marginRight: 8, color: '#27ae60' }}></i>Relatórios</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Período</label>
            <select
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--dark3)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                padding: '8px 12px'
              }}
            >
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary btn-block"
              onClick={exportarRelatorioExcel}
            >
              <i className="fas fa-file-excel"></i> Exportar para Excel
            </button>
            <button
              className="btn btn-outline btn-block"
              onClick={exportarRelatorioPDF}
            >
              <i className="fas fa-file-pdf"></i> Exportar para PDF
            </button>
          </div>

          <div style={{
            background: 'rgba(46,196,182,.1)',
            border: '1px solid rgba(46,196,182,.3)',
            color: 'var(--green)',
            borderRadius: 8,
            padding: 12,
            fontSize: '0.75rem',
            marginTop: 12,
            textAlign: 'center'
          }}>
            <i className="fas fa-info-circle"></i> Relatório inclui receita, despesa, ordens e clientes
          </div>
        </div>
      </div>
    </>
  );
}
