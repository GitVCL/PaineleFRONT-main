import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Plus, X, Trash2, PieChart, BarChart3, CreditCard, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetorFinanceiro = () => {
  const navigate = useNavigate();
  const [transacoes, setTransacoes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroData, setFiltroData] = useState('todos');
  const [tipoTransacao, setTipoTransacao] = useState('receita');
  
  // Estados do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Vendas');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');

  // Dados simulados para demonstração
  useEffect(() => {
    const transacoesSimuladas = [
      {
        id: 1,
        tipo: 'receita',
        descricao: 'Venda de Produtos - Cliente João',
        valor: 1250.00,
        categoria: 'Vendas',
        data: new Date().toISOString(),
        observacoes: 'Pagamento à vista'
      },
      {
        id: 2,
        tipo: 'despesa',
        descricao: 'Compra de Materiais',
        valor: 350.00,
        categoria: 'Materiais',
        data: new Date(Date.now() - 86400000).toISOString(),
        observacoes: 'Estoque mensal'
      },
      {
        id: 3,
        tipo: 'receita',
        descricao: 'Venda de Serviços - Cliente Maria',
        valor: 800.00,
        categoria: 'Serviços',
        data: new Date(Date.now() - 172800000).toISOString(),
        observacoes: 'Pagamento parcelado'
      },
      {
        id: 4,
        tipo: 'despesa',
        descricao: 'Pagamento de Energia Elétrica',
        valor: 280.00,
        categoria: 'Energia',
        data: new Date(Date.now() - 259200000).toISOString(),
        observacoes: 'Conta mensal'
      },
      {
        id: 5,
        tipo: 'receita',
        descricao: 'Venda Online - E-commerce',
        valor: 450.00,
        categoria: 'Vendas Online',
        data: new Date(Date.now() - 345600000).toISOString(),
        observacoes: 'Pagamento via PIX'
      }
    ];
    setTransacoes(transacoesSimuladas);
  }, []);

  const categorias = {
    receita: ['Vendas', 'Serviços', 'Vendas Online', 'Consultoria', 'Outros'],
    despesa: ['Materiais', 'Energia', 'Internet', 'Aluguel', 'Marketing', 'Transporte', 'Alimentação', 'Equipamentos', 'Outros']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!descricao || !valor || !categoria || !data) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novaTransacao = {
      id: Date.now(),
      tipo: tipoTransacao,
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      categoria,
      data: new Date(data).toISOString(),
      observacoes
    };

    setTransacoes([novaTransacao, ...transacoes]);
    
    // Limpar formulário
    setDescricao('');
    setValor('');
    setCategoria(categorias[tipoTransacao][0]);
    setData(new Date().toISOString().split('T')[0]);
    setObservacoes('');
    setIsModalOpen(false);
    
    alert(`${tipoTransacao === 'receita' ? 'Receita' : 'Despesa'} registrada com sucesso!`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransacoes(transacoes.filter(t => t.id !== id));
      alert('Transação excluída com sucesso!');
    }
  };

  // Filtrar transações por período
  const filtrarTransacoes = () => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    return transacoes.filter(transacao => {
      const dataTransacao = new Date(transacao.data);
      
      switch (filtroData) {
        case 'hoje':
          return dataTransacao.toDateString() === new Date().toDateString();
        case 'semana':
          return dataTransacao >= inicioSemana;
        case 'mes':
          return dataTransacao >= inicioMes;
        default:
          return true;
      }
    });
  };

  const transacoesFiltradas = filtrarTransacoes();
  
  // Calcular totais
  const totalReceitas = transacoesFiltradas
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);
    
  const totalDespesas = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);
    
  const saldoLiquido = totalReceitas - totalDespesas;
  
  // Agrupar por categoria
  const receitasPorCategoria = transacoesFiltradas
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});
    
  const despesasPorCategoria = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
      return acc;
    }, {});

  const topReceitas = Object.entries(receitasPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
    
  const topDespesas = Object.entries(despesasPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="py-8">
      {/* Container centralizado */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Setor Financeiro</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nova Transação
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'hoje', label: 'Hoje' },
            { key: 'semana', label: 'Esta Semana' },
            { key: 'mes', label: 'Este Mês' },
            { key: 'todos', label: 'Todos' }
          ].map(filtro => (
            <button
              key={filtro.key}
              onClick={() => setFiltroData(filtro.key)}
              className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                filtroData === filtro.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {/* Cards de Resumo Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="text-green-400" size={20} />
              <h3 className="text-sm font-semibold text-white">Total Receitas</h3>
            </div>
            <p className="text-xl font-bold text-green-400">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="text-red-400" size={20} />
              <h3 className="text-sm font-semibold text-white">Total Despesas</h3>
            </div>
            <p className="text-xl font-bold text-red-400">R$ {totalDespesas.toFixed(2)}</p>
          </div>
          
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className={`${saldoLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`} size={20} />
              <h3 className="text-sm font-semibold text-white">Saldo Líquido</h3>
            </div>
            <p className={`text-xl font-bold ${saldoLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {saldoLiquido.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="text-blue-400" size={20} />
              <h3 className="text-sm font-semibold text-white">Transações</h3>
            </div>
            <p className="text-xl font-bold text-white">{transacoesFiltradas.length}</p>
          </div>
        </div>

        {/* Análise por Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Receitas */}
          {topReceitas.length > 0 && (
            <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="text-green-400" size={20} />
                Principais Receitas
              </h3>
              <div className="space-y-2">
                {topReceitas.map(([categoria, valor], index) => (
                  <div key={categoria} className="flex justify-between items-center">
                    <span className="text-white text-sm">{index + 1}. {categoria}</span>
                    <span className="text-green-400 font-bold text-sm">R$ {valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Despesas */}
          {topDespesas.length > 0 && (
            <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <TrendingDown className="text-red-400" size={20} />
                Principais Despesas
              </h3>
              <div className="space-y-2">
                {topDespesas.map(([categoria, valor], index) => (
                  <div key={categoria} className="flex justify-between items-center">
                    <span className="text-white text-sm">{index + 1}. {categoria}</span>
                    <span className="text-red-400 font-bold text-sm">R$ {valor.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Transações */}
        <div className="bg-[#1e1b4b] border border-white/20 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Transações Recentes</h3>
          
          {transacoesFiltradas.length === 0 ? (
            <p className="text-white/70 text-center py-6 text-sm">Nenhuma transação encontrada para o período selecionado.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {transacoesFiltradas.map(transacao => (
                <div key={transacao.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transacao.tipo === 'receita' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{transacao.descricao}</h4>
                      <p className="text-white/70 text-xs">
                        {transacao.categoria} • {new Date(transacao.data).toLocaleDateString('pt-BR')}
                        {transacao.observacoes && ` • ${transacao.observacoes}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${
                      transacao.tipo === 'receita' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(transacao.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={18} />
            </button>
            
            <h2 className="text-lg font-bold mb-4 text-gray-800">Nova Transação Financeira</h2>
          
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Tipo de Transação */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipoTransacao('receita');
                    setCategoria(categorias.receita[0]);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    tipoTransacao === 'receita'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ArrowUpCircle size={16} className="inline mr-1" />
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoTransacao('despesa');
                    setCategoria(categorias.despesa[0]);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    tipoTransacao === 'despesa'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ArrowDownCircle size={16} className="inline mr-1" />
                  Despesa
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Descrição da transação"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-800 text-sm"
                required
              />
              
              <input
                type="text"
                placeholder="Valor (ex: 150,00)"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-800 text-sm"
                required
              />
              
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-800 text-sm"
                required
              >
                {categorias[tipoTransacao].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-800 text-sm"
                required
              />
              
              <textarea
                placeholder="Observações (opcional)"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-gray-800 text-sm h-20 resize-none"
              />
              
              <button
                type="submit"
                className={`w-full py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  tipoTransacao === 'receita'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Registrar {tipoTransacao === 'receita' ? 'Receita' : 'Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetorFinanceiro;