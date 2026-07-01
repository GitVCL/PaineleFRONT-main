import React from "react";

const GuiaPaginasSistema = ({ guiaRef, tipoUsuario, cardsFuncionarioLight = [], navigate }) => {
  return (
    <div className="mt-6 md:mt-10 max-w-7xl mx-auto px-2 md:px-4">
      <div ref={guiaRef} />
      {/* Header removido conforme solicitação */}

      {tipoUsuario === 'FUNCIONARIO' ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {cardsFuncionarioLight.length === 0 ? (
            <div className="col-span-2 md:col-span-2 lg:col-span-4 text-center text-sm md:text-base text-white/70">
              Nenhuma página disponível para seu perfil.
            </div>
          ) : (
            cardsFuncionarioLight.map((card, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(card.to)}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <img 
                  src={card.img}
                  alt={card.alt}
                  className="w-full h-auto rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* FUNCIONALIDADES PAGES Section */}
        <div className="space-y-4">
          {/* Header 'FUNCIONALIDADES' removido conforme solicitação */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
              {/* Funcionários */}
              <div 
                onClick={() => navigate('/funcionarios')}
                className="group cursor-pointer transition-all duration-300 hover:scale-105">
                <img 
                  src="/funcionarios.webp" 
                  alt="Funcionários" 
                  className="w-full h-auto rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              {/* Despesas */}
              <div 
                onClick={() => navigate('/despesas')}
                className="group cursor-pointer transition-all duration-300 hover:scale-105">
                <img 
                  src="/despesas.webp" 
                  alt="Despesas" 
                  className="w-full h-auto rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              {/* Produtos */}
              <div 
                onClick={() => navigate('/products')}
                className="group cursor-pointer transition-all duration-300 hover:scale-105">
                <img 
                  src="/produtos.webp" 
                  alt="Produtos" 
                  className="w-full h-auto rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              {/* Vendas */}
              <div 
                onClick={() => navigate('/selling')}
                className="group cursor-pointer transition-all duration-300 hover:scale-105">
                <img 
                  src="/vendas.webp" 
                  alt="Vendas" 
                  className="w-full h-auto rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>

              {/* Relatórios */}
              <div 
                onClick={() => navigate('/relatorio')}
                className="group cursor-pointer transition-all duration-300 hover:scale-105">
                <img 
                  src="/relatorio.webp" 
                  alt="Relatórios" 
                  className="w-full h-auto rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuiaPaginasSistema;