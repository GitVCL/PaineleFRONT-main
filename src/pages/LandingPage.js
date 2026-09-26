import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Package, 
  CheckCircle2, 
  ArrowRight,
  Monitor,
  ShieldCheck
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img src="/painele.svg" alt="Painele Logo" className="h-8 w-8" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Painele
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-300 hover:text-white transition-colors">Recursos</a>
              <a href="#sobre" className="text-gray-300 hover:text-white transition-colors">Sobre</a>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/cadastro" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg shadow-purple-600/20"
              >
                Registrar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-950 pt-16 pb-32">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[80px] translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-fuchsia-900/20 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/4"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Software 100% Gratuito e Open Source
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              Gestão completa para o seu negócio, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">sem custos.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              O Painele nasceu como um projeto de estudos e evoluiu para uma ferramenta poderosa. 
              Controle vendas, estoque, despesas e equipe em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/cadastro" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all transform hover:scale-105 shadow-xl shadow-purple-600/20"
              >
                Começar Agora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a 
                href="#recursos" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Ver Recursos
              </a>
            </div>
          </div>
          
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-white/10 bg-slate-900">
               <img src="/imagemdosistema.jpeg" alt="Dashboard Preview" className="w-full opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="sobre" className="py-20 bg-slate-900 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Sobre o Projeto</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            O Painele foi desenvolvido inicialmente como um software de estudos para aprimoramento técnico. 
            Devido à sua robustez e utilidade prática, decidimos disponibilizá-lo gratuitamente para a comunidade. 
            Não há fins comerciais, assinaturas escondidas ou limitações de recursos. É uma ferramenta feita de desenvolvedor para empreendedor.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div id="recursos" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Tudo que você precisa</h2>
            <p className="text-xl text-gray-400">Um conjunto completo de ferramentas para gerenciar sua empresa</p>
          </div>

          <div className="space-y-24">
            {/* Feature 1: Vendas */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/20">
                  <ShoppingBag className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">Ponto de Venda (PDV)</h3>
                <p className="text-lg text-gray-400">
                  Realize vendas de forma rápida e intuitiva. O sistema calcula troco, baixa estoque automaticamente e gera comprovantes. Ideal para balcão e atendimento rápido.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Interface ágil para alto volume
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Compatível com leitor de código de barras
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <img src="/vendas.webp" alt="Tela de Vendas" className="rounded-2xl shadow-xl shadow-black/50 border border-white/10 transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Feature 2: Produtos */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">Gestão de Produtos</h3>
                <p className="text-lg text-gray-400">
                  Cadastre seus produtos com fotos, categorias, preços e controle de estoque. Receba alertas quando itens estiverem acabando.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2" />
                    Controle de estoque em tempo real
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 mr-2" />
                    Alertas de estoque baixo
                  </li>
                </ul>
              </div>
              <div className="flex-1">
                <img src="/produtos.webp" alt="Gestão de Produtos" className="rounded-2xl shadow-xl shadow-black/50 border border-white/10 transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Feature 3: Relatórios */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">Relatórios Detalhados</h3>
                <p className="text-lg text-gray-400">
                  Acompanhe o desempenho do seu negócio com gráficos claros. Saiba quais são os produtos mais vendidos, o faturamento diário, semanal e mensal.
                </p>
              </div>
              <div className="flex-1">
                <img src="/relatorio.webp" alt="Relatórios" className="rounded-2xl shadow-xl shadow-black/50 border border-white/10 transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* Feature 4: Despesas e Financeiro */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/20">
                  <DollarSign className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">Controle de Despesas</h3>
                <p className="text-lg text-gray-400">
                  Não perca o controle das contas. Registre todas as saídas, categorizando despesas para entender para onde seu dinheiro está indo.
                </p>
              </div>
              <div className="flex-1">
                <img src="/despesas.webp" alt="Controle de Despesas" className="rounded-2xl shadow-xl shadow-black/50 border border-white/10 transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

             {/* Feature 5: Funcionários */}
             <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/20">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">Gestão de Equipe</h3>
                <p className="text-lg text-gray-400">
                  Adicione colaboradores, defina permissões de acesso e acompanhe as vendas por vendedor. Segurança e organização para crescer sua equipe.
                </p>
              </div>
              <div className="flex-1">
                <img src="/funcionarios.webp" alt="Gestão de Funcionários" className="rounded-2xl shadow-xl shadow-black/50 border border-white/10 transform hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-purple-900 py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
          <h2 className="text-4xl font-bold mb-6">Pronto para organizar seu negócio?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Junte-se a centenas de usuários que já utilizam o Painele gratuitamente.
          </p>
          <Link 
            to="/cadastro" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-purple-900 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-lg"
          >
            Criar Conta Grátis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/painele.svg" alt="Painele Logo" className="h-8 w-8 opacity-80" />
                <span className="text-xl font-bold text-white">Painele</span>
              </div>
              <p className="max-w-xs text-gray-500">
                Sistema de gestão empresarial simplificado, gratuito e open source. Desenvolvido para ajudar pequenos negócios a crescerem.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/cadastro" className="hover:text-white transition-colors">Cadastro</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Painele. Projeto educacional open source.</p>
            <p className="mt-2 font-medium text-purple-400">Made by vasconcelosdev</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
