import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useLightMode } from '../../contexts/LightModeContext';
import { getUsuario } from '../../utils/usuario';
import api from '../../services/api';
import notificacoesFuncionarioService from '../../services/notificacoesFuncionario.service';

export const DesktopNotificationBell = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numeroNotificacoes, setNumeroNotificacoes] = useState(0);
  const [notificacoesDetalhadas, setNotificacoesDetalhadas] = useState([]);
  const [notificacoesFuncionario, setNotificacoesFuncionario] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notifications } = useNotification();
  const { isLightMode } = useLightMode();
  const modalRef = useRef(null);
  const usuario = getUsuario();

  useEffect(() => {
    // Só buscar notificações se o usuário estiver logado
    if (usuario && usuario.token) {
      // Buscar notificações do dashboard ao carregar o componente
      buscarNotificacoes();
      
      // Se for funcionário, buscar também notificações específicas
      if (usuario?.tipo === 'FUNCIONARIO') {
        buscarNotificacoesFuncionario();
      }
    }
  }, [usuario?.tipo, usuario?.token]);

  useEffect(() => {
    // Contar notificações não lidas do contexto + notificações detalhadas do dashboard + notificações de funcionário
    const notificacoesNaoLidas = notifications.filter(notif => !notif.lida).length;
    const notificacoesFuncionarioNaoLidas = notificacoesFuncionario.filter(notif => !notif.lida).length;
    const totalNotificacoes = notificacoesNaoLidas + notificacoesDetalhadas.length + notificacoesFuncionarioNaoLidas;
    setNumeroNotificacoes(totalNotificacoes);
  }, [notifications, notificacoesDetalhadas, notificacoesFuncionario]);

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

  // Buscar notificações específicas de funcionário
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
      // Atualizar a lista local
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
    if (!isModalOpen && usuario && usuario.token) {
      buscarNotificacoes();
      if (usuario?.tipo === 'FUNCIONARIO') {
        buscarNotificacoesFuncionario();
      }
    }
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="hidden lg:block fixed top-4 z-50" style={{ right: '49px' }}>
      {/* Botão de notificações */}
      <div className="relative">
        <button 
          onClick={handleNotificationClick}
          className={`
            relative w-12 h-12 rounded-full flex items-center justify-center 
            transition-all duration-300 hover:scale-105 shadow-lg
            ${isLightMode 
              ? 'bg-white/90 border border-gray-200 hover:bg-white text-gray-700 hover:text-gray-900' 
              : 'bg-[#1e1b4b]/90 border border-slate-700/50 hover:bg-[#1e1b4b] text-gray-300 hover:text-white'
            }
          `}
        >
          <Bell className="w-5 h-5" />
          
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
            className={`
              absolute right-0 top-14 w-80 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden
              ${isLightMode 
                ? 'bg-white border border-gray-200' 
                : 'bg-[#1e1b4b] border border-slate-700/50'
              }
            `}
          >
            {/* Header do Modal */}
            <div className={`
              flex items-center justify-between p-4 border-b
              ${isLightMode ? 'border-gray-200' : 'border-slate-700/50'}
            `}>
              <div className="flex items-center gap-2">
                <Bell className={`w-4 h-4 ${isLightMode ? 'text-yellow-500' : 'text-yellow-400'}`} />
                <h3 className={`font-semibold text-sm ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                  Notificações
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`
                  w-6 h-6 flex items-center justify-center rounded-full transition-colors
                  ${isLightMode 
                    ? 'hover:bg-gray-100 text-gray-500 hover:text-gray-700' 
                    : 'hover:bg-slate-700/50 text-gray-400 hover:text-white'
                  }
                `}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Carregando notificações...</p>
                </div>
              ) : (notificacoesDetalhadas.length === 0 && notificacoesFuncionario.length === 0) ? (
                <div className="p-4 text-center">
                  <Bell className={`w-8 h-8 mx-auto mb-2 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Nenhuma notificação no momento</p>
                </div>
              ) : (
                <div className="p-2">
                  {/* Notificações de Funcionário */}
                  {notificacoesFuncionario.map((notificacao) => (
                    <div 
                      key={`funcionario-${notificacao.id}`}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors border-b last:border-b-0 cursor-pointer ${
                        isLightMode 
                          ? 'hover:bg-gray-50 border-gray-200' 
                          : 'hover:bg-slate-800/30 border-slate-700/30'
                      } ${!notificacao.lida ? 'bg-blue-50/50' : ''}`}
                      onClick={() => !notificacao.lida && marcarNotificacaoComoLida(notificacao.id)}
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notificacao.lida ? 'bg-gray-400' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} ${
                          !notificacao.lida ? 'font-semibold' : ''
                        }`}>
                          {notificacao.titulo}
                        </p>
                        <p className={`text-xs mt-1 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                          {notificacao.conteudo}
                        </p>
                        <p className={`text-xs mt-1 ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(notificacao.criadoEm).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {!notificacao.lida && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  ))}
                  
                  {/* Notificações do Dashboard */}
                  {notificacoesDetalhadas.map((notificacao, index) => (
                    <div 
                      key={`dashboard-${index}`}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors border-b last:border-b-0 ${
                        isLightMode 
                          ? 'hover:bg-gray-50 border-gray-200' 
                          : 'hover:bg-slate-800/30 border-slate-700/30'
                      }`}
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                          {notificacao.mensagem}
                        </p>
                        {notificacao.tipo === 'baixo_unico' && (
                          <div className="mt-2 text-xs">
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                              {notificacao.porcentagem}% do estoque
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            {notificacoesDetalhadas.length > 0 && (
              <div className={`p-3 border-t ${
                isLightMode 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-slate-700/50 bg-slate-800/30'
              }`}>
                <button className={`w-full text-center text-xs transition-colors ${
                  isLightMode 
                    ? 'text-purple-600 hover:text-purple-700' 
                    : 'text-purple-400 hover:text-purple-300'
                }`}>
                  Ver todas as notificações
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNotificationBell;