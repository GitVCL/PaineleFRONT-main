import { useState, useEffect, useRef } from 'react';
import { User, Bell, X } from 'lucide-react';
import { getUsuario } from '../../utils/usuario';
import { useNotification } from '../../contexts/NotificationContext';
import { useLightMode } from '../../contexts/LightModeContext';
import { useModal } from '../../contexts/ModalContext';
import api from '../../services/api';
import notificacoesFuncionarioService from '../../services/notificacoesFuncionario.service';

export const MobileHeader = () => {
  const [usuario, setUsuario] = useState(null);
  const [numeroNotificacoes, setNumeroNotificacoes] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificacoesDetalhadas, setNotificacoesDetalhadas] = useState([]);
  const [notificacoesFuncionario, setNotificacoesFuncionario] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notifications } = useNotification();
  const { isLightMode } = useLightMode();
  const { isAnyModalOpen } = useModal();
  const modalRef = useRef(null);

  useEffect(() => {
    // Obter dados do usuário
    const dadosUsuario = getUsuario();
    setUsuario(dadosUsuario);
    
    // Buscar notificações do dashboard ao carregar o componente
    buscarNotificacoes();
    
    // Buscar notificações de funcionário se o usuário for funcionário
    if (dadosUsuario?.tipo === 'FUNCIONARIO') {
      buscarNotificacoesFuncionario();
    }
  }, []);

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

  // Não renderizar em modo claro ou se qualquer modal estiver aberto
  if (isLightMode || isAnyModalOpen) {
    return null;
  }
  
  return (
    <div className="md:hidden bg-[#0f0b2e] border-b border-slate-700/50 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo: Avatar e saudação */}
        <div className="flex items-center gap-3">
          {/* Avatar circular */}
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          
          {/* Saudação */}
          <div>
            <p className="text-white text-sm font-medium">
              Olá, {usuario?.nome || 'Usuário'}
            </p>
            <p className="text-gray-400 text-xs">
              {usuario?.tipo === 'FUNCIONARIO' ? 'Funcionário' : 
               usuario?.tipo === 'COLABORADOR' ? 'Colaborador' : 
               'Principal'}
            </p>
          </div>
        </div>

        {/* Lado direito: Botão de notificações */}
        <div className="flex items-center">
          {/* Botão de notificações com badge */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="relative w-10 h-10 bg-slate-800/50 border border-slate-700/50 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              
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
                className="absolute right-0 top-12 w-80 bg-[#1e1b4b] border border-slate-700/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
              >
                {/* Header do Modal */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-white font-semibold text-sm">Notificações</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-6 h-6 flex items-center justify-center hover:bg-slate-700/50 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Carregando notificações...</p>
                    </div>
                  ) : (notificacoesDetalhadas.length === 0 && notificacoesFuncionario.length === 0) ? (
                    <div className="p-4 text-center">
                      <Bell className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Nenhuma notificação no momento</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {/* Notificações de Funcionário */}
                      {notificacoesFuncionario.map((notificacao) => (
                        <div 
                          key={`funcionario-${notificacao.id}`}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors border-b border-slate-700/30 last:border-b-0 cursor-pointer ${
                            !notificacao.lida ? 'bg-blue-900/30 hover:bg-blue-800/30' : 'hover:bg-slate-800/30'
                          }`}
                          onClick={() => !notificacao.lida && marcarNotificacaoComoLida(notificacao.id)}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notificacao.lida ? 'bg-gray-400' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium text-white ${
                              !notificacao.lida ? 'font-semibold' : ''
                            }`}>
                              {notificacao.titulo}
                            </p>
                            <p className="text-gray-300 text-xs mt-1">
                              {notificacao.conteudo}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
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
                          className="flex items-start gap-3 p-3 hover:bg-slate-800/30 rounded-lg transition-colors border-b border-slate-700/30 last:border-b-0"
                        >
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm leading-relaxed">
                              {notificacao.mensagem}
                            </p>
                            {notificacao.tipo === 'baixo_unico' && (
                              <div className="mt-2 text-xs text-gray-400">
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
                {(notificacoesDetalhadas.length > 0 || notificacoesFuncionario.length > 0) && (
                  <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
                    <button className="w-full text-center text-purple-400 text-xs hover:text-purple-300 transition-colors">
                      Ver todas as notificações
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;