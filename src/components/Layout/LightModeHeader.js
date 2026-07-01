import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Bell, X } from 'lucide-react';
import { useLightMode } from '../../contexts/LightModeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useModal } from '../../contexts/ModalContext';
import { useNavigate } from 'react-router-dom';
import { getUsuario } from '../../utils/usuario';
import api from '../../services/api';
import notificacoesFuncionarioService from '../../services/notificacoesFuncionario.service';

export const LightModeHeader = () => {
  const [usuario, setUsuario] = useState(null);
  const [numeroNotificacoes, setNumeroNotificacoes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificacoesDetalhadas, setNotificacoesDetalhadas] = useState([]);
  const [notificacoesFuncionario, setNotificacoesFuncionario] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notifications } = useNotification();
  const { isLightMode } = useLightMode();
  const { isAnyModalOpen } = useModal();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // useEffect para contar notificações
  useEffect(() => {
    // Contar notificações não lidas do contexto + notificações detalhadas do dashboard + notificações de funcionário
    const notificacoesNaoLidas = notifications.filter(notif => !notif.lida).length;
    const notificacoesFuncionarioNaoLidas = notificacoesFuncionario.filter(notif => !notif.lida).length;
    const totalNotificacoes = notificacoesNaoLidas + notificacoesDetalhadas.length + notificacoesFuncionarioNaoLidas;
    setNumeroNotificacoes(totalNotificacoes);
  }, [notifications, notificacoesDetalhadas, notificacoesFuncionario]);

  // useEffect para buscar notificações iniciais
  useEffect(() => {
    if (isLightMode) {
      const dadosUsuario = getUsuario();
      setUsuario(dadosUsuario);
      buscarNotificacoes();
      
      // Buscar notificações de funcionário se o usuário for funcionário
      if (dadosUsuario?.tipo === 'FUNCIONARIO') {
        buscarNotificacoesFuncionario();
      }
    }
  }, [isLightMode]);

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Buscar notificações do dashboard
  const buscarNotificacoes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/dashboard');
      setNotificacoesDetalhadas(response.data.notificacoesDetalhadas || []);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      setNotificacoesDetalhadas([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar notificações de funcionário
  const buscarNotificacoesFuncionario = async () => {
    try {
      const notificacoes = await notificacoesFuncionarioService.obterNotificacoes();
      setNotificacoesFuncionario(notificacoes || []);
    } catch (error) {
      console.error('Erro ao buscar notificações de funcionário:', error);
      setNotificacoesFuncionario([]);
    }
  };

  // Marcar notificação de funcionário como lida
  const marcarNotificacaoComoLida = async (notificacaoId) => {
    try {
      await notificacoesFuncionarioService.marcarComoLida(notificacaoId);
      setNotificacoesFuncionario(prev => 
        prev.map(notif => 
          notif.id === notificacaoId ? { ...notif, lida: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Abrir modal e buscar notificações
  const handleNotificationClick = () => {
    if (!isModalOpen) {
      buscarNotificacoes();
      if (usuario?.tipo === 'FUNCIONARIO') {
        buscarNotificacoesFuncionario();
      }
    }
    setIsModalOpen(!isModalOpen);
  };

  // Não renderizar em modo escuro ou se qualquer modal estiver aberto
  if (!isLightMode || isAnyModalOpen) {
    return null;
  }

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#1e1b4b]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Lado esquerdo: Notificações */}
        <div className="flex items-center">
          {/* Botão de notificações com badge */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="relative w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Bell className="w-5 h-5 text-white" />
              
              {/* Badge vermelho com número de notificações */}
              {numeroNotificacoes > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {numeroNotificacoes > 9 ? '9+' : numeroNotificacoes}
                  </span>
                </div>
              )}
            </button>

            {/* Modal de Notificações */}
            {isModalOpen && (
              <div 
                ref={modalRef}
                className="absolute left-0 top-12 w-80 bg-[#1e1b4b] border border-white/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-white font-semibold text-sm">Notificações</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="max-h-64 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
                    </div>
                  ) : (notificacoesDetalhadas.length === 0 && notificacoesFuncionario.length === 0) ? (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Nenhuma notificação</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* Notificações de Funcionário */}
                      {notificacoesFuncionario.map((notificacao) => (
                        <div 
                          key={`funcionario-${notificacao.id}`}
                          className={`p-3 rounded-lg transition-colors border-l-4 border-blue-400 mb-2 last:mb-0 cursor-pointer ${
                            !notificacao.lida ? 'bg-blue-900/20 hover:bg-blue-800/20' : 'hover:bg-white/5'
                          }`}
                          onClick={() => !notificacao.lida && marcarNotificacaoComoLida(notificacao.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-white text-sm font-medium mb-1 ${
                                !notificacao.lida ? 'font-semibold' : ''
                              }`}>
                                {notificacao.titulo}
                              </p>
                              <p className="text-gray-300 text-xs">
                                {notificacao.conteudo}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {new Date(notificacao.criadoEm).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {!notificacao.lida && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Notificações do Dashboard */}
                      {notificacoesDetalhadas.map((notificacao, index) => (
                        <div key={`dashboard-${index}`} className="p-3 hover:bg-white/5 rounded-lg transition-colors border-l-4 border-yellow-400 mb-2 last:mb-0">
                          <p className="text-white text-sm font-medium mb-1">
                            Aviso
                          </p>
                          <p className="text-gray-300 text-xs">
                            {notificacao.mensagem || `${notificacao.nome}: ${notificacao.quantidade} unidades (${notificacao.porcentagem}% do estoque)`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer do Modal */}
                <div className="p-3 border-t border-white/20">
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate('/home');
                    }}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lado direito: Botão de logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white hover:text-red-300 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default LightModeHeader;