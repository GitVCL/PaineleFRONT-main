import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Plus, X, Trash2, PieChart } from 'lucide-react';
import api from '../../services/api';
import { getUsuario } from '../../utils/usuario';
import { useNotification } from '../../contexts/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const categorias = [
  'Alimentação',
  'Transporte', 
  'Marketing',
  'Equipamentos',
  'Aluguel',
  'Energia',
  'Internet',
  'Materiais',
  'Produtos',
  'Outros'
];

export const DespesasComponent = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [despesas, setDespesas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroData, setFiltroData] = useState('todos');
  
  // Estados do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [data, setData] = useState(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  });

  // Verificar se o usuário está logado
  useEffect(() => {
    const usuario = getUsuario();
    if (!usuario || !usuario.id) {
      addNotification('Você precisa estar logado para acessar esta página.', 'warning');
      navigate('/login');
      return;
    }
    fetchDespesas();
  }, [navigate, addNotification]);

  const fetchDespesas = async () => {
    try {
      const response = await api.get('/api/despesas');
      setDespesas(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        addNotification('Sessão expirada. Faça login novamente.', 'error');
        navigate('/login');
      } else {
        addNotification('Erro ao carregar despesas. Tente novamente.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!descricao || !valor || !categoria) {
      addNotification('Preencha todos os campos', 'warning');
      return;
    }

    try {
      await api.post('/api/despesas', {
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        categoria,
        data
      });
      
      // Limpar formulário
      setDescricao('');
      setValor('');
      setCategoria('Outros');
      const hoje = new Date();
      setData(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`);
      setIsModalOpen(false);
      
      // Recarregar despesas
      fetchDespesas();
      addNotification(`Despesa "${descricao}" inserida com sucesso!`, 'success');
    } catch (error) {
      if (error.response?.status === 401) {
        addNotification('Sessão expirada. Faça login novamente.', 'error');
        navigate('/login');
      } else {
        const mensagem = error.response?.data?.message || 'Erro ao registrar despesa';
        addNotification(mensagem, 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      const despesa = despesas.find(d => d.id === id);
      await api.delete(`/api/despesas/${id}`);
      fetchDespesas();
      addNotification(`Despesa "${despesa?.descricao || 'Item'}" excluída com sucesso!`, 'success');
    } catch (error) {
      if (error.response?.status === 401) {
        addNotification('Sessão expirada. Faça login novamente.', 'error');
        navigate('/login');
      } else {
        addNotification('Erro ao excluir despesa', 'error');
      }
    }
  };

  // Filtrar despesas por período
  const filtrarDespesas = () => {
    const hoje = new Date();
    
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);
    
    return despesas.filter(despesa => {
      // Ajuste para garantir que a data seja interpretada corretamente (sem conversão de fuso horário)
      // A data vem como UTC (ex: 2024-01-28T00:00:00.000Z), mas queremos considerar como 28/01 local
      const [ano, mes, dia] = despesa.data.split('T')[0].split('-').map(Number);
      const dataDespesa = new Date(ano, mes - 1, dia);
      
      switch (filtroData) {
        case 'hoje':
          return dataDespesa.toDateString() === new Date().toDateString();
        case 'semana':
          return dataDespesa >= inicioSemana;
        case 'mes':
          return dataDespesa >= inicioMes;
        default:
          return true;
      }
    });
  };

  const despesasFiltradas = filtrarDespesas();
  
  // Calcular totais
  const totalGeral = despesasFiltradas.reduce((acc, despesa) => acc + despesa.valor, 0);
  
  // Agrupar por categoria
  const gastosPorCategoria = despesasFiltradas.reduce((acc, despesa) => {
    acc[despesa.categoria] = (acc[despesa.categoria] || 0) + despesa.valor;
    return acc;
  }, {});
  
  const categoriasMaisGastos = Object.entries(gastosPorCategoria)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="py-8">
      {/* Container centralizado */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Controle de Despesas</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:scale-105 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Nova Despesa
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
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="text-red-400" size={20} />
              <h3 className="text-sm font-semibold text-white">Total Gasto</h3>
            </div>
            <p className="text-xl font-bold text-white">R$ {totalGeral.toFixed(2)}</p>
          </div>
          
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-yellow-400" size={20} />
              <h3 className="text-sm font-semibold text-white">Despesas</h3>
            </div>
            <p className="text-xl font-bold text-white">{despesasFiltradas.length}</p>
          </div>
          
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="text-blue-400" size={20} />
              <h3 className="text-sm font-semibold text-white">Categorias</h3>
            </div>
            <p className="text-xl font-bold text-white">{Object.keys(gastosPorCategoria).length}</p>
          </div>
        </div>

        {/* Categorias com Mais Gastos */}
        {categoriasMaisGastos.length > 0 && (
          <div className="bg-[#1e1b4b] border border-white/20 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Categorias com Mais Gastos</h3>
            <div className="space-y-2">
              {categoriasMaisGastos.map(([categoria, valor], index) => (
                <div key={categoria} className="flex justify-between items-center">
                  <span className="text-white text-sm">{index + 1}. {categoria}</span>
                  <span className="text-white font-bold text-sm">R$ {valor.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Despesas */}
        <div className="bg-[#1e1b4b] border border-white/20 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Despesas Recentes</h3>
          
          {despesasFiltradas.length === 0 ? (
            <p className="text-white/70 text-center py-6 text-sm">Nenhuma despesa encontrada para o período selecionado.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {despesasFiltradas.map(despesa => (
                <div key={despesa.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <div>
                    <h4 className="text-white font-medium text-sm">{despesa.descricao}</h4>
                    <p className="text-white/70 text-xs">
                      {despesa.categoria} • {new Date(despesa.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">R$ {despesa.valor.toFixed(2)}</span>
                    <button
                      onClick={() => handleDelete(despesa.id)}
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
            
            <h2 className="text-lg font-bold mb-4 text-gray-800">Nova Despesa</h2>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Descrição da despesa"
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
              {categorias.map(cat => (
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
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Registrar Despesa
            </button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
};
export default DespesasComponent;
