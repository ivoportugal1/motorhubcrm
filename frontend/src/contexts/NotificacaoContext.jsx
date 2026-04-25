import { createContext, useContext, useState, useCallback } from 'react';

const NotificacaoContext = createContext();

export function NotificacaoProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState([]);

  const adicionar = useCallback((config) => {
    const id = Date.now();
    const notif = {
      id,
      tipo: config.tipo || 'info',
      titulo: config.titulo,
      mensagem: config.mensagem,
      duracao: config.duracao || 5000
    };

    setNotificacoes(prev => [...prev, notif]);

    if (notif.duracao > 0) {
      setTimeout(() => {
        remover(id);
      }, notif.duracao);
    }

    return id;
  }, []);

  const remover = useCallback((id) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificacaoContext.Provider value={{ notificacoes, adicionar, remover }}>
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  const context = useContext(NotificacaoContext);
  if (!context) {
    throw new Error('useNotificacao deve ser usado dentro de NotificacaoProvider');
  }
  return context;
}
