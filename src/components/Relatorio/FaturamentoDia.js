import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  DollarSign,
  Package,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

export const FaturamentoDia = () => {
  const [faturamento, setFaturamento] = useState(0);
  const [vendasHoje, setVendasHoje] = useState(0);
  const [produtosBaixos, setProdutosBaixos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faturamento');
  const [isPrivacyMode, setIsPrivacyMode] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/dashboard')
      .then((res) => {
        setFaturamento(res.data.faturamento ?? 0);
        setVendasHoje((typeof res.data.vendas === 'number' ? res.data.vendas : res.data.vendasHoje) ?? 0);
        setProdutosBaixos(Array.isArray(res.data.notificacoesDetalhadas) ? res.data.notificacoesDetalhadas : (res.data.produtosBaixos || []));
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

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

  // Configuração das abas estilo Mercado Pago com paleta Painele
  const tabs = [
    {
      id: 'faturamento',
      label: 'Faturamento do Dia',
      subtitle: 'Total arrecadado hoje',
      icon: DollarSign,
      value: loading ? "Carregando..." : maskValue(`R$ ${faturamento.toFixed(2)}`, 'currency'),
      iconColor: 'text-green-500'
    },
    {
      id: 'vendas',
      label: 'Vendas Finalizadas',
      subtitle: 'Transações concluídas hoje',
      icon: Package,
      value: loading ? "..." : maskValue(`${vendasHoje}`, 'number'),
      iconColor: 'text-blue-500'
    },
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

  return (
    <section className="text-white py-4 md:py-6">
      {/* Card único estilo Mercado Pago com paleta Painele */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-900 rounded-2xl shadow-2xl shadow-purple-900/50 border border-purple-500/20 overflow-hidden shadow-2xl shadow-purple-900/60">
          
          {/* Navegação das abas - estilo Mercado Pago */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 sm:px-4 py-4 sm:py-5 text-center transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white font-medium shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Conteúdo do card - layout clean com espaçamento amplo */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col">
              {/* Header com título e botão de privacidade */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold text-sm sm:text-lg">
                  {currentTab?.label}
                </h3>
                
                {/* Botão de privacidade - estilo Mercado Pago */}
                <button
                  onClick={togglePrivacyMode}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group"
                  title={isPrivacyMode ? "Mostrar valores" : "Ocultar valores"}
                >
                  {isPrivacyMode ? (
                    <EyeOff className="w-4 h-4 text-white/70 group-hover:text-white" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/70 group-hover:text-white" />
                  )}
                </button>
              </div>
              
              {/* Descrição */}
              <p className="text-gray-300 leading-relaxed font-semibold text-xs sm:text-base mb-2 sm:mb-4">
                {currentTab?.subtitle}
              </p>
              
              {/* Valor principal - proporcional ao mobile */}
              <div className="font-black text-white text-xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4">
                {currentTab?.value}
              </div>

              {/* Conteúdo específico para produtos em baixa */}
              {activeTab === 'produtos' && produtosBaixos.length > 0 && (
                <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
                  {produtosBaixos.slice(0, 3).map((produto, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-white/10 last:border-b-0 text-xs sm:text-base py-1 sm:py-2">
                      <span className="text-gray-300 truncate pr-3 font-medium">{produto.nome}</span>
                      <span className="text-orange-400 font-bold flex-shrink-0 text-xs sm:text-sm">
                        {produto.quantidade} restantes
                      </span>
                    </div>
                  ))}
                  {produtosBaixos.length > 3 && (
                    <p className="text-gray-400 border-t border-white/10 font-medium text-xs sm:text-sm mt-2 sm:mt-3 pt-1 sm:pt-2">
                      +{produtosBaixos.length - 3} outros produtos
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaturamentoDia;