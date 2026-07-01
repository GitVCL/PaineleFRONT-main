import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Home,
  BadgeDollarSign,
  ShoppingBag,
  User,
  Users,
  FileText,
  PenTool,
  LogOut,
  Receipt,
  BarChart3,
  CreditCard,
  Box,
  TrendingUp,
  Crown,
  Wallet,
  Settings,
  UserPlus,
} from "lucide-react";
import { getUsuario } from "../../utils/usuario";
import api from "../../services/api";
import { useLightMode } from "../../contexts/LightModeContext";

// Configuração simplificada para Modo Light
const navCategoriesLight = [
  {
    name: "INÍCIO",
    icon: <Home size={20} />,
    isCategory: true,
    items: [
      { name: "Dashboard", to: "/home", icon: <BarChart3 size={18} /> },
    ]
  },
  {
    name: "Sair",
    to: "/",
    icon: <LogOut size={20} />,
    isLogout: true,
    isCategory: false
  },
];

// Configuração completa para usuários PRINCIPAL
const navCategoriesPrincipal = [
  {
    name: "INÍCIO",
    icon: <Home size={20} />,
    isCategory: true,
    items: [
      { name: "Dashboard", to: "/home", icon: <BarChart3 size={18} /> },
    ]
  },
  {
    name: "VENDAS",
    icon: <BadgeDollarSign size={20} />,
    isCategory: true,
    items: [
      { name: "Vender", to: "/selling", icon: <CreditCard size={18} /> },
      { name: "Produtos", to: "/products", icon: <Box size={18} /> },
    ]
  },
  {
    name: "RELATÓRIOS",
    icon: <FileText size={20} />,
    isCategory: true,
    items: [
      { name: "Despesas", to: "/despesas", icon: <Receipt size={18} /> },
      { name: "Relatório", to: "/relatorio", icon: <TrendingUp size={18} /> },
    ]
  },
  {
    name: "FUNCIONÁRIOS",
    icon: <Users size={20} />,
    isCategory: true,
    items: [
      { name: "Funcionários", to: "/funcionarios", icon: <User size={18} /> },
    ]
  },
  {
    name: "Sair",
    to: "/",
    icon: <LogOut size={20} />,
    isLogout: true,
    isCategory: false
  },
];

// Configuração para administradores
const navCategoriesAdmin = [
  {
    name: "INÍCIO",
    icon: <Home size={20} />,
    isCategory: true,
    items: [
      { name: "Dashboard", to: "/home", icon: <BarChart3 size={18} /> },
    ]
  },
  {
    name: "ADMINISTRAÇÃO",
    icon: <Settings size={20} />,
    isCategory: true,
    items: [
      { name: "Registro de Colaboradores", to: "/registro-colaboradores", icon: <UserPlus size={18} /> },
    ]
  },
  {
    name: "Sair",
    to: "/",
    icon: <LogOut size={20} />,
    isLogout: true,
    isCategory: false
  },
];

// Configuração para usuários COLABORADOR
const navCategoriesColaborador = [
  {
    name: "INÍCIO",
    icon: <Home size={20} />,
    isCategory: true,
    items: [
      { name: "Dashboard", to: "/home", icon: <BarChart3 size={18} /> },
    ]
  },
  {
    name: "COLABORADORES",
    icon: <Users size={20} />,
    isCategory: true,
    items: [
      { name: "Clientes", to: "/clientes", icon: <User size={18} /> },
      { name: "Saque", to: "/saque", icon: <Wallet size={18} /> },
    ]
  },
  {
    name: "Sair",
    to: "/",
    icon: <LogOut size={20} />,
    isLogout: true,
    isCategory: false
  },
];

