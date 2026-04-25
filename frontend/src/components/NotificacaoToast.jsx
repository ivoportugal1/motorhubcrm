import { useNotificacao } from '../contexts/NotificacaoContext';

export default function NotificacaoToast() {
  const { notificacoes, remover } = useNotificacao();

  const iconMap = {
    sucesso: 'fas fa-check-circle',
    erro: 'fas fa-exclamation-circle',
    aviso: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  const corMap = {
    sucesso: '#2ec4b6',
    erro: '#e63946',
    aviso: '#f39c12',
    info: '#6495ed'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      {notificacoes.map(notif => (
        <div
          key={notif.id}
          style={{
            background: 'var(--dark2)',
            border: `1px solid ${corMap[notif.tipo] || '#6495ed'}`,
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            minWidth: 300,
            animation: 'slideInRight 0.3s ease-out',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}
        >
          <i
            className={iconMap[notif.tipo] || iconMap.info}
            style={{
              color: corMap[notif.tipo] || '#6495ed',
              fontSize: '1.2rem',
              flexShrink: 0,
              marginTop: 2
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              color: 'var(--white)',
              fontWeight: 600,
              marginBottom: 4,
              fontSize: '0.95rem'
            }}>
              {notif.titulo}
            </div>
            <div style={{
              color: 'var(--muted)',
              fontSize: '0.85rem',
              lineHeight: 1.4
            }}>
              {notif.mensagem}
            </div>
          </div>
          <button
            onClick={() => remover(notif.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
