import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Users, 
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import api from '../services/api';

const ResultadosCharts = () => {
  // Usar modo light como padrão sem depender do contexto
  const isLightMode = true;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    despesas: {
      totalSemana: 0,
      categoriaMaisGasta: ''
    },
    produtos: {
      maisVendido: '',
      baixoEstoque: []
    },
    vendas: {
      totalSemana: 0,
      maiorVenda: 0,
      crescimento: 0
    },
    funcionarios: {
      total: 0,
      movimentacoes: [],
      avisosAtivos: 0
    },
    relatorio: {
      lucroAnual: 0,
      ticketMedio: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados de despesas
        const despesasResponse = await api.get('/api/despesas/relatorio?periodo=semana');
        const despesasAnualResponse = await api.get('/api/despesas/relatorio?periodo=ano');
        
        // Encontrar categoria mais gasta anual
        const categoriaMaisGasta = Object.entries(despesasAnualResponse.data.totalPorCategoria || {})
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhuma';

        // Buscar dados de dashboard que já inclui produtos em baixo estoque
        const dashboardResponse = await api.get('/api/dashboard');
        const produtosBaixoEstoque = dashboardResponse.data.notificacoesDetalhadas || [];
        
        // Buscar dados de produtos para outras funcionalidades
        const produtosResponse = await api.get('/api/produtos');
        
        // Produto mais vendido (simulado - seria necessário endpoint específico)
        const produtoMaisVendido = produtosResponse.data[0]?.nome || 'Nenhum';

        // Buscar dados de vendas
        const vendasResponse = await api.get('/api/vendas');
        
        // Calcular início e fim da semana atual
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        const diasParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
        
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() + diasParaSegunda);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);
        
        const vendasSemana = vendasResponse.data.filter(venda => {
          const dataVenda = new Date(venda.createdAt || venda.data);
          return dataVenda >= inicioSemana && dataVenda <= fimSemana;
        });
        
        // Calcular maior venda da semana
        const maiorVendaSemana = vendasSemana.length > 0 ? 
          Math.max(...vendasSemana.map(venda => {
            if (venda.itensVenda && venda.itensVenda.length > 0) {
              return venda.itensVenda.reduce((total, item) => total + (item.preco * item.quantidade), 0);
            }
            return venda.total || 0;
          })) : 0;
        
        // Calcular vendas da semana anterior para comparação
        const inicioSemanaAnterior = new Date(inicioSemana);
        inicioSemanaAnterior.setDate(inicioSemana.getDate() - 7);
        const fimSemanaAnterior = new Date(fimSemana);
        fimSemanaAnterior.setDate(fimSemana.getDate() - 7);
        
        const vendasSemanaAnterior = vendasResponse.data.filter(venda => {
          const dataVenda = new Date(venda.createdAt || venda.data);
          return dataVenda >= inicioSemanaAnterior && dataVenda <= fimSemanaAnterior;
        });
        
        // Calcular percentual de crescimento
        const crescimentoVendas = vendasSemanaAnterior.length > 0 ? 
          ((vendasSemana.length - vendasSemanaAnterior.length) / vendasSemanaAnterior.length * 100) : 
          (vendasSemana.length > 0 ? 100 : 0);

        // Buscar dados de funcionários
        const funcionariosResponse = await api.get('/api/funcionarios');
        
        // Calcular ticket médio corretamente
        let ticketMedio = 0;
        if (vendasResponse.data && vendasResponse.data.length > 0) {
          const totalVendas = vendasResponse.data.reduce((acc, venda) => {
            if (venda.itensVenda && venda.itensVenda.length > 0) {
              return acc + venda.itensVenda.reduce((total, item) => total + (item.preco * item.quantidade), 0);
            }
            return acc + (venda.total || 0);
          }, 0);
          ticketMedio = totalVendas / vendasResponse.data.length;
        }

        setData({
          despesas: {
            totalSemana: despesasResponse.data.totalGeral || 0,
            categoriaMaisGasta: categoriaMaisGasta
          },
          produtos: {
            maisVendido: produtoMaisVendido,
            baixoEstoque: produtosBaixoEstoque
          },
          vendas: {
            totalSemana: vendasSemana.length,
            maiorVenda: maiorVendaSemana,
            crescimento: Math.round(crescimentoVendas)
          },
          funcionarios: {
            total: funcionariosResponse.data?.funcionarios?.length || 0,
            ativos: funcionariosResponse.data?.funcionarios?.filter(f => f.ativo !== false)?.length || 0,
            movimentacoes: [],
            avisosAtivos: 0
          },
          relatorio: {
            lucroAnual: 0,
            ticketMedio: ticketMedio
          }
        });

        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dados para os gráficos
  const vendasChartData = [
    { name: 'Semana Anterior', vendas: Math.max(0, data.vendas.totalSemana - Math.round(data.vendas.totalSemana * (data.vendas.crescimento / 100))) },
    { name: 'Semana Atual', vendas: data.vendas.totalSemana }
  ];

  const despesasChartData = [
    { name: 'Despesas', valor: data.despesas.totalSemana, fill: '#ef4444' },
    { name: 'Meta', valor: Math.max(data.despesas.totalSemana * 0.8, 1000), fill: '#22c55e' }
  ];

  const produtosChartData = data.produtos.baixoEstoque.slice(0, 5).map(produto => ({
    name: produto.nome.length > 10 ? produto.nome.substring(0, 10) + '...' : produto.nome,
    estoque: produto.estoque,
    fill: produto.estoque <= 5 ? '#ef4444' : '#f59e0b'
  }));

  const funcionariosChartData = [
    { name: 'Ativos', valor: data.funcionarios.ativos || data.funcionarios.total, fill: '#22c55e' },
    { name: 'Total', valor: data.funcionarios.total, fill: '#3b82f6' }
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

  // Layout original sem paginação interna

  const StatCard = ({ title, value, icon: Icon, color, trend, chart, isLoading = false }) => {
    const colorClasses = {
      blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
      green: "from-green-500/20 to-green-600/20 border-green-500/30",
      red: "from-red-500/20 to-red-600/20 border-red-500/30",
      purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
      orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30"
    };

    const iconColors = {
      blue: "text-blue-400",
      green: "text-green-400",
      red: "text-red-400",
      purple: "text-purple-400",
      orange: "text-orange-400"
    };
    
    // Card original com ajuste de tamanho para mobile (igual às guias)
    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm border rounded-lg md:rounded-xl p-2 md:p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full min-h-[120px] md:min-h-[150px]`}>
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className={`p-1 md:p-1.5 rounded-lg bg-white/10`}>
            <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${iconColors[color]}`} />
          </div>
          {isLoading ? (
            <div className="w-10 h-4 md:w-12 md:h-4 bg-white/20 rounded animate-pulse"></div>
          ) : (
            trend !== undefined && (
              <div className={`flex items-center text-[11px] md:text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend > 0 ? <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" /> : <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                {Math.abs(trend)}%
              </div>
            )
          )}
        </div>
        
        <div className="mb-2 md:mb-3">
          <h3 className="text-xs md:text-xs font-medium text-white/80 mb-1">{title}</h3>
          {isLoading ? (
            <div className="w-20 h-6 md:w-24 md:h-6 bg-white/20 rounded animate-pulse"></div>
          ) : (
            <p className="text-base md:text-xl font-bold text-white">{value}</p>
          )}
        </div>
        
        {chart && (
          <div className="h-12 md:h-16 w-full">
            {chart}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Header removido conforme solicitação */}

        {/* Skeleton sem snap: três grids empilhados */}
        <div className="space-y-4">
          {/* Página 1 - Vendas */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
            <StatCard title="Vendas da Semana" value="" icon={ShoppingCart} color="blue" isLoading={true} />
            <StatCard title="Maior Venda da Semana" value="" icon={TrendingUp} color="green" isLoading={true} />
          </div>

          {/* Página 2 - Despesas e Produtos */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
            <StatCard title="Despesas da Semana" value="" icon={DollarSign} color="red" isLoading={true} />
            <StatCard title="Produtos em Baixo Estoque" value="" icon={Package} color="orange" isLoading={true} />
          </div>

          {/* Página 3 - Usuários e Ticket Médio */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
            <StatCard title="Usuários com Acesso" value="" icon={Users} color="purple" isLoading={true} />
            <StatCard title="Ticket Médio" value="" icon={FileText} color="blue" isLoading={true} />
          </div>
        </div>

        
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header removido conforme solicitação */}

      {/* Vendas */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
        <StatCard
          title="Vendas da Semana"
          value={data.vendas.totalSemana.toString()}
          icon={ShoppingCart}
          color="blue"
          trend={data.vendas.crescimento}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vendasChartData}>
                <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        />

        <StatCard
          title="Maior Venda da Semana"
          value={`R$ ${data.vendas.maiorVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="green"
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Maior Venda', valor: data.vendas.maiorVenda }]}>
                <Bar dataKey="valor" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      </div>

      {/* Despesas e Produtos */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
        <StatCard
          title="Despesas da Semana"
          value={`R$ ${data.despesas.totalSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="red"
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={despesasChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                  dataKey="valor"
                >
                  {despesasChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
              </PieChart>
            </ResponsiveContainer>
          }
        />

        <StatCard
          title="Produtos em Baixo Estoque"
          value={data.produtos.baixoEstoque.length.toString()}
          icon={Package}
          color="orange"
          chart={
            produtosChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={produtosChartData}>
                  <Bar dataKey="estoque" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid #f59e0b',
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                    formatter={(value) => [`${value} unidades`, 'Estoque']}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-white/60 text-sm">
                Nenhum produto em baixo estoque
              </div>
            )
          }
        />
      </div>

      {/* Usuários com Acesso e Relatório */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
        <StatCard
          title="Usuários com Acesso"
          value={data.funcionarios.total.toString()}
          icon={Users}
          color="purple"
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funcionariosChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                  dataKey="valor"
                >
                  {funcionariosChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          }
        />

        <StatCard
          title="Ticket Médio"
          value={`R$ ${data.relatorio.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={FileText}
          color="blue"
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Atual', valor: data.relatorio.ticketMedio },
                { name: 'Meta', valor: data.relatorio.ticketMedio * 1.2 }
              ]}>
                <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
      </div>
    </div>

    
  );
};

export default ResultadosCharts;