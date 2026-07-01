import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import { ShoppingBag, Clock, CheckCircle, Edit3, X, TrendingUp, Package, Trash2 } from "lucide-react";
import ComandaPrint from "./ComandaPrint";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const Sessoes = ({
  setIsModalOpen,
  setModalContext,
  setProductList,
  setComandaId,
}) => {
  const [vendas, setVendas] = useState([]);
  const [comandas, setComandas] = useState([]);

  const fetchVendas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vendas`, {
        withCredentials: true,
      });
      const data = res.data || [];

      console.log("🔍 Debug - Dados recebidos:", data);

      const porTipo = {
        vendas: [],
        comandas: [],
      };

      data.forEach((venda) => {
        const tipo = venda.tipo?.toLowerCase();
        console.log(`🔍 Debug - Venda ${venda.id}: tipo="${venda.tipo}", finalizada=${venda.finalizada}`);
        
        if (venda.finalizada) {
          porTipo.vendas.push(venda);
        } else if (!venda.finalizada) {
          // Mudança: aceitar qualquer venda não finalizada como comanda
          porTipo.comandas.push(venda);
        }
      });

      console.log("🔍 Debug - Comandas encontradas:", porTipo.comandas);

      const ultimas3 = [...porTipo.vendas]
        .filter((v) => v.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

      setVendas(ultimas3);
      setComandas(porTipo.comandas);
    } catch (error) {
      console.error("❌ Erro ao buscar vendas:", error);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1 } }],
  };

  const Card = ({ id, identificador, items = [], total, actionButton, isComanda = false }) => (
    <div className="px-1 sm:px-2">
      <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/30 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl text-xs sm:text-sm w-64 sm:w-72 lg:w-80 min-h-[160px] sm:min-h-[176px] lg:min-h-[208px] flex flex-col mx-auto text-white hover:from-white/20 hover:to-white/10 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl sm:hover:shadow-3xl">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1 sm:gap-2">
              {isComanda ? (
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400" />
              ) : (
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-400" />
              )}
              <p className="font-bold text-white text-xs sm:text-sm lg:text-base">
                #{identificador || id.slice(0, 4).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/70">
              <Package className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{items?.length || 0} itens</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100% - 80px)' }}>
            {Array.isArray(items) &&
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b border-white/20 py-1 sm:py-2 text-xs sm:text-sm hover:bg-white/5 rounded px-1 sm:px-2 transition-colors"
                >
                  <span className="font-medium text-white/90 truncate flex-1 mr-2">{item.nome}</span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className="text-white/70 text-xs">x{item.quantidade}</span>
                    <span className="text-green-300 font-semibold text-xs sm:text-sm">R$ {((item.preco || 0) * (item.quantidade || 0)).toFixed(2)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {typeof total === "number" && (
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/20 flex-shrink-0">
            <span className="text-white/70 font-medium text-xs sm:text-sm">Total:</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-green-300 font-bold text-sm sm:text-base lg:text-lg">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {actionButton && (
          <div className="mt-2 sm:mt-3 flex-shrink-0">
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {actionButton}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const calcularTotal = (items = []) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (acc, item) => acc + (item.preco || 0) * (item.quantidade || 0),
      0
    );
  };

  return (
    <div className="py-6 sm:py-8 lg:py-12 print:hidden px-2 sm:px-4">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
      
      {/* VENDAS FINALIZADAS */}
      <section className="mb-8 sm:mb-12 lg:mb-16">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              VENDAS FINALIZADAS
            </h2>
            <p className="text-white/60 text-xs sm:text-sm">Últimas vendas concluídas</p>
          </div>
        </div>
        
        {vendas.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Nenhuma venda registrada ainda</p>
            <p className="text-white/40 text-sm">As vendas finalizadas aparecerão aqui</p>
          </div>
        ) : (
          <Slider {...sliderSettings} className="w-full max-w-7xl mx-auto">
            {vendas.map((venda) => (
              <Card
                key={venda.id}
                id={venda.id}
                identificador={venda.identificador}
                items={venda.itensVenda}
                total={calcularTotal(venda.itensVenda)}
                isComanda={false}
                actionButton={
                  <ComandaPrint venda={venda} tipo="conta" />
                }
              />
            ))}
          </Slider>
        )}
      </section>

      {/* COMANDAS ABERTAS */}
      <section className="mb-6 sm:mb-8 lg:mb-12">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              COMANDAS ABERTAS
            </h2>
            <p className="text-white/60 text-xs sm:text-sm">Vendas em andamento</p>
          </div>
        </div>
        
        {comandas.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Nenhuma comanda aberta</p>
            <p className="text-white/40 text-sm">Comandas em andamento aparecerão aqui</p>
          </div>
        ) : (
          <Slider {...sliderSettings} className="w-full max-w-7xl mx-auto">
            {comandas.map((cmd) => (
              <Card
                key={cmd.id}
                id={cmd.id}
                identificador={cmd.identificador}
                items={cmd.itensVenda}
                total={calcularTotal(cmd.itensVenda)}
                isComanda={true}
                actionButton={
                  <>
                    <ComandaPrint venda={cmd} tipo="comanda" />
                    <button
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 text-xs font-medium transition-all duration-300 hover:scale-105 shadow-md w-full"
                      onClick={() => {
                        setModalContext("comandas");
                        setProductList(
                          cmd.itensVenda.map((item) => ({
                            produtoId: item.produtoId,
                            nome: item.nome,
                            preco: item.preco,
                            quantidade: item.quantidade,
                          }))
                        );
                        setComandaId(cmd.id);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 text-xs font-medium transition-all duration-300 hover:scale-105 shadow-md w-full"
                      onClick={async () => {
                        const confirmar = window.confirm(
                          "Você tem certeza que deseja excluir esta comanda?"
                        );
                        if (!confirmar) return;
                        try {
                          await axios.delete(
                            `${API_URL}/api/vendas/${cmd.id}`,
                            { withCredentials: true }
                          );

                          setComandas((prev) =>
                            prev.filter((v) => v.id !== cmd.id)
                          );

                          alert("Comanda excluída com sucesso!");
                        } catch (err) {
                          alert("Erro ao excluir a comanda.");
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Excluir</span>
                      <span className="sm:hidden">Del</span>
                    </button>
                    <button
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 text-xs font-medium transition-all duration-300 hover:scale-105 shadow-md w-full"
                      onClick={async () => {
                        const confirmar = window.confirm(
                          "Você tem certeza que deseja finalizar esta comanda?"
                        );
                        if (!confirmar) return;
                        try {
                          await axios.put(
                            `${API_URL}/api/vendas/${cmd.id}/encerrar`,
                            {},
                            { withCredentials: true }
                          );

                          setComandas((prev) =>
                            prev.filter((v) => v.id !== cmd.id)
                          );
                          setVendas((prev) => [cmd, ...prev]);

                          alert("Comanda finalizada com sucesso!");
                        } catch (err) {
                          alert("Erro ao finalizar a comanda.");
                        }
                      }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Finalizar</span>
                      <span className="sm:hidden">Fin</span>
                    </button>
                  </>
                }
              />
            ))}
          </Slider>
        )}
      </section>
    </div>
  );
};

export default Sessoes;
