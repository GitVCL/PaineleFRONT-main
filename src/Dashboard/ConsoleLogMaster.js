import React, { useState, useEffect } from 'react';
import { useLightMode } from '../contexts/LightModeContext';
import { Activity, User, DollarSign, Package, FileText, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';

const ConsoleLogMaster = () => {
  const { isLightMode } = useLightMode();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas'); // 'todas' | 'venda' | 'despesa' | 'produto'

  // Função para buscar movimentações da NOVA TABELA via API
  const fetchMovimentacoes = async () => {
    try {
      console.log('🔍 ConsoleLogMaster: Buscando logs do console na nova tabela...');

      // Verificar se há usuário logado
      const usuarioStr = localStorage.getItem('usuario');
      if (!usuarioStr) {
        console.error('❌ Usuário não encontrado no localStorage');
        setLoading(false);
        return;
      }

      const usuario = JSON.parse(usuarioStr);
      if (!usuario.token) {
        console.error('❌ Token não encontrado nos dados do usuário');
        setLoading(false);
        return;
      }

      // Buscar perfil do usuário para fallback de nome
      console.log('👤 Buscando perfil do usuário...');
      const usuariosResponse = await api.get('/api/user/perfil');
      const usuarioLogado = usuariosResponse.data;

      // Buscar funcionários para mapear nomes (actorFuncionarioId)
      console.log('👥 Buscando funcionários para mapear atores...');
      const funcionariosResponse = await api.get('/api/funcionarios');
      const funcionarios = funcionariosResponse.data?.funcionarios || funcionariosResponse.data || [];

      // Buscar logs da API do console
      console.log('🧭 Buscando logs de movimentação do console...');
      const movResponse = await api.get('/api/console/movimentacoes', { params: { limit: 100 } });
      const logs = movResponse.data?.logs || movResponse.data || [];
      console.log(`🧭 ${logs.length} logs recebidos`);

      // Helpers
      const mapCategoriaToTipo = (categoria) => {
        const cat = String(categoria || '').trim().toUpperCase();
        // Normaliza variações e plurais
        if (cat.includes('VEND')) return 'venda'; // VENDA, VENDAS
        if (cat.includes('DESPES')) return 'despesa'; // DESPESA, DESPESAS
        if (cat.includes('PRODUT')) return 'produto'; // PRODUTO, PRODUTOS
        return 'outro';
      };

      const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

      const buildDescricao = (log) => {
        const cat = String(log.categoria || '').toLowerCase();
        const acao = String(log.acao || '').toLowerCase();
        const base = `${capitalize(cat)} ${acao}`.trim();
        const item = log.descricao || (log.metadata && (log.metadata.nome || log.metadata.descricao)) || log.entidade || String(log.entidadeId || '').trim();
        return item ? `${capitalize(cat)} ${acao}: ${item}` : base || 'Movimentação';
      };

      const movimentacoesMapeadas = logs.map((log) => {
        // Resolver nome do ator
        let atorNome = 'Sistema';
        if (log.actorFuncionarioId) {
          const funcionario = funcionarios.find(f => f.id === log.actorFuncionarioId);
          if (funcionario) {
            atorNome = funcionario.nome;
          }
        } else if (log.actorUsuarioId) {
          atorNome = usuarioLogado?.nome || 'Administrador';
        }

        return {
          id: log.id,
          tipo: mapCategoriaToTipo(log.categoria),
          descricao: buildDescricao(log),
          valor: undefined, // Valor não é parte padrão dos logs; manter oculto
          funcionario: atorNome,
          timestamp: new Date(log.criadoEm)
        };
      });

      // Ordenar por timestamp e limitar à última página
      const ordenadas = movimentacoesMapeadas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitadas = ordenadas.slice(0, 50);

      setMovimentacoes(limitadas);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao buscar movimentações:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      setLoading(false);
    }
  };

  // Efeito para buscar dados iniciais
  useEffect(() => {
    fetchMovimentacoes();
  }, []);

  // Removido auto-refresh para melhor controle manual

  // Função para formatar data e hora
  const formatarDataHora = (data) => {
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Função para obter cor baseada no tipo de movimentação
  const getColorByType = (tipo) => {
    switch (tipo) {
      case 'venda':
        return isLightMode ? 'text-green-600' : 'text-green-400';
      case 'despesa':
        return isLightMode ? 'text-red-600' : 'text-red-400';
      default:
        return isLightMode ? 'text-blue-600' : 'text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando movimentações...</span>
        </div>
      </div>
    );
  }

  const listaFiltrada = categoriaFiltro === 'todas'
    ? movimentacoes
    : movimentacoes.filter(m => m.tipo === categoriaFiltro);

  return (
    <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <Activity className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`} />
          <h3 className={`text-lg sm:text-xl font-semibold ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
            Console de Movimentações
          </h3>
          {/* Botão Atualizar — aparece ao lado do título apenas no mobile */}
          <button
            aria-label="Atualizar"
            title="Atualizar"
            onClick={async () => {
              try {
                setRefreshing(true);
                await fetchMovimentacoes();
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            className={`inline-flex sm:hidden ml-2 rounded-full text-xs sm:text-sm transition-colors items-center justify-center w-8 h-8 ${
              isLightMode 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300' 
                : 'bg-blue-900 text-blue-300 hover:bg-blue-800 disabled:bg-blue-950 disabled:text-blue-700'
            }`}
          >
            <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">{refreshing ? 'Atualizando…' : 'Atualizar'}</span>
          </button>
        </div>
        
        {/* Filtros e atualização */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'venda', label: 'Vendas' },
              { key: 'despesa', label: 'Despesas' },
              { key: 'produto', label: 'Produtos' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCategoriaFiltro(key)}
                className={`px-3 py-1 rounded text-xs sm:text-sm transition-colors border flex-shrink-0 whitespace-nowrap ${
                  categoriaFiltro === key
                    ? (isLightMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-700 text-white border-blue-700')
                    : (isLightMode ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800')
                }`}
              >
                {label}
              </button>
            ))}
            {/* Botão Atualizar (ao lado dos filtros) */}
            <button
              aria-label="Atualizar"
              title="Atualizar"
              onClick={async () => {
                try {
                  setRefreshing(true);
                  await fetchMovimentacoes();
                } finally {
                  setRefreshing(false);
                }
              }}
              disabled={refreshing}
            className={`hidden sm:flex rounded-full text-xs sm:text-sm transition-colors items-center justify-center w-8 h-8 sm:w-9 sm:h-9 ${
              isLightMode 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-blue-50 disabled:text-blue-300' 
                : 'bg-blue-900 text-blue-300 hover:bg-blue-800 disabled:bg-blue-950 disabled:text-blue-700'
            }`}
          >
              <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="sr-only">{refreshing ? 'Atualizando…' : 'Atualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Movimentações */}
      <div className={`max-h-80 sm:max-h-96 overflow-y-auto border rounded-lg ${
        isLightMode ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-900'
      }`}>
        {listaFiltrada.length === 0 ? (
          <div className="p-8 text-center">
            <p className={`text-lg ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Nenhuma movimentação encontrada {categoriaFiltro !== 'todas' ? `para ${categoriaFiltro}` : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {listaFiltrada.map((mov, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 border-b transition-colors hover:bg-opacity-50 ${
                  isLightMode 
                    ? 'border-gray-200 hover:bg-gray-100' 
                    : 'border-gray-700 hover:bg-gray-800'
                } ${index === listaFiltrada.length - 1 ? 'border-b-0' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                    {/* Ícone */}
                    <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                      mov.tipo === 'venda' 
                        ? 'bg-green-100 text-green-600' 
                        : mov.tipo === 'despesa'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {mov.tipo === 'venda' ? (
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : mov.tipo === 'despesa' ? (
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} truncate`}>
                        {mov.descricao}
                      </p>
                      
                      {/* Detalhes */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
                        <div className="flex items-center">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-gray-500 flex-shrink-0" />
                          <span className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'} truncate`}>
                            {mov.funcionario}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-gray-500 flex-shrink-0" />
                          <span className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            {formatarDataHora(mov.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Valor */}
                  {mov.valor !== undefined && mov.valor !== null && (
                    <div className={`text-right sm:text-left sm:ml-4 flex-shrink-0 ${getColorByType(mov.tipo)}`}>
                      <span className="font-bold text-xs sm:text-sm">
                        {mov.tipo === 'despesa' ? '-' : '+'}R$ {Math.abs(mov.valor).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleLogMaster;