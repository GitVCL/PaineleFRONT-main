import React, { useEffect, useState } from 'react';
import { Home, BadgeDollarSign, ShoppingBag, FileText, Receipt, Crown, Users, Wallet, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUsuario } from '../../utils/usuario';
import { useLightMode } from '../../contexts/LightModeContext';

export const LightModeFooter = () => {
  const navigate = useNavigate();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : true);
  const { isLightMode } = useLightMode();

  useEffect(() => {
    const onResize = () => setIsMobileOrTablet(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isMobileOrTablet) return null;

  const usuario = getUsuario();
  const tipoUsuario = usuario?.tipo || 'PRINCIPAL';
  const permissoes = usuario?.permissoes || [];

  const handleDashboardClick = () => navigate('/home');
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Modo Light ATIVO em mobile/tablet: apenas Dashboard
  // Modo Light DESATIVADO em mobile/tablet: footer com ícones das páginas (principal forma de navegação)
  // Regras por tipo de usuário: colaboradores com seus links, funcionários por permissões, principal completo
  // Como este componente é o footer mobile/tablet, não tratamos desktop aqui.

  // Montar footer quando modo light desativado
  const buildFooterLinks = () => {
    // Map base
    const map = {
      'vendas': { to: "/selling", icon: <BadgeDollarSign size={20} />, label: "Vender" },
      'produtos': { to: "/products", icon: <ShoppingBag size={20} />, label: "Produtos" },
      'relatorios': { to: "/relatorio", icon: <FileText size={20} />, label: "Relatório" },
      'despesas': { to: "/despesas", icon: <Receipt size={20} />, label: "Despesas" },
      'assinatura': { to: "/assinatura", icon: <Crown size={20} />, label: "Assinatura" },
      'funcionarios': { to: "/funcionarios", icon: <User size={20} />, label: "Funcionários" },
    };

    if (tipoUsuario === 'COLABORADOR') {
      return [
        { to: "/clientes", icon: <Users size={20} />, label: "Clientes" },
        { to: "/saque", icon: <Wallet size={20} />, label: "Saque" },
        { to: "/", icon: <LogOut size={20} />, label: "Sair" },
      ];
    }

    if (tipoUsuario === 'FUNCIONARIO') {
      const links = [];
      permissoes.forEach(p => { if (map[p]) links.push(map[p]); });
      // Sair sempre disponível
      links.push({ to: "/", icon: <LogOut size={20} />, label: "Sair" });
      return links;
    }

    // Principal: conjunto completo + sair
    return [map['assinatura'], map['vendas'], map['produtos'], map['despesas'], map['relatorios'], map['funcionarios'], { to: "/", icon: <LogOut size={20} />, label: "Sair" }].filter(Boolean);
  };

  // Detectar modo light pelo body (PageShell aplica classes/padding com isLightMode). Para simplicidade, usar matchMedia como fallback.
  // Usar isLightMode do contexto LightModeContext
  if (isLightMode) {
    // Apenas Dashboard em mobile/tablet quando light mode ativo
    return (
      <div className="md:hidden lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e1b4b]/95 backdrop-blur-sm border-t border-white/10 px-4 py-3">
        <div className="flex justify-center items-center max-w-7xl mx-auto">
          <button onClick={handleDashboardClick} className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors duration-200 p-3 rounded-lg hover:bg-white/10">
            <Home size={20} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  // Modo light desativado: footer com ícones como navegação principal (mobile/tablet)
  const footerLinks = buildFooterLinks();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#1e1b4b] shadow-inner border-t z-50 block md:hidden lg:hidden print:hidden">
      <nav className="flex justify-center items-center h-16 gap-4">
        <button onClick={handleDashboardClick} className="flex flex-col items-center text-sm text-white hover:text-primary transition">
          <Home size={20} />
          <span className="text-xs mt-1">INÍCIO</span>
        </button>
        {footerLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => (link.label === 'Sair' ? handleLogout() : navigate(link.to))}
            className="flex flex-col items-center text-sm text-white hover:text-primary transition"
          >
            {link.icon}
            <span className="text-xs mt-1">{link.label}</span>
          </button>
        ))}
      </nav>
    </footer>
  );
};