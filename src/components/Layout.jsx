import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/alertas',   icon: 'fas fa-bell',           label: 'Alertas', badge: true },
  { to: '/dashboard', icon: 'fas fa-chart-pie',      label: 'Dashboard' },
  { to: '/ordens',    icon: 'fas fa-file-invoice',   label: 'Ordens de Serviço' },
  { to: '/clientes',  icon: 'fas fa-users',           label: 'Clientes' },
  { to: '/veiculos',    icon: 'fas fa-car',             label: 'Veículos' },
  { to: '/estoque',     icon: 'fas fa-boxes',           label: 'Estoque' },
  { to: '/financeiro',  icon: 'fas fa-dollar-sign',     label: 'Financeiro' },
  { to: '/manutencao',  icon: 'fas fa-tools',           label: 'Manutenção Prev.' },
];

const navFooterItems = [
  { to: '/relatorios',       icon: 'fas fa-chart-bar',   label: 'Relatórios' },
  { to: '/documentos',       icon: 'fas fa-file-export', label: 'Documentos' },
  { to: '/usuarios',         icon: 'fas fa-users',       label: 'Usuários' },
  { to: '/modelos-servicos', icon: 'fas fa-list',        label: 'Modelos' },
  { to: '/integracao',       icon: 'fas fa-plug',        label: 'Integrações' },
  { to: '/configuracoes',    icon: 'fas fa-cog',         label: 'Configurações' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Motor<span>Hub</span></div>
        <div className="sidebar-oficina">
          <small>Oficina</small>
          <strong>{user?.oficina_nome || '—'}</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--red)', fontWeight: 600, textTransform: 'uppercase' }}>
            {user?.plano}
          </span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className={item.icon}></i> {item.label}
            </NavLink>
          ))}
          <div className="nav-section">Sistema</div>
          {navFooterItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className={item.icon}></i> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.nome}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-block btn-sm" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">MotorHub</span>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