// Mapeamento de permissões para categorias de navegação
const permissionToNavMap = {
  'vendas': {
    name: "VENDAS",
    icon: <BadgeDollarSign size={20} />,
    isCategory: true,
    items: [
      { name: "Vender", to: "/selling", icon: <CreditCard size={18} /> },
    ]
  },
  'produtos': {
    name: "PRODUTOS",
    icon: <ShoppingBag size={20} />,
    isCategory: true,
    items: [
      { name: "Produtos", to: "/products", icon: <Box size={18} /> },
    ]
  },
  'relatorios': {
    name: "RELATÓRIOS",
    icon: <FileText size={20} />,
    isCategory: true,
    items: [
      { name: "Relatório", to: "/relatorio", icon: <TrendingUp size={18} /> },
    ]
  },
  'despesas': {
    name: "DESPESAS",
    icon: <Receipt size={20} />,
    isCategory: true,
    items: [
      { name: "Despesas", to: "/despesas", icon: <Receipt size={18} /> },
    ]
  }
};

// Função para gerar navegação baseada nas permissões do funcionário
const getNavCategoriesForFuncionario = (permissoes) => {
  const categories = [];
  
  // Sempre incluir INÍCIO com Dashboard
  categories.push({
    name: "INÍCIO",
    icon: <Home size={20} />,
    isCategory: true,
    items: [
      { name: "Dashboard", to: "/home", icon: <BarChart3 size={18} /> },
    ]
  });
  
  // Adicionar categorias baseadas nas permissões
  if (permissoes && Array.isArray(permissoes)) {
    permissoes.forEach(permissao => {
      if (permissionToNavMap[permissao]) {
        categories.push(permissionToNavMap[permissao]);
      }
    });
  }
  
  // Sempre adicionar opção de sair
  categories.push({
    name: "Sair",
    to: "/",
    icon: <LogOut size={20} />,
    isLogout: true,
    isCategory: false
  });
  
  return categories;
};

export const Navbar = () => {
  const { isLightMode, isFuncionario } = useLightMode();
  const usuario = getUsuario();
  const tipoUsuario = usuario?.tipo || 'PRINCIPAL';
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  useEffect(() => {
    // Carregar informações do plano apenas se estiver logado
    if (usuario?.id) {
      // checkPlanStatus(); // Removido verificação de plano
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [usuario?.id]);

  // Função para abrir o modal de logout
  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const getNavCategories = () => {
    // Se for modo light, usar configuração simplificada (exceto para logout)
    if (isLightMode) {
      return navCategoriesLight;
    }

    if (usuario?.tipo === 'FUNCIONARIO') {
      return getNavCategoriesForFuncionario(usuario.permissoes);
    }
    
    // Padrão para PRINCIPAL (antigo admin)
    return navCategoriesPrincipal;
  };
  
  const navCategories = getNavCategories();

  const handleLogout = () => {
    localStorage.removeItem("usuario"); // Remover dados do usuário
    localStorage.removeItem("token"); // ou qualquer outro item de sessão
  };

  // Se o modo light estiver ativo, ocultar completamente o navbar
  if (isLightMode) {
    return null;
  }

  // Navbar normal quando modo light está desativado
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-[#3e8b900b] text-white shadow-lg z-50 flex-col justify-between p-8 rounded-tr-2xl rounded-br-2xl">
      {/* Logo */}
      <Link to="/home" className="text-2xl font-bold text-white mb-10 tracking-wide">
        Painelé
      </Link>

      {/* Navigation com categorias */}
      <nav className="flex flex-col gap-2">
        {navCategories.map((category, key) => {
          if (category.isLogout) {
            return (
              <Link
                key={key}
                to={category.to}
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mt-4"
              >
                {category.icon}
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            );
          }

          if (!category.isCategory) {
            return (
              <Link
                key={key}
                to={category.to}
                className="flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm"
              >
                {category.icon}
                <span>{category.name}</span>
              </Link>
            );
          }

          return (
            <div key={key} className="mb-2">
              {/* Categoria principal */}
              <div className="flex items-center gap-3 px-3 py-3 font-semibold text-sm text-gray-300 uppercase tracking-wide">
                {category.icon}
                <span>{category.name}</span>
              </div>

              {/* Subitens sempre visíveis */}
              <div className="ml-6 mt-1 space-y-1">
                {category.items.map((item, itemKey) => (
                  <Link
                    key={itemKey}
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="text-xs text-gray-400 mt-auto pt-6 border-t border-gray-600">
        © {new Date().getFullYear()} Painelé
      </div>
    </aside>
  );
};