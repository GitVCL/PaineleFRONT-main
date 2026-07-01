// SellingButtons.jsx (ATUALIZADO)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ClipboardList, X, Minus, Plus, Trash2, ShoppingCart, Receipt, Sparkles, Package, Camera, ArrowLeft, RefreshCw } from "lucide-react";
import axios from "axios";
import ComandaPrint from "./ComandaPrint";
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from "../../contexts/NotificationContext";
import { getUsuario } from "../../utils/usuario";
import { useModal } from "../../contexts/ModalContext";
import BarcodeScanner from "../BarcodeScanner/BarcodeScanner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";


export const SellingButtons = ({
  isModalOpen,
  setIsModalOpen,
  productList,
  setProductList,
  modalContext,
  setModalContext,
  comandaId,
  setComandaId,
  fetchVendas,
}) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [numeroComanda, setNumeroComanda] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [taxaGarcom, setTaxaGarcom] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { addNotification } = useNotification();
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const user = getUsuario();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/produtos`, { withCredentials: true })
      .then((res) => {
        setProdutos(res.data);
      })
      .catch((err) => {});
  }, []);

  // Função para atualizar comandas
  const handleAtualizarComandas = () => {
    window.location.reload();
    addNotification("Comandas atualizadas com sucesso!", "success");
  };

  // Adicionar listener para atalho de teclado Ctrl+Shift+R
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        handleAtualizarComandas();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Monitorar estado do modal para controlar visibilidade do footer
  useEffect(() => {
    if (isModalOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isModalOpen, openModal, closeModal]);

  const handleAddProduct = () => {
    if (selectedProduct === "add_new_product") {
      handleNavigateToProducts();
      return;
    }
    
    if (selectedProduct) {
            const produto = produtos.find((p) => String(p.id) === String(selectedProduct));

          if (produto) {
            const indexExistente = productList.findIndex(
              (item) => String(item.produtoId) === String(produto.id)
            );

            if (indexExistente !== -1) {
              const updated = [...productList];
              updated[indexExistente].quantidade += 1;
              setProductList(updated);
            } else {
              setProductList((prev) => [
                ...prev,
                {
                  produtoId: produto.id,   // mantém o tipo original (número)
                  nome: produto.nome,
                  preco: produto.valor,
                  quantidade: 1,
                },
              ]);
            }
          }

      setSelectedProduct("");
    }
  };

  const handleBarcodeScanned = async (scannedCode) => {
    try {
      // Primeiro, tentar buscar produto pelo código de barras na API
      const response = await axios.get(`${API_URL}/api/produtos/barcode/${scannedCode}`, {
        withCredentials: true
      });
      
      if (response.data) {
        const produtoEncontrado = response.data;
        
        // Adicionar produto à lista automaticamente
        const indexExistente = productList.findIndex(
          (item) => String(item.produtoId) === String(produtoEncontrado.id)
        );

        if (indexExistente !== -1) {
          const updated = [...productList];
          updated[indexExistente].quantidade += 1;
          setProductList(updated);
          addNotification(`Quantidade de "${produtoEncontrado.nome}" aumentada!`, "success");
        } else {
          setProductList((prev) => [
            ...prev,
            {
              produtoId: produtoEncontrado.id,
              nome: produtoEncontrado.nome,
              preco: produtoEncontrado.valor,
              quantidade: 1,
            },
          ]);
          addNotification(`Produto "${produtoEncontrado.nome}" adicionado à venda!`, "success");
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Se não encontrou na API, buscar localmente nos produtos carregados (fallback)
        const produtoEncontrado = produtos.find(p => 
          p.codigoBarras === scannedCode || 
          p.nome.toLowerCase().includes(scannedCode.toLowerCase())
        );

        if (produtoEncontrado) {
          // Adicionar produto à lista automaticamente
          const indexExistente = productList.findIndex(
            (item) => String(item.produtoId) === String(produtoEncontrado.id)
          );

          if (indexExistente !== -1) {
            const updated = [...productList];
            updated[indexExistente].quantidade += 1;
            setProductList(updated);
            addNotification(`Quantidade de "${produtoEncontrado.nome}" aumentada!`, "success");
          } else {
            setProductList((prev) => [
              ...prev,
              {
                produtoId: produtoEncontrado.id,
                nome: produtoEncontrado.nome,
                preco: produtoEncontrado.valor,
                quantidade: 1,
              },
            ]);
            addNotification(`Produto "${produtoEncontrado.nome}" adicionado à venda!`, "success");
          }
        } else {
          addNotification("Produto não encontrado. Verifique o código de barras.", "warning");
        }
      } else {
        // Erro na API, tentar busca local como fallback
        const produtoEncontrado = produtos.find(p => 
          p.codigoBarras === scannedCode || 
          p.nome.toLowerCase().includes(scannedCode.toLowerCase())
        );

        if (produtoEncontrado) {
          // Adicionar produto à lista automaticamente
          const indexExistente = productList.findIndex(
            (item) => String(item.produtoId) === String(produtoEncontrado.id)
          );

          if (indexExistente !== -1) {
            const updated = [...productList];
            updated[indexExistente].quantidade += 1;
            setProductList(updated);
            addNotification(`Quantidade de "${produtoEncontrado.nome}" aumentada!`, "success");
          } else {
            setProductList((prev) => [
              ...prev,
              {
                produtoId: produtoEncontrado.id,
                nome: produtoEncontrado.nome,
                preco: produtoEncontrado.valor,
                quantidade: 1,
              },
            ]);
            addNotification(`Produto "${produtoEncontrado.nome}" adicionado à venda!`, "success");
          }
        } else {
          addNotification("Erro ao buscar produto. Verifique o código de barras.", "warning");
        }
      }
    }
    
    // NÃO fechar o scanner automaticamente - manter ativo para próximos escaneamentos
    // setShowBarcodeScanner(false); // REMOVIDO
  };

  const handleQuantityChange = (index, delta) => {
    const updated = [...productList];
    updated[index].quantidade += delta;
    if (updated[index].quantidade < 1) updated[index].quantidade = 1;
    setProductList(updated);
  };

  const handlePriceChange = (index, newPrice) => {
    const updated = [...productList];
    updated[index].preco = newPrice;
    setProductList(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = productList.filter((_, i) => i !== index);
    setProductList(updated);
  };

  const handleNavigateToProducts = () => {
    // Verificar se o usuário tem permissão para acessar produtos
    if (user?.tipo === 'PRINCIPAL') {
      navigate('/products');
    } else if (user?.tipo === 'FUNCIONARIO' && user?.permissoes?.includes('produtos')) {
      navigate('/products');
    } else {
      addNotification("Você não tem permissão para acessar a página de produtos.", "error");
    }
  };

  const handleRegisterSale = async () => {
    if (productList.length === 0)
      return addNotification("Adicione pelo menos um produto.", "warning");

    // Prevenir múltiplos cliques
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    const payload = {
      tipo:
        modalContext === "vendas"
          ? "VENDAS"
          : modalContext === "comandas"
          ? "COMANDAS"
          : "FUTUROS",
      itens: productList.map((item) => ({
        produtoId: item.produtoId,
        nome: item.nome,
        preco: item.preco,
        quantidade: item.quantidade,
      })),
      identificador:
        modalContext === "comandas" && !comandaId 
          ? numeroComanda 
          : modalContext === "vendas" 
          ? `VENDA-${Date.now()}` 
          : `FUTURO-${Date.now()}`,
      taxaGarcom: taxaGarcom, // Incluir taxa do garçom no payload
    };



    try {
      // Gerar token único para esta requisição
      const requestToken = uuidv4();
      
      if (modalContext === "comandas" && comandaId) {
        await axios.put(
          `${API_URL}/api/vendas/${comandaId}`,
          payload,
          { 
            withCredentials: true,
            headers: {
              'X-Request-Token': requestToken
            }
          }
        );
        addNotification("Comanda atualizada com sucesso!", "success");
      } else {
        await axios.post(`${API_URL}/api/vendas`, payload, {
          withCredentials: true,
          headers: {
            'X-Request-Token': requestToken
          }
        });
        addNotification("Venda registrada com sucesso!", "success");
      }

      setIsModalOpen(false);
      setProductList([]);
      setComandaId(null);
      setNumeroComanda("");
      setTaxaGarcom(false); // Reset taxa do garçom
      setSearchTerm(""); // Reset pesquisa
      setShowDropdown(false); // Reset dropdown
      fetchVendas();
    } catch (error) {
      
      // Tratar erros específicos de duplicação
      if (error.response?.status === 409) {
        const codigo = error.response.data?.codigo;
        if (codigo === 'TOKEN_DUPLICADO') {
          addNotification("Requisição duplicada detectada. A venda já foi processada.", "error");
        } else if (codigo === 'VENDA_DUPLICADA_TEMPORAL') {
          addNotification("Venda duplicada detectada. Aguarde alguns segundos antes de tentar novamente.", "error");
        } else {
          addNotification("Venda duplicada detectada.", "error");
        }
      } else {
        addNotification("Erro ao salvar venda.", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para filtrar produtos baseado no termo de pesquisa
  const filteredProducts = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para lidar com a seleção de produto do dropdown
  const handleProductSelect = (produto) => {
    setSelectedProduct(String(produto.id));
    setSearchTerm(produto.nome);
    setShowDropdown(false);
  };

  // Função para lidar com mudanças no campo de pesquisa
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
    setSelectedProduct(""); // Limpar seleção quando digitando
  };

  const calcularTotal = () => {
    const subtotal = productList.reduce(
      (acc, item) => acc + item.preco * item.quantidade,
      0
    );
    const taxaServico = taxaGarcom ? subtotal * 0.10 : 0;
    return subtotal + taxaServico;
  };

  return (
    <div className="py-12 print:hidden">
      {/* Header da Seção */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12 px-2">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Central de Vendas
          </h1>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500" />
        </div>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
          Escolha o tipo de venda que deseja realizar e gerencie suas transações de forma rápida e eficiente
        </p>
      </div>

      {/* Botões de Venda Modernizados */}
      <div className="flex justify-center items-center gap-3 sm:gap-6 lg:gap-8 my-4 sm:my-6 lg:my-8 flex-wrap max-w-6xl mx-auto px-2">
        <BotaoVenda
          cor="from-purple-600 via-purple-700 to-violet-800"
          corHover="from-purple-500 via-purple-600 to-violet-700"
          icone={<TrendingUp className="w-8 h-8" />}
          titulo="Vendas No Balcão"
          subtitulo="Vendas diretas e rápidas"
          valor="Instantâneo"
          onClick={() => {
            setModalContext("vendas");
            setIsModalOpen(true);
            setProductList([]);
            setComandaId(null);
            setNumeroComanda("");
            setTaxaGarcom(false); // Reset taxa do garçom
            setSearchTerm(""); // Reset pesquisa
            setShowDropdown(false); // Reset dropdown
          }}
        />
        <BotaoVenda
          cor="from-amber-500 via-yellow-500 to-orange-600"
          corHover="from-amber-400 via-yellow-400 to-orange-500"
          icone={<ClipboardList className="w-8 h-8" />}
          titulo="Vendas em Comanda"
          subtitulo="Controle de mesas e pedidos"
          valor="Organizado"
          onClick={() => {
            setModalContext("comandas");
            setIsModalOpen(true);
            setProductList([]);
            setComandaId(null);
            setNumeroComanda("");
            setTaxaGarcom(false); // Reset taxa do garçom
          }}
        />
        <BotaoVenda
          cor="from-green-500 via-emerald-500 to-teal-600"
          corHover="from-green-400 via-emerald-400 to-teal-500"
          icone={<RefreshCw className="w-8 h-8" />}
          titulo="Atualizar Comandas"
          subtitulo="Recarregar lista de comandas"
          valor="Ctrl+Shift+R"
          onClick={handleAtualizarComandas}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md p-4 sm:p-8 relative border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-300 hover:bg-opacity-90 transition-all max-h-[90vh] overflow-y-auto scrollbar-thin">
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all duration-200"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            
            {/* Header do Modal */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {modalContext === "comandas" && comandaId
                  ? "Editar Comanda"
                  : modalContext === "comandas"
                  ? "Nova Comanda"
                  : "Nova Venda"}
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                {modalContext === "comandas" 
                  ? "Gerencie os itens da comanda"
                  : "Adicione produtos à venda"}
              </p>
              

            </div>

            {modalContext === "comandas" && !comandaId && (
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Número da Comanda
                </label>
                <input
                  type="text"
                  value={numeroComanda}
                  onChange={(e) => setNumeroComanda(e.target.value)}
                  placeholder="Ex: Mesa 01, Comanda 123..."
                  className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-2 sm:p-3 rounded-xl text-gray-800 bg-white transition-all duration-200 outline-none text-sm"
                />
              </div>
            )}



            <div className="mb-3 sm:mb-4 relative">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Pesquisar Produto
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Digite o nome do produto..."
                className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-2 sm:p-3 rounded-xl text-gray-800 bg-white transition-all duration-200 outline-none text-sm"
              />
              
              {/* Dropdown de sugestões */}
              {showDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-blue-600 font-medium"
                    onClick={() => {
                      setSelectedProduct("add_new_product");
                      setShowDropdown(false);
                    }}
                  >
                    ➕ Adicionar Novo Produto
                  </div>
                  {filteredProducts.map((produto) => (
                    <div
                      key={produto.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleProductSelect(produto)}
                    >
                      <div className="font-medium text-gray-800">{produto.nome}</div>
                      <div className="text-sm text-gray-500">R$ {Number(produto.valor).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Mensagem quando não há resultados */}
              {showDropdown && searchTerm && filteredProducts.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center text-gray-500 text-sm">
                  Nenhum produto encontrado para "{searchTerm}"
                </div>
              )}
            </div>

            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
              <button
                onClick={handleAddProduct}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Adicionar
              </button>

              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-sm"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Escanear Código
              </button>
            </div>

            {/* Lista de Produtos */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                Itens Selecionados ({productList.length})
              </h3>
              <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-2 sm:space-y-3 border border-gray-200 rounded-xl p-2 sm:p-3 bg-gray-50">
                {productList.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                    <p className="text-xs sm:text-sm">Nenhum produto adicionado</p>
                  </div>
                ) : (
                  productList.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 p-2 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Linha superior com nome e controles */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800 block text-sm">
                            {item.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => handleQuantityChange(index, -1)}
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded-md text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                            >
                              <Minus size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                            <span className="text-gray-800 font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(index, 1)}
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded-md text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm"
                            >
                              <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-lg text-red-600 hover:text-red-700 transition-all duration-200"
                            title="Remover item"
                          >
                            <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Linha inferior com preço editável */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                          Preço:
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm text-gray-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={Number(item.preco).toFixed(2)}
                            onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                            className="w-20 sm:w-24 text-xs sm:text-sm border border-gray-300 rounded px-2 py-1 text-center text-black bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none"
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">
                          Total: R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="text-center">
                {taxaGarcom && (
                  <div className="mb-2 text-xs sm:text-sm text-green-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {productList.reduce((acc, item) => acc + item.preco * item.quantidade, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Serviço (10%):</span>
                      <span>R$ {(productList.reduce((acc, item) => acc + item.preco * item.quantidade, 0) * 0.10).toFixed(2)}</span>
                    </div>
                    <hr className="my-1 border-green-300" />
                  </div>
                )}
                <p className="text-xs sm:text-sm text-green-700 mb-1">Valor Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-800">
                  R$ {calcularTotal().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2 sm:space-y-3">
              {/* Botões de Impressão e Taxa do Garçom (apenas se houver itens) */}
              {productList.length > 0 && (
                <div className="flex justify-center gap-2 sm:gap-3">
                  <ComandaPrint 
                    venda={{
                      id: comandaId || 'preview',
                      identificador: numeroComanda || 'Prévia',
                      itensVenda: taxaGarcom ? [
                        ...productList,
                        {
                          nome: 'Taxa de Serviço',
                          preco: productList.reduce((acc, item) => acc + item.preco * item.quantidade, 0) * 0.10,
                          quantidade: 1,
                          produtoId: null
                        }
                      ] : productList,
                      createdAt: new Date(),
                      finalizada: modalContext !== 'comandas'
                    }} 
                    tipo={modalContext === 'comandas' ? 'comanda' : 'conta'} 
                  />
                  
                  {/* Botão Taxa do Garçom */}
                  <button
                    onClick={() => setTaxaGarcom(!taxaGarcom)}
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-xs sm:text-sm ${
                      taxaGarcom 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white' 
                        : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700'
                    }`}
                    title={taxaGarcom ? "Remover Taxa do Garçom (10%)" : "Adicionar Taxa do Garçom (10%)"}
                  >
                    <span className="text-base">🍽️</span>
                    <span className="hidden sm:inline">Taxa Garçom</span>
                    <span className="sm:hidden">Taxa</span>
                  </button>
                </div>
              )}
              
              {/* Botão de Finalizar */}
              <button
                onClick={handleRegisterSale}
                disabled={productList.length === 0 || isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando...</span>
                  </>
                ) : (
                  <span>
                    {modalContext === "comandas" && comandaId
                      ? "💾 Salvar Alterações"
                      : modalContext === "comandas"
                      ? "📋 Abrir Comanda"
                      : "✅ Finalizar Venda"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Scanner de Código de Barras */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden">
            {/* Header fixo */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  Scanner de Código
                </h3>
                <button
                  onClick={() => setShowBarcodeScanner(false)}
                  className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all duration-300"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Aponte a câmera para o código de barras do produto
              </p>
            </div>
            
            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <BarcodeScanner
                  onScan={handleBarcodeScanned}
                  onError={(error) => {
                    console.error('Erro no scanner:', error);
                    addNotification('Erro ao acessar a câmera', 'error');
                  }}
                />
                
                {/* Lista de Itens Escaneados */}
                {productList.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ShoppingCart size={16} />
                      Itens Adicionados ({productList.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {productList.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{item.nome}</p>
                            <p className="text-xs text-gray-500">R$ {Number(item.preco).toFixed(2)} cada</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {item.quantidade}x
                            </span>
                            <span className="font-semibold text-gray-800 text-sm">
                              R$ {(Number(item.preco) * item.quantidade).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Total:</span>
                        <span className="font-bold text-green-600 text-lg">
                          R$ {productList.reduce((total, item) => total + (Number(item.preco) * item.quantidade), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer fixo com botão */}
            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowBarcodeScanner(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} />
                Retornar para Venda
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const BotaoVenda = ({ cor, corHover, icone, titulo, subtitulo, valor, onClick }) => (
  <div
    onClick={onClick}
    className={`group cursor-pointer bg-gradient-to-br ${cor} hover:bg-gradient-to-br hover:${corHover} text-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 text-center hover:scale-[1.02] sm:hover:scale-[1.05] transition-all duration-300 transform hover:shadow-2xl sm:hover:shadow-3xl border border-white/20 backdrop-blur-sm min-w-[200px] sm:min-w-[240px] lg:min-w-[280px] max-w-[240px] sm:max-w-[280px] lg:max-w-[320px]`}
  >
    <div className="mb-3 sm:mb-4 lg:mb-6">
      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
        <div className="scale-75 sm:scale-90 lg:scale-100">
          {icone}
        </div>
      </div>
      <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">{titulo}</h3>
      <p className="text-xs sm:text-sm opacity-90 font-medium">{subtitulo}</p>
    </div>
    <div className="bg-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 backdrop-blur-sm">
      <p className="text-sm sm:text-base lg:text-lg font-bold opacity-90">{valor}</p>
    </div>
    <div className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300">
      Clique para iniciar →
    </div>
  </div>
);
