import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

class NotificacoesFuncionarioService {
  // Obter notificações do funcionário logado
  async obterNotificacoes() {
    try {
      const response = await axios.get(`${API_URL}/api/notificacoes-funcionario`, {
        withCredentials: true
      });
      // O backend retorna { notificacoes, naoLidas }, então extraímos apenas o array de notificações
      return response.data.notificacoes || [];
    } catch (error) {
      console.error('Erro ao buscar notificações do funcionário:', error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  // Marcar notificação como lida
  async marcarComoLida(notificacaoId) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/notificacoes-funcionario/${notificacaoId}/marcar-lida`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Contar notificações não lidas
  async contarNaoLidas() {
    try {
      const notificacoes = await this.obterNotificacoes();
      return Array.isArray(notificacoes) ? notificacoes.filter(notif => !notif.lida).length : 0;
    } catch (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }
  }
}

export default new NotificacoesFuncionarioService();