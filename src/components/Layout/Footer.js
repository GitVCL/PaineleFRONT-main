import { Link } from "react-router-dom";
import {
  Home,
  BadgeDollarSign,
  ShoppingBag,
  User,
  FileText,
  PenTool,
  LogOut,
  Receipt,
  Crown,
  Users,
  Wallet,
} from "lucide-react";
import { getUsuario } from "../../utils/usuario";
import { useLightMode } from "../../contexts/LightModeContext";
import { useModal } from "../../contexts/ModalContext";

// Mapeamento de permissões para links do footer
const permissionToFooterMap = {
  'vendas': { to: "/selling", icon: <BadgeDollarSign size={20} />, label: "Vender" },
  'produtos': { to: "/products", icon: <ShoppingBag size={20} />, label: "Produtos" },
  'relatorios': { to: "/relatorio", icon: <FileText size={20} />, label: "Relatório" },
  'despesas': { to: "/despesas", icon: <Receipt size={20} />, label: "Despesas" }
};

export const Footer = () => {
  const usuario = getUsuario();
  const tipoUsuario = usuario?.tipo || 'PRINCIPAL';
  const { isLightMode } = useLightMode();
  const { isAnyModalOpen } = useModal();
  
  // Se qualquer modal estiver aberto, ocultar o footer
  if (isAnyModalOpen) {
    return null;
  }
  
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  // Footer em DESKTOP:
  // - Modo Light ATIVO: mostrar apenas o botão Dashboard
  // - Modo Light DESATIVADO: não mostrar footer (usamos a navbar lateral)
  if (!isLightMode) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#1e1b4b] shadow-inner border-t z-50 hidden md:block print:hidden">
      <nav className="flex justify-center items-center h-16 gap-4">
        <Link 
          to="/home" 
          className="flex flex-col items-center text-sm text-white hover:text-primary transition"
        >
          <Home size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
      </nav>
    </footer>
  );
  // Se for colaborador, mostrar apenas links específicos para colaboradores
  if (tipoUsuario === 'COLABORADOR') {
    const colaboradorLinks = [
      { to: "/clientes", icon: <Users size={20} />, label: "Clientes" },
      { to: "/saque", icon: <Wallet size={20} />, label: "Saque" },
      { to: "/", icon: <LogOut size={20} />, label: "Sair" }
    ];
    
    return (
      <footer className="fixed bottom-0 left-0 w-full bg-[#1e1b4b] shadow-inner border-t z-50 hidden md:block print:hidden">
        <nav className="flex justify-center items-center h-16 gap-4">
          {colaboradorLinks.map((link, index) => (
            <Link 
              key={index}
              to={link.to} 
              className="flex flex-col items-center text-sm text-white hover:text-primary transition"
              onClick={link.label === "Sair" ? handleLogout : undefined}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </nav>
      </footer>
    );
  }

  // Se for funcionário, mostrar links baseados nas permissões (MODO LIGHT NÃO SE APLICA A FUNCIONÁRIOS)
  if (tipoUsuario === 'FUNCIONARIO') {
    const permissoes = usuario?.permissoes || [];
  
    
    const footerLinks = [];
    
    // Adicionar links baseados nas permissões
    permissoes.forEach(permissao => {
      if (permissionToFooterMap[permissao]) {
        footerLinks.push(permissionToFooterMap[permissao]);
      }
    });
    
    // Sempre adicionar link de sair
    footerLinks.push({ to: "/", icon: <LogOut size={20} />, label: "Sair" });
    
    return (
      <footer className="fixed bottom-0 left-0 w-full bg-[#1e1b4b] shadow-inner border-t z-50 hidden md:block print:hidden">
        <nav className="flex justify-center items-center h-16 gap-4">
          {/* FUNCIONÁRIOS SEMPRE MOSTRAM SUAS PERMISSÕES - MODO LIGHT NÃO SE APLICA */}
          {footerLinks.map((link, index) => (
            <Link 
              key={index}
              to={link.to} 
              className="flex flex-col items-center text-sm text-white hover:text-primary transition"
              onClick={link.label === "Sair" ? handleLogout : undefined}
            >
              {link.icon}
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </nav>
      </footer>
    );
  }

  // Ocultar footer no modo light
  if (isLightMode) {
    return null;
  }

  // Footer completo para usuários PRINCIPAL
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#1e1b4b] shadow-inner border-t z-50 md:hidden print:hidden">
      <nav className="flex justify-around items-center h-16">
        {isLightMode ? (
          // Modo Light - apenas INÍCIO e SAIR
          <>
            <Link to="/home" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <Home size={20} />
              <span className="text-xs mt-1">INÍCIO</span>
            </Link>
            <Link 
              to="/" 
              onClick={handleLogout}
              className="flex flex-col items-center text-sm text-white hover:text-primary transition"
            >
              <LogOut size={20} />
              <span className="text-xs mt-1">SAIR</span>
            </Link>
          </>
        ) : (
          // Modo Normal - todas as opções
          <>
            <Link to="/home" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <Home size={20} />
            </Link>
            <Link to="/assinatura" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <Crown size={20} />
            </Link>
            <Link to="/selling" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <BadgeDollarSign size={20} />
            </Link>
            <Link to="/products" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <ShoppingBag size={20} />
            </Link>
            <Link to="/despesas" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <Receipt size={20} />
            </Link>
            <Link to="/relatorio" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <FileText size={20} />
            </Link>
            <Link to="/funcionarios" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <User size={20} />
            </Link>
            <Link to="/" className="flex flex-col items-center text-sm text-white hover:text-primary transition">
              <LogOut size={20} />
            </Link>
          </>
        )}
      </nav>
    </footer>
  );
};
