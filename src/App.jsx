import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificacaoProvider } from './contexts/NotificacaoContext';
import NotificacaoToast from './components/NotificacaoToast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ordens from './pages/Ordens';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import Estoque from './pages/Estoque';
import Financeiro from './pages/Financeiro';
import Caixa from './pages/financeiro/Caixa';
import Contas from './pages/financeiro/Contas';
import Transferencias from './pages/financeiro/Transferencias';
import FaturaEletronica from './pages/financeiro/FaturaEletronica';
import Manutencao from './pages/Manutencao';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Alertas from './pages/Alertas';
import Usuarios from './pages/Usuarios';
import ModelosServicos from './pages/ModelosServicos';
import ClienteDetalhes from './pages/ClienteDetalhes';
import Documentos from './pages/Documentos';
import Integracao from './pages/Integracao';
import Landing from './pages/Landing';
import Layout from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><i className="fas fa-spinner fa-spin"></i></div>;
  return user ? children : <Navigate to="/login" />;
}

function LandingOrDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><i className="fas fa-spinner fa-spin"></i></div>;
  return user ? <Navigate to="/app/dashboard" /> : <Landing />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><i className="fas fa-spinner fa-spin"></i></div>;
  return user ? <Navigate to="/app/dashboard" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificacaoProvider>
        <NotificacaoToast />
        <Routes>
        <Route path="/" element={<LandingOrDashboard />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ordens"    element={<Ordens />} />
          <Route path="clientes"  element={<Clientes />} />
          <Route path="veiculos"  element={<Veiculos />} />
          <Route path="estoque"    element={<Estoque />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="financeiro/caixa"        element={<Caixa />} />
          <Route path="financeiro/contas"       element={<Contas />} />
          <Route path="financeiro/transferencias" element={<Transferencias />} />
          <Route path="financeiro/faturas"      element={<FaturaEletronica />} />
          <Route path="manutencao" element={<Manutencao />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="alertas" element={<Alertas />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="modelos-servicos" element={<ModelosServicos />} />
          <Route path="clientes/:id" element={<ClienteDetalhes />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="integracao" element={<Integracao />} />
        </Route>
      </Routes>
      </NotificacaoProvider>
    </AuthProvider>
  );
}
