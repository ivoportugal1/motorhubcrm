import { useNotificacao } from '../contexts/NotificacaoContext';

export function useExemploNotificacoes() {
  const { adicionar } = useNotificacao();

  return {
    sucesso: (titulo, mensagem) => adicionar({
      tipo: 'sucesso',
      titulo,
      mensagem,
      duracao: 4000
    }),

    erro: (titulo, mensagem) => adicionar({
      tipo: 'erro',
      titulo,
      mensagem,
      duracao: 5000
    }),

    aviso: (titulo, mensagem) => adicionar({
      tipo: 'aviso',
      titulo,
      mensagem,
      duracao: 4000
    }),

    info: (titulo, mensagem) => adicionar({
      tipo: 'info',
      titulo,
      mensagem,
      duracao: 3000
    })
  };
}

// Exemplo de uso em um componente:
// import { useExemploNotificacoes } from './ExemploNotificacao';
//
// export default function MeuComponente() {
//   const notif = useExemploNotificacoes();
//
//   const handleSalvar = async () => {
//     try {
//       await api.post('/dados', data);
//       notif.sucesso('Salvo!', 'Dados salvos com sucesso');
//     } catch (err) {
//       notif.erro('Erro!', 'Falha ao salvar dados');
//     }
//   };
// }
