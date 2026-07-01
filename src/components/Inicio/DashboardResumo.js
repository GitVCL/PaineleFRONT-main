import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Crown,
  Check,
  Zap,
  Star,
  Settings,
  Moon,
  Sun,
  Users,
  BarChart3,
  Home,
  LogOut,
  
} from "lucide-react";
import { getUsuario, setUsuario } from "../../utils/usuario";
import { CronometroReverso } from "../ui/CronometroReverso";
import { useLightMode } from "../../contexts/LightModeContext";
// Removido: Resultados Executivos na HOME
import GuiaPaginasSistema from "./GuiaPaginasSistema";
import ResultadosCharts from "../../Dashboard/ResultadosCharts";

export const DashboardResumo = () => {
  const guiaRef = useRef(null);
  const resultadosRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLightMode, isFuncionario } = useLightMode();
  // ✅ Usando helper seguro para carregar usuário
  const [usuario, setUsuarioState] = useState(getUsuario);

  const [faturamento, setFaturamento] = useState(0);
  const [vendasHoje, setVendasHoje] = useState(0);
  const [produtosBaixos, setProdutosBaixos] = useState([]);
  const [notificacoesDetalhadas, setNotificacoesDetalhadas] = useState([]);
  const [planoExpiraEm, setPlanoExpiraEm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detectar se está na página home
  const isHomePage = location.pathname === '/home' || location.pathname === '/dashboard';

  // Função para lidar com logout
  const handleLogout = () => {
    // Limpar dados do usuário
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    // Redirecionar para login
    navigate('/');
  };

  // Removido: Função de ir para home

  useEffect(() => {
    setLoading(true);
    api.get('/api/dashboard')
      .then((res) => {
        setFaturamento(res.data.faturamento ?? 0);
        setVendasHoje((typeof res.data.vendas === 'number' ? res.data.vendas : res.data.vendasHoje) ?? 0);
        setProdutosBaixos(Array.isArray(res.data.notificacoesDetalhadas) ? res.data.notificacoesDetalhadas : (res.data.produtosBaixos || []));
        setNotificacoesDetalhadas(res.data.notificacoesDetalhadas || []);
        setPlanoExpiraEm(res.data.planoExpiraEm);
        
        // ✅ Atualizar dados do usuário usando helper seguro
        const usuarioAtualizado = {
          ...usuario,
          assinatura: res.data.assinatura || "gratuito",
          planoExpiraEm: res.data.planoExpiraEm,
        };
        
        setUsuario(usuarioAtualizado);
        setUsuarioState(usuarioAtualizado);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  // Usar as notificações detalhadas se disponíveis, senão usar o sistema antigo
  const notificacoes = notificacoesDetalhadas.length > 0 
    ? notificacoesDetalhadas.map(notif => notif.mensagem)
    : produtosBaixos.map((produto) =>
        `O produto ${produto.nome} está abaixo de 40% do estoque inicial.`
      );

  // Filtragem de páginas no Home (Modo Light) para FUNCIONÁRIO conforme permissões
  const tipoUsuario = usuario?.tipo || 'PRINCIPAL';
  const permissoesFuncionario = Array.isArray(usuario?.permissoes) ? usuario.permissoes : [];
  const cardMap = {
    despesas: { img: "/despesas.webp", to: "/despesas", alt: "Despesas" },
    produtos: { img: "/produtos.webp", to: "/products", alt: "Produtos" },
    vendas: { img: "/vendas.webp", to: "/selling", alt: "Vendas" },
    relatorios: { img: "/relatorio.webp", to: "/relatorio", alt: "Relatórios" },
  };
  const cardsFuncionarioLight = permissoesFuncionario.map((p) => cardMap[p]).filter(Boolean);

  return (
    <section className={`text-white min-h-screen overflow-y-auto ${isLightMode ? 'py-4 md:py-8 px-2 md:px-4' : 'py-8 md:py-12 px-4 md:px-8'}`}>
      
      {/* Botão Home/Logout no canto superior esquerdo - Visível apenas no Modo Light e Desktop */}
      {isLightMode && (
        <div className="fixed top-4 left-4 z-50 hidden lg:flex">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white hover:text-red-300 transition-all duration-200 shadow-lg"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      )}

      {/* Seção de Notificações - OCULTADA 
      <div className="hidden md:block mt-6 md:mt-10 max-w-7xl mx-auto px-2 md:px-4">
        <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          Notificações
        </h2>
        <ul className="space-y-2 md:space-y-3">
          {notificacoes.length === 0 ? (
            <li className="text-xs md:text-sm text-white/60">
              Nenhuma notificação no momento.
            </li>
          ) : (
            notificacoes.map((msg, i) => (
              <li
                key={i}
                className="bg-white/10 border border-white/20 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm flex items-start gap-2 shadow-lg shadow-gray-900/30"
              >
                <span className="text-yellow-400 mt-[3px]">•</span>
                <span>{msg}</span>
              </li>
            ))
          )}
        </ul>
      </div>
      */}

      {/* Resultados Executivos com Gráficos - Visível no Modo Light e apenas para PRINCIPAL */}
      {isLightMode && tipoUsuario === 'PRINCIPAL' && (
        <div ref={resultadosRef} className="mt-6 md:mt-10 max-w-7xl mx-auto px-2 md:px-4">
          <ResultadosCharts />
        </div>
      )}

      {/* Guia de Páginas do Sistema - Visível apenas no Modo Light */}
      {isLightMode && (
        <div className="mt-6 md:mt-10 max-w-7xl mx-auto px-2 md:px-4">
          <GuiaPaginasSistema 
            guiaRef={guiaRef}
            tipoUsuario={tipoUsuario}
            cardsFuncionarioLight={cardsFuncionarioLight}
            navigate={navigate}
          />
        </div>
      )}

      {/* Botões flutuantes removidos conforme solicitação */}

    </section>
  );
};

export default DashboardResumo;
