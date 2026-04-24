import { useNavigate } from 'react-router-dom';

const modulos = [
  { path: '/financeiro/caixa',            icon: 'fas fa-cash-register', label: 'Caixa',                cor: '#4caf7d', corDark: '#388e5c' },
  { path: '/financeiro/contas',           icon: 'fas fa-receipt',       label: 'Contas - pagar/receber', cor: '#c0392b', corDark: '#922b21' },
  { path: '/financeiro/faturas',          icon: 'fas fa-file-invoice',  label: 'Fatura eletrônica',     cor: '#f0a500', corDark: '#c87d00' },
  { path: '/financeiro/transferencias',   icon: 'fas fa-exchange-alt',  label: 'Transferências',        cor: '#f0a500', corDark: '#c87d00' },
];

export default function Financeiro() {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-header">
        <div><h1>Financeiro</h1></div>
      </div>
      <div className="fin-hub-grid">
        {modulos.map(m => (
          <div key={m.path} className="fin-hub-card" onClick={() => navigate(m.path)} style={{ '--cor': m.cor, '--cor-dark': m.corDark }}>
            <div className="fin-hub-icon"><i className={m.icon}></i></div>
            <div className="fin-hub-label">{m.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
