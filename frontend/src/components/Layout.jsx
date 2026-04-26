import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { to: '/app/alertas',   icon: 'fas fa-bell',           label: 'Alertas', badge: true },
  { to: '/app/dashboard', icon: 'fas fa-chart-pie',      label: 'Dashboard' },
  { to: '/app/ordens',    icon: 'fas fa-file-invoice',   label: 'Ordens de Serviço' },
  { to: '/app/clientes',  icon: 'fas fa-users',           label: 'Clientes' },
  { to: '/app/veiculos',    icon: 'fas fa-car',             label: 'Veículos' },
  { to: '/app/estoque',     icon: 'fas fa-boxes',           label: 'Estoque' },
  { to: '/app/financeiro',  icon: 'fas fa-dollar-sign',     label: 'Financeiro' },
  { to: '/app/manutencao',  icon: 'fas fa-tools',           label: 'Manutenção Prev.' },
];

const navFooterItems = [
  { to: '/app/relatorios',       icon: 'fas fa-chart-bar',   label: 'Relatórios' },
  { to: '/app/documentos',       icon: 'fas fa-file-export', label: 'Documentos' },
  { to: '/app/usuarios',         icon: 'fas fa-users',       label: 'Usuários' },
  { to: '/app/modelos-servicos', icon: 'fas fa-list',        label: 'Modelos' },
  { to: '/app/integracao',       icon: 'fas fa-plug',        label: 'Integrações' },
  { to: '/app/configuracoes',    icon: 'fas fa-cog',         label: 'Configurações' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  // Close sidebar when clicking on a nav item
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,.5)',
            zIndex: 99,
            display: 'none'
          }}
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            display: window.innerWidth <= 768 ? 'block' : 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,.5)',
            zIndex: 99
          }}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <i className={item.icon}></i> {item.label}
            </NavLink>
          ))}
          <div className="nav-section">Sistema</div>
          {navFooterItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
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
          <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
            <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
            {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button className="btn btn-ghost btn-block btn-sm" onClick={handleLogout} style={{ marginTop: 8 }}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' }}
            className="menu-toggle"
          >
            <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
          </button>
          <span className="topbar-title">MotorHub</span>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
