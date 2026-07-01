import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from 'recharts';
import {
  Search,
  MoreHorizontal,
  Calendar,
  Calculator,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Printer,
  Package,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import axios from 'axios';

// Função utilitária para formatar valores em Real
const formatarReal = (valor) => {
  if (typeof valor !== 'number') return 'R$ 0,00';
  try {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    return `R$ ${Number(valor || 0).toFixed(2)}`.replace('.', ',');
  }
};

// =======================
// Configuração do Axios
// =======================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const axiosAuth = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosAuth.interceptors.request.use((config) => {
  const usuario = localStorage.getItem('usuario');
  if (usuario) {
    const userData = JSON.parse(usuario);
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  return config;
});

// =======================
// Componente de relatórios
// =======================
const COLORS = ['#8B5CF6', '#F87171', '#34D399', '#60A5FA', '#FBBF24'];

export const DashboardRelatorios = ({ period = 'Outubro' }) => {
  const [cardData, setCardData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para busca na tabela de categorias/produtos
  const [productQuery, setProductQuery] = useState('');
  const filteredProductData = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return productData;
    return productData.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [productData, productQuery]);
  const [faturamento, setFaturamento] = useState(0);
  const [vendasHoje, setVendasHoje] = useState(0);
  const [produtosBaixos, setProdutosBaixos] = useState([]);
  const [activeTab, setActiveTab] = useState('produtos');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Relatório por período
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [horaInicio, setHoraInicio] = useState('00:00');
  const [horaFim, setHoraFim] = useState('23:59');
  const [relatorioPeriodo, setRelatorioPeriodo] = useState(null);
  const [loadingPeriodo, setLoadingPeriodo] = useState(false);
  const [percentualComissao, setPercentualComissao] = useState(10);
  // Estados para vendas individuais do dia filtrado
  const [vendasIndividuais, setVendasIndividuais] = useState([]);
  const [loadingVendasIndividuais, setLoadingVendasIndividuais] = useState(false);

  // Análise financeira automática
  const [periodoAnalise, setPeriodoAnalise] = useState('dia');
  const [dadosFinanceiros, setDadosFinanceiros] = useState({
    faturamentoTotal: 0,
    despesaTotal: 0,
    lucroAtual: 0,
    ticketMedio: 0,
  });
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);

  // =======================
  // Carregar dashboard
  // =======================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosAuth.get('/api/relatorios/dashboard');
        const data = response.data;

        setCardData(data.cardData || []);
        setLineChartData(data.lineChartData || []);
        setPieChartData(data.pieChartData || []);
        setProductData(data.productData || []);

        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar dados. Verifique sua conexão ou faça login novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =======================
  // Carregar dados do card de faturamento
  // =======================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosAuth.get('/api/dashboard');
        const data = response.data;
        
        setFaturamento(data.faturamento ?? 0);
        setVendasHoje((typeof data.vendas === 'number' ? data.vendas : data.vendasHoje) ?? 0);
        setProdutosBaixos(Array.isArray(data.notificacoesDetalhadas) ? data.notificacoesDetalhadas : (data.produtosBaixos || []));
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // =======================
  // Buscar relatório por período
  // =======================
  const buscarRelatorioPeriodo = async () => {
    if (!dataInicio || !dataFim) {
      // troca silenciosa: não interromper fluxo com alert
      return;
    }

    const dataInicioCompleta = new Date(`${dataInicio}T${horaInicio}:00`);
    const dataFimCompleta = new Date(`${dataFim}T${horaFim}:59`);

    if (dataInicioCompleta > dataFimCompleta) {
      // troca silenciosa: não interromper fluxo com alert
      return;
    }

    try {
      setLoadingPeriodo(true);
      setVendasIndividuais([]);
      // Relatório agregado
      const response = await axiosAuth.get('/api/relatorios/periodo', {
        params: { 
          dataInicio: dataInicioCompleta.toISOString(), 
          dataFim: dataFimCompleta.toISOString() 
        },
      });
      setRelatorioPeriodo(response.data);

      // Vendas individuais do período
      setLoadingVendasIndividuais(true);
      const vendasResp = await axiosAuth.get('/api/vendas');
      const vendasFiltradas = (vendasResp.data || [])
        .filter((v) => {
          const created = new Date(v.createdAt);
          return created >= dataInicioCompleta && created <= dataFimCompleta && v.finalizada;
        })
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((v) => {
          const dataUTC = new Date(v.createdAt);
          const valor = (v.itensVenda || []).reduce((subtotal, item) => subtotal + (item.preco * item.quantidade), 0);
          const dataBR = dataUTC.toLocaleDateString('pt-BR', { timeZone: 'America/Recife' });
          const horaBR = dataUTC.toLocaleTimeString('pt-BR', { timeZone: 'America/Recife', hour: '2-digit', minute: '2-digit', hour12: false });
          return { id: v.id, valor, data: dataBR, hora: horaBR };
        });
      setVendasIndividuais(vendasFiltradas);
    } catch (err) {
      setError('Erro ao buscar dados do período. Tente novamente.');
    } finally {
      setLoadingVendasIndividuais(false);
      setLoadingPeriodo(false);
    }
  };

  // =======================
  // Buscar dados financeiros
  // =======================
  const buscarDadosFinanceiros = async () => {
    try {
      setLoadingFinanceiro(true);

      const hoje = new Date();
      let dataInicio, dataFim;

      switch (periodoAnalise) {
        case 'dia':
          dataInicio = new Date(hoje);
          dataInicio.setHours(0, 0, 0, 0);
          dataFim = new Date(hoje);
          dataFim.setHours(23, 59, 59, 999);
          break;
        case 'semana':
          dataInicio = new Date(hoje);
          dataInicio.setDate(hoje.getDate() - hoje.getDay());
          dataInicio.setHours(0, 0, 0, 0);
          dataFim = new Date(hoje);
          dataFim.setHours(23, 59, 59, 999);
          break;
        case 'mes':
          dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
          dataFim.setHours(23, 59, 59, 999);
          break;
        case 'ano':
          dataInicio = new Date(hoje.getFullYear(), 0, 1);
          dataFim = new Date(hoje.getFullYear(), 11, 31);
          dataFim.setHours(23, 59, 59, 999);
          break;
        default:
          dataInicio = new Date(0);
          dataFim = hoje;
      }

      // Preparar datas para despesas (UTC puro, já que despesas são salvas sem hora como 00:00 UTC)
      // Isso garante que despesas do dia 28 (00:00 UTC) sejam incluídas mesmo se o filtro local começar às 03:00 UTC (devido ao fuso -3)
      const dataInicioDespesas = new Date(Date.UTC(
        dataInicio.getFullYear(), 
        dataInicio.getMonth(), 
        dataInicio.getDate(), 
        0, 0, 0
      ));
      
      const dataFimDespesas = new Date(Date.UTC(
        dataFim.getFullYear(), 
        dataFim.getMonth(), 
        dataFim.getDate(), 
        23, 59, 59, 999
      ));

      const responseVendas = await axiosAuth.get('/api/relatorios/periodo', {
        params: {
          // Enviar o ISO completo com data e hora para o backend
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString(),
        },
      });

      const responseDespesas = await axiosAuth.get('/api/despesas/relatorio', {
        params: { 
          periodo: periodoAnalise,
          dataInicio: dataInicioDespesas.toISOString(),
          dataFim: dataFimDespesas.toISOString()
        },
      });

      const faturamentoTotal = responseVendas.data.faturamentoTotal || 0;
      const totalVendas = responseVendas.data.totalVendas || 0;
      const despesaTotal = responseDespesas.data.totalGeral || 0;
      const lucroAtual = faturamentoTotal - despesaTotal;
      const ticketMedio = totalVendas > 0 ? (faturamentoTotal / totalVendas) : 0;

      setDadosFinanceiros({
        faturamentoTotal,
        despesaTotal,
        lucroAtual,
        ticketMedio,
      });
    } catch (error) {
      setDadosFinanceiros({
        faturamentoTotal: 0,
        despesaTotal: 0,
        lucroAtual: 0,
        ticketMedio: 0,
      });
    } finally {
      setLoadingFinanceiro(false);
    }
  };

  useEffect(() => {
    buscarDadosFinanceiros();
  }, [periodoAnalise]);

  // =======================
  // Helpers
  // =======================
  // Utilitários diversos (mantendo formatarReal definido no topo do arquivo)

  // Função para alternar modo de privacidade
  const togglePrivacyMode = () => {
    setIsPrivacyMode(!isPrivacyMode);
  };

  // Função para mascarar valores sensíveis
  const maskValue = (value, type = 'currency') => {
    if (!isPrivacyMode) return value;
    
    if (type === 'currency') {
      return 'R$ ••••••';
    } else if (type === 'number') {
      return '••••';
    }
    return '••••••';
  };

  // Configuração das abas do card de faturamento
  const tabs = [
    {
      id: 'produtos',
      label: 'Produtos em Baixa',
      subtitle: 'Itens com estoque baixo',
      icon: AlertTriangle,
      value: loading ? "..." : `${produtosBaixos.length}`,
      iconColor: 'text-orange-500'
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Função para imprimir PDF da tela atual
  const imprimirPDF = () => {
    // Aguardar um pouco para garantir que todos os dados estejam carregados
    setTimeout(() => {
      document.body.classList.add('printing');
      const printHeader = document.createElement('div');
      printHeader.className = 'print-header-custom';
      const dataStr = new Date().toLocaleDateString('pt-BR');
      const horaStr = new Date().toLocaleTimeString('pt-BR');
      printHeader.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; padding: 15px; border-bottom: 2px solid #333;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: black;">RELATÓRIO FINANCEIRO</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Gerado em: ${dataStr} às ${horaStr}</p>
        </div>
      `;
      const mainContent = document.querySelector('.max-w-7xl');
      if (mainContent) {
        mainContent.insertBefore(printHeader, mainContent.firstChild);
      }
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing');
        if (printHeader && printHeader.parentNode) {
          printHeader.parentNode.removeChild(printHeader);
        }
      }, 1000);
    }, 500);
  };

  // Exportar XML do relatório por período e vendas individuais
  const exportarXMLPeriodo = () => {
    if (!relatorioPeriodo) return;
    try {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<relatorio>\n';
      
      // Resumo do período
      xml += '  <resumo>\n';
      xml += `    <totalVendas>${relatorioPeriodo.totalVendas || 0}</totalVendas>\n`;
      xml += `    <faturamentoTotal>${relatorioPeriodo.faturamentoTotal || 0}</faturamentoTotal>\n`;
      xml += `    <percentualComissao>${percentualComissao}</percentualComissao>\n`;
      xml += `    <valorComissao>${(relatorioPeriodo.faturamentoTotal || 0) * (percentualComissao / 100)}</valorComissao>\n`;
      xml += '  </resumo>\n';

      // Vendas por dia
      if (Array.isArray(relatorioPeriodo.vendasPorDia)) {
        xml += '  <vendasPorDia>\n';
        relatorioPeriodo.vendasPorDia.forEach(dia => {
          const data = new Date(dia.data).toLocaleDateString('pt-BR');
          const comissaoDia = (dia.faturamento || 0) * (percentualComissao / 100);
          xml += '    <dia>\n';
          xml += `      <data>${data}</data>\n`;
          xml += `      <totalVendas>${dia.totalVendas || 0}</totalVendas>\n`;
          xml += `      <faturamento>${dia.faturamento || 0}</faturamento>\n`;
          xml += `      <comissao>${comissaoDia}</comissao>\n`;
          xml += '    </dia>\n';
        });
        xml += '  </vendasPorDia>\n';
      }

      // Vendas individuais do dia filtrado
      if (Array.isArray(vendasIndividuais) && vendasIndividuais.length > 0) {
        xml += '  <vendasIndividuais>\n';
        vendasIndividuais.forEach(v => {
          xml += '    <venda>\n';
          xml += `      <data>${v.data}</data>\n`;
          xml += `      <hora>${v.hora}</hora>\n`;
          xml += `      <valor>${v.valor || 0}</valor>\n`;
          xml += '    </venda>\n';
        });
        xml += '  </vendasIndividuais>\n';
      }

      xml += '</relatorio>';

      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dataAtual = new Date();
      const nome = `relatorio_comissoes_${dataAtual.toISOString().split('T')[0]}.xml`;
      link.download = nome;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao exportar XML:', e);
    }
  };

  return (
    <div className="bg-[#0f0b2e] text-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Card de Faturamento do Dia */}
        <div className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="bg-[#0f0b2e] rounded-xl p-4 sm:p-6 border border-gray-700">
            {/* Navegação das abas */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${tab.iconColor}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Conteúdo da aba ativa */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {currentTab?.label}
                  </h3>
                  <button
                    onClick={togglePrivacyMode}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {isPrivacyMode ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Mostrar valores
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Ocultar valores
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                {currentTab?.subtitle}
              </p>

              <div className="text-3xl font-bold text-white mb-4">
                {currentTab?.value}
              </div>

              {/* Conteúdo específico para produtos em baixa */}
              {activeTab === 'produtos' && produtosBaixos.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Produtos com estoque baixo:
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {produtosBaixos.slice(0, 5).map((produto, index) => (
                      <div
                        key={index}
                        className="text-xs text-orange-300 bg-orange-900/20 px-2 py-1 rounded"
                      >
                        {produto.nome} - Estoque: {produto.quantidade}
                      </div>
                    ))}
                    {produtosBaixos.length > 5 && (
                      <div className="text-xs text-gray-400">
                        +{produtosBaixos.length - 5} produtos...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção: Análise Financeira Automática */}
        <div className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div id="relatorio-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              <h2 className="text-lg sm:text-xl font-semibold">Análise Financeira Automática</h2>
            </div>
            
            {/* Botão de Impressão PDF */}
            <button
              onClick={imprimirPDF}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              title="Imprimir Relatório em PDF"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Imprimir PDF</span>
            </button>
          </div>

          {/* Filtros de Período - Movidos para cima dos cards */}
          <div 
            className="mb-6" 
            style={{ 
              backgroundColor: '#2d1b69', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #8B5CF6',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            <div className="flex flex-col gap-4">
              <h3 style={{ 
                color: '#ffffff', 
                fontWeight: 'bold', 
                fontSize: '16px',
                margin: '0 0 12px 0',
                textAlign: 'center'
              }}>
                🔄 SELECIONE O PERÍODO PARA ANÁLISE
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '12px',
                justifyItems: 'center'
              }}>
                {[
                  { key: 'dia', label: '📅 DIA', desc: 'Hoje' },
                  { key: 'semana', label: '📊 SEMANA', desc: 'Esta semana' },
                  { key: 'mes', label: '📈 MÊS', desc: 'Este mês' },
                  { key: 'ano', label: '🗓️ ANO', desc: 'Este ano' }
                ].map(periodo => (
                  <button
                    key={periodo.key}
                    onClick={() => {
                      setPeriodoAnalise(periodo.key);
                    }}
                    style={{
                      width: '100%',
                      minWidth: '120px',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      border: periodoAnalise === periodo.key ? '3px solid #ffffff' : '2px solid #666',
                      cursor: 'pointer',
                      backgroundColor: periodoAnalise === periodo.key ? '#8B5CF6' : '#1a1a2e',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      boxShadow: periodoAnalise === periodo.key 
                        ? '0 0 20px rgba(139, 92, 246, 0.8)' 
                        : '0 2px 8px rgba(0,0,0,0.3)',
                      transform: periodoAnalise === periodo.key ? 'scale(1.05)' : 'scale(1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      if (periodoAnalise !== periodo.key) {
                        e.target.style.backgroundColor = '#4c1d95';
                        e.target.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (periodoAnalise !== periodo.key) {
                        e.target.style.backgroundColor = '#1a1a2e';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{periodo.label}</span>
                    <span style={{ fontSize: '10px', opacity: '0.8' }}>{periodo.desc}</span>
                  </button>
                ))}
              </div>
              
              <div style={{ 
                color: '#ffffff', 
                fontSize: '14px', 
                textAlign: 'center',
                backgroundColor: '#1a1a2e',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #444'
              }}>
                ✅ <strong>Período Ativo:</strong> {periodoAnalise.toUpperCase()} | 
                ⏳ <strong>Carregando:</strong> {loadingFinanceiro ? 'SIM' : 'NÃO'}
              </div>
            </div>
          </div>
          
          {loadingFinanceiro ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-300">Carregando dados financeiros...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Card Faturamento Total */}
              <div className="bg-[#0f0b2e] rounded-lg p-6 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-300">Faturamento Total</h3>
                    <p className="text-xs text-gray-500 capitalize">{periodoAnalise === 'dia' ? 'Hoje' : periodoAnalise === 'mes' ? 'Este mês' : periodoAnalise === 'semana' ? 'Esta semana' : 'Este ano'}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {formatarReal(dadosFinanceiros.faturamentoTotal)}
                </p>
              </div>
              
              {/* Card Despesa Total */}
              <div className="bg-[#0f0b2e] rounded-lg p-6 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-300">Despesa Total</h3>
                    <p className="text-xs text-gray-500 capitalize">{periodoAnalise === 'dia' ? 'Hoje' : periodoAnalise === 'mes' ? 'Este mês' : periodoAnalise === 'semana' ? 'Esta semana' : 'Este ano'}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatarReal(dadosFinanceiros.despesaTotal)}
                </p>
              </div>
              
              {/* Card Lucro Atual */}
              <div className={`bg-[#0f0b2e] rounded-lg p-6 border-2 ${
                dadosFinanceiros.lucroAtual >= 0 
                  ? 'border-purple-500/30' 
                  : 'border-orange-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    dadosFinanceiros.lucroAtual >= 0 
                      ? 'bg-purple-500/20' 
                      : 'bg-orange-500/20'
                  }`}>
                    <Calculator className={`h-6 w-6 ${
                      dadosFinanceiros.lucroAtual >= 0 
                        ? 'text-purple-400' 
                        : 'text-orange-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-300">Lucro Atual</h3>
                    <p className="text-xs text-gray-500">Faturamento - Despesas</p>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${
                  dadosFinanceiros.lucroAtual >= 0 
                    ? 'text-purple-400' 
                    : 'text-orange-400'
                }`}>
                  {formatarReal(dadosFinanceiros.lucroAtual)}
                </p>
                {dadosFinanceiros.lucroAtual < 0 && (
                  <p className="text-xs text-orange-300 mt-2">
                    ⚠️ Despesas superiores ao faturamento
                  </p>
                )}
              </div>

              {/* Card Ticket Médio */}
              <div className="bg-[#0f0b2e] rounded-lg p-6 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-300">Ticket Médio</h3>
                    <p className="text-xs text-gray-500">Faturamento / Total de Vendas</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {formatarReal(dadosFinanceiros.ticketMedio)}
                </p>
              </div>
            </div>
          )}
          
          {/* Resumo Percentual */}
          {!loadingFinanceiro && dadosFinanceiros.faturamentoTotal > 0 && (
            <div id="resumo-percentual" className="mt-6 bg-[#0f0b2e] rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Análise Percentual</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Margem de Lucro:</span>
                  <span className={`font-bold ${
                    (dadosFinanceiros.lucroAtual / dadosFinanceiros.faturamentoTotal * 100) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {((dadosFinanceiros.lucroAtual / dadosFinanceiros.faturamentoTotal) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Despesas sobre Faturamento:</span>
                  <span className="font-bold text-yellow-400">
                    {((dadosFinanceiros.despesaTotal / dadosFinanceiros.faturamentoTotal) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nova seção: Relatório por Período para Comissões */}
        <div className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-semibold">Relatório por Período - Comissões</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-[#0f0b2e] text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora Início
              </label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full bg-[#0f0b2e] text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full bg-[#0f0b2e] text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora Fim
              </label>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="w-full bg-[#0f0b2e] text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comissão (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={percentualComissao}
                onChange={(e) => setPercentualComissao(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0f0b2e] text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-end">
              <div className="flex w-full gap-3">
                <button
                  onClick={buscarRelatorioPeriodo}
                  disabled={loadingPeriodo}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loadingPeriodo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </button>
                <button
                  onClick={exportarXMLPeriodo}
                  disabled={!relatorioPeriodo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Exportar XML
                </button>
              </div>
            </div>
          </div>

          {/* Resultados do relatório por período */}
          {relatorioPeriodo && (
            <div className="bg-[#0f0b2e] rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                Resultados do Período
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Card de Vendas Totais */}
                <div className="bg-[#1e1b4b] rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Total de Vendas</p>
                    <p className="text-2xl font-bold text-blue-400">{relatorioPeriodo.totalVendas}</p>
                    <p className="text-xs text-gray-500">vendas realizadas</p>
                  </div>
                </div>

                {/* Card de Faturamento Total */}
                <div className="bg-[#1e1b4b] rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Faturamento Total</p>
                    <p className="text-2xl font-bold text-green-400">{formatarReal(relatorioPeriodo.faturamentoTotal)}</p>
                    <p className="text-xs text-gray-500">no período selecionado</p>
                  </div>
                </div>

                {/* Card de Comissão */}
                <div className="bg-[#1e1b4b] rounded-lg p-4 border-2 border-purple-500">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Comissão ({percentualComissao}%)</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatarReal(relatorioPeriodo.faturamentoTotal * (percentualComissao / 100))}
                    </p>
                    <p className="text-xs text-gray-500">valor da comissão</p>
                  </div>
                </div>
              </div>

              {/* Detalhes por dia */}
              {relatorioPeriodo.vendasPorDia && relatorioPeriodo.vendasPorDia.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm sm:text-md font-semibold mb-3">Vendas por Dia</h4>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full px-4 sm:px-0">
                      <table className="w-full text-xs sm:text-sm min-w-[500px]">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-600">
                            <th className="pb-2 pr-2">Data</th>
                            <th className="pb-2 pr-2">Vendas</th>
                            <th className="pb-2 pr-2">Faturamento</th>
                            <th className="pb-2">Comissão</th>
                          </tr>
                        </thead>
                        <tbody>
                          {relatorioPeriodo.vendasPorDia.map((dia, index) => (
                            <tr key={index} className="border-b border-gray-700">
                              <td className="py-2 pr-2">{new Date(dia.data).toLocaleDateString('pt-BR')}</td>
                              <td className="py-2 pr-2">{dia.totalVendas}</td>
                              <td className="py-2 pr-2">{formatarReal(dia.faturamento)}</td>
                              <td className="py-2 text-purple-400 font-medium">
                                {formatarReal(dia.faturamento * (percentualComissao / 100))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendas individuais do dia filtrado */}
              <div className="mt-6">
                <h4 className="text-sm sm:text-md font-semibold mb-3">Vendas individuais do dia filtrado</h4>
                {loadingVendasIndividuais ? (
                  <p className="text-gray-400 text-sm">Carregando vendas...</p>
                ) : vendasIndividuais.length === 0 ? (
                  <p className="text-gray-400 text-sm">Nenhuma venda encontrada no dia filtrado.</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full px-4 sm:px-0">
                      <table className="w-full text-xs sm:text-sm min-w-[500px]">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-600">
                            <th className="pb-2 pr-2">Data</th>
                            <th className="pb-2 pr-2">Hora</th>
                            <th className="pb-2">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendasIndividuais.map((venda, index) => (
                            <tr key={index} className="border-b border-gray-700">
                              <td className="py-2 pr-2">{venda.data}</td>
                              <td className="py-2 pr-2">{venda.hora}</td>
                              <td className="py-2 text-green-400 font-medium">{formatarReal(venda.valor)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mensagem de carregamento ou erro */}
        {loading ? (
          <div className="w-full p-8 text-center">
            <p className="text-white text-lg">Carregando dados do relatório...</p>
          </div>
        ) : error ? (
          <div className="w-full p-8 text-center bg-red-500/10 rounded-lg">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : (
          <>
            {/* Cards de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {cardData.map((card, index) => (
                <div key={index} className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6 shadow-lg min-h-[120px] flex items-center justify-center">
                  <div className="flex flex-col text-center w-full">
                    <span className="text-xs sm:text-sm text-gray-400">{card.title}</span>
                    <span className="text-lg sm:text-2xl font-bold mt-1">{card.value}</span>
                    <span className="text-xs text-gray-400 mt-1">{card.subtitle}</span>
                    {card.change && (
                      <div className="flex items-center mt-2">
                        <span className={cn(
                          "text-xs",
                          card.isPositive ? "text-green-400" : "text-red-400"
                        )}>
                          {card.isPositive ? "↑" : "↓"} {card.change}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico de categorias mais vendidas */}
            <div className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Faturamento Diário</h2>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={lineChartData}>
                    <XAxis 
                      dataKey="name" 
                      scale="band" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#4b5563' }}
                      tickLine={{ stroke: '#4b5563' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#4b5563' }}
                      tickLine={{ stroke: '#4b5563' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4b5563' }}
                      itemStyle={{ color: '#e5e7eb' }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Seção de tabela e gráfico de pizza */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Tabela de produtos */}
              <div className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                  <h2 className="text-base sm:text-lg font-semibold">Produto Mais Vendido</h2>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      className="bg-[#0f0b2e] text-white pl-8 pr-4 py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-full px-4 sm:px-0">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs sm:text-sm">
                          <th className="pb-2 pr-2">Produtos</th>
                          <th className="pb-2 pr-2">Unidades</th>
                          <th className="pb-2 pr-2">Valor</th>
                          <th className="pb-2">Portfólio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProductData.map((product, index) => (
                          <tr key={index} className="border-t border-gray-700">
                            <td className="py-3 pr-2 flex items-center gap-2">
                              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-xs ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-red-500' : 'bg-orange-500'}`}>
                                {index === 0 ? '✓' : index === 1 ? '✗' : '!'}
                              </div>
                              <span className="text-xs sm:text-sm">{product.name}</span>
                            </td>
                            <td className="py-3 pr-2 text-xs sm:text-sm">{product.sales.toFixed(2)}</td>
                            <td className="py-3 pr-2 text-xs sm:text-sm">{product.revenue.toFixed(2)}</td>
                            <td className="py-3 text-xs sm:text-sm">{product.portfolio.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Gráfico de pizza */}
              <div className="bg-[#1e1b4b] rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base sm:text-lg font-semibold">Grafico</h2>
                  <button className="bg-[#0f0b2e] p-2 rounded-lg">
                    <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#374151' }}
                        itemStyle={{ color: '#f3f4f6' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-xs sm:text-sm font-medium mb-2">Legenda:</h3>
                  <div className="space-y-1 sm:space-y-2">
                    {pieChartData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-xs sm:text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};