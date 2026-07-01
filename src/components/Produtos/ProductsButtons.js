// src/components/ProductsButtons.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { X, Trash2, Package, Plus, AlertTriangle, Edit3, TrendingUp, BarChart3, Sparkles, ShoppingBag, Camera } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { useModal } from "../../contexts/ModalContext";
import BarcodeScanner from "../BarcodeScanner/BarcodeScanner";

const categories = ["Todos", "Bebidas", "Comidas", "Variados", "Roupas", "Eletrônicos", "Suplementos"];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API_URL = `${API_BASE_URL}/api/produtos`;

export const ProductsButtons = () => {
  const { addNotification } = useNotification();
  const { openModal, closeModal } = useModal();
  const [produtos, setProdutos] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [produtoId, setProdutoId] = useState(null);

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState(""); // Nova quantidade a ser adicionada
  const [estoque, setEstoque] = useState("");
  const [categoria, setCategoria] = useState("Bebidas");
  const [valorDaCompra, setValorDaCompra] = useState("");
  const [lucroTotal, setLucroTotal] = useState("");
  const [lucroCalculado, setLucroCalculado] = useState("");
  const [porcentagemLucro, setPorcentagemLucro] = useState(0);
  const [codigoBarras, setCodigoBarras] = useState("");
  const [codigosBarras, setCodigosBarras] = useState([]); // Array para múltiplos códigos
  const [novoCodigoBarras, setNovoCodigoBarras] = useState(""); // Campo temporário para adicionar novo código
  const [novaDataVencimento, setNovaDataVencimento] = useState(""); // Campo para data de vencimento do novo código
  const [produtosDuplicados, setProdutosDuplicados] = useState([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannerFromForm, setScannerFromForm] = useState(false);

  // Funções para gerenciar múltiplos códigos de barras
  const adicionarCodigoBarras = () => {
    if (!novoCodigoBarras.trim()) {
      addNotification("Digite um código de barras válido", "error");
      return;
    }
    
    // Verificar se o código já existe na lista
    if (codigosBarras.some(cb => cb.codigo === novoCodigoBarras.trim())) {
      addNotification("Este código de barras já foi adicionado", "error");
      return;
    }
    
    const novoCodigoObj = {
      codigo: novoCodigoBarras.trim(),
      dataVencimento: novaDataVencimento || null
    };
    
    setCodigosBarras([...codigosBarras, novoCodigoObj]);
    setNovoCodigoBarras("");
    setNovaDataVencimento("");
    addNotification("Código de barras adicionado com sucesso!", "success");
  };

  const removerCodigoBarras = (codigo) => {
    setCodigosBarras(codigosBarras.filter(cb => cb.codigo !== codigo));
    addNotification("Código de barras removido", "info");
  };

  const handleBarcodeScannedForMultiple = (scannedCode) => {
    setNovoCodigoBarras(scannedCode);
    setShowBarcodeScanner(false);
    setScannerFromForm(false);
    setShowForm(true);
    addNotification("Código de barras escaneado! Clique em 'Adicionar' para incluí-lo na lista.", "success");
  };

  const fetchProdutos = async () => {
    try {
      const res = await axios.get(API_URL, {
        withCredentials: true
      });
      setProdutos(res.data);
      detectarDuplicados(res.data);
    } catch (err) {
      addNotification("Erro ao carregar produtos. Faça login novamente.", "error");
    }
  };

  const detectarDuplicados = (produtos) => {
    // Agrupar produtos por nome (case insensitive)
    const gruposProdutos = {};
    produtos.forEach(produto => {
      const nomeKey = produto.nome.toLowerCase().trim();
      if (!gruposProdutos[nomeKey]) {
        gruposProdutos[nomeKey] = [];
      }
      gruposProdutos[nomeKey].push(produto);
    });

    // Filtrar apenas produtos que podem ser fundidos (quantidade 0 + produto com maior estoque)
    const duplicadosValidos = [];
    Object.values(gruposProdutos).forEach(grupo => {
      if (grupo.length > 1) {
        const produtosSemEstoque = grupo.filter(p => p.quantidade === 0);
        const produtosComEstoque = grupo.filter(p => p.quantidade > 0);
        
        // Só mostrar se há produtos com quantidade 0 E produtos com estoque
        if (produtosSemEstoque.length > 0 && produtosComEstoque.length > 0) {
          // Adicionar apenas os produtos com quantidade 0 e o produto com maior estoque
          const produtoComMaiorEstoque = produtosComEstoque.reduce((prev, current) => 
            (prev.quantidade > current.quantidade) ? prev : current
          );
          
          duplicadosValidos.push(...produtosSemEstoque, produtoComMaiorEstoque);
        }
      }
    });

    setProdutosDuplicados(duplicadosValidos);
  };

  const fundirDuplicadosAutomatico = async () => {
    try {
      const response = await axios.post(`${API_URL}/fundir-automatico`, {}, {
        withCredentials: true
      });
      
      addNotification(response.data.message, "success");
      fetchProdutos(); // Atualizar lista de produtos
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Erro na fusão automática de produtos";
      addNotification(errorMessage, "error");
    }
  };

  const fundirDuplicado = async (produtoOriginalId, produtoDuplicadoId) => {
    try {
      await axios.post(`${API_URL}/fundir`, {
        produtoOriginalId,
        produtoDuplicadoId,
      }, {
        withCredentials: true
      });
      addNotification("Produtos duplicados unidos com sucesso!", "success");
      fetchProdutos();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Erro ao unir produtos duplicados";
      addNotification(errorMessage, "error");
    }
  };


  const abrirModal = (produto = null) => {
    setShowForm(true);
    if (produto) {
      setEditing(true);
      setProdutoId(produto.id);
      setNome(produto.nome);
      setValor(produto.valor);
      setQuantidade(produto.quantidade);
      setEstoque(produto.estoque);
      setCategoria(produto.categoria);
      setValorDaCompra(produto.valorDaCompra || "");
      setCodigoBarras(produto.codigoBarras || "");
      
      // Carregar múltiplos códigos de barras se existirem
      if (produto.codigosBarras && Array.isArray(produto.codigosBarras)) {
        setCodigosBarras(produto.codigosBarras.map(cb => ({
          codigo: cb.codigo,
          dataVencimento: cb.dataVencimento
        })));
      } else {
        setCodigosBarras([]);
      }
      
      // Calculate lucroCalculado for editing
      if (produto.valorDaCompra && produto.valor) {
        const compra = parseFloat(String(produto.valorDaCompra).replace(',', '.')) || 0;
        const venda = parseFloat(String(produto.valor).replace(',', '.')) || 0;
        if (compra > 0 && venda > 0) {
          const lucro = venda - compra;
          setLucroCalculado(`R$ ${lucro.toFixed(2).replace('.', ',')}`);
        } else {
          setLucroCalculado("");
        }
      } else {
        setLucroCalculado("");
      }
      setPorcentagemLucro(produto.lucroTotal || 0);
    } else {
      setEditing(false);
      setProdutoId(null);
      setNome("");
      setValor("");
      setQuantidade("");
      setQuantidadeAdicionar(""); // Limpar campo de adicionar quantidade
      setEstoque("");
      setCategoria("Bebidas");
      setValorDaCompra("");
      setLucroTotal("");
      setLucroCalculado("");
      setPorcentagemLucro(0);
      setCodigoBarras("");
      setCodigosBarras([]); // Limpar array de códigos
      setNovoCodigoBarras(""); // Limpar campo temporário
      setNovaDataVencimento(""); // Limpar campo de data de vencimento
    }
  };

  const handleBarcodeScannedFromForm = async (scannedCode) => {
    // Quando escaneado do formulário, preenche o campo apropriado
    if (scannerFromForm === 'multiple') {
      setNovoCodigoBarras(scannedCode);
      addNotification("Código de barras escaneado! Clique em 'Adicionar' para incluí-lo na lista.", "success");
    } else {
      setCodigoBarras(scannedCode);
      addNotification("Código de barras escaneado com sucesso!", "success");
    }
    setShowBarcodeScanner(false);
    setScannerFromForm(false);
    setShowForm(true); // Reabre o modal do formulário
  };

  const handleBarcodeScanned = async (scannedCode) => {
    try {
      // Primeiro, tentar buscar produto pelo código de barras na API
      const response = await axios.get(`${API_URL}/barcode/${scannedCode}`, {
        withCredentials: true
      });
      
      if (response.data) {
        // Se encontrou o produto na API, abrir modal de edição
        abrirModal(response.data);
        addNotification(`Produto "${response.data.nome}" encontrado!`, "success");
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Se não encontrou na API, buscar localmente nos produtos carregados
        const produtoEncontrado = produtos.find(p => 
          p.codigoBarras === scannedCode || 
          p.nome.toLowerCase().includes(scannedCode.toLowerCase())
        );

        if (produtoEncontrado) {
          // Se encontrou localmente, abrir modal de edição
          abrirModal(produtoEncontrado);
          addNotification(`Produto "${produtoEncontrado.nome}" encontrado!`, "success");
        } else {
          // Se não encontrou, abrir modal de criação com código preenchido
          abrirModal();
          setCodigoBarras(scannedCode);
          addNotification("Produto não encontrado. Criando novo produto com código escaneado.", "info");
        }
      } else {
        // Erro na API, tentar busca local
        const produtoEncontrado = produtos.find(p => 
          p.codigoBarras === scannedCode || 
          p.nome.toLowerCase().includes(scannedCode.toLowerCase())
        );

        if (produtoEncontrado) {
          abrirModal(produtoEncontrado);
          addNotification(`Produto "${produtoEncontrado.nome}" encontrado!`, "success");
        } else {
          abrirModal();
          setCodigoBarras(scannedCode);
          addNotification("Erro ao buscar produto. Criando novo produto com código escaneado.", "warning");
        }
      }
    }
    
    setShowBarcodeScanner(false);
    setScannerFromForm(false);
  };

  const handleSalvar = async () => {
    if (!nome || !valor || !quantidade || !estoque || !categoria) {
      return addNotification("Preencha todos os campos obrigatórios!", "error");
    }

    // Registrar evento local para o Console de Movimentações
    const registrarEventoMovimentacao = (tipo, descricao, extra = {}) => {
      try {
        const usuarioStr = localStorage.getItem('usuario');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        const funcionarioNome = usuario?.nome || 'Administrador';
        const evento = {
          id: `${tipo}-${Date.now()}`,
          tipo,
          descricao,
          funcionario: funcionarioNome,
          timestamp: new Date().toISOString(),
          ...extra,
        };
        const key = 'mov_eventos';
        const filaStr = localStorage.getItem(key);
        const fila = filaStr ? JSON.parse(filaStr) : [];
        const novaFila = [...fila, evento].slice(-100);
        localStorage.setItem(key, JSON.stringify(novaFila));
      } catch (e) {
        console.warn('Não foi possível registrar evento de movimentação local:', e);
      }
    };

    try {
      // Calcular nova quantidade se estiver editando e houver quantidade a adicionar
      let novaQuantidade = parseInt(quantidade);
      if (editing && quantidadeAdicionar) {
        const adicionar = parseInt(quantidadeAdicionar);
        if (adicionar > 0) {
          novaQuantidade = parseInt(quantidade) + adicionar;
        }
      }

      const dados = {
        nome,
        valor: parseFloat(String(valor).replace(",", ".")),
        quantidade: novaQuantidade,
        estoque: parseInt(estoque),
        categoria,
        valorDaCompra: valorDaCompra ? parseFloat(String(valorDaCompra).replace(",", ".")) : 0,
        codigoBarras: codigoBarras || null,
        codigosBarras: codigosBarras.length > 0 ? codigosBarras.map(cb => ({
          codigo: cb.codigo,
          dataVencimento: cb.dataVencimento
        })) : [] // Enviar array de códigos
      };

      if (editing) {
        const resp = await axios.put(`${API_URL}/${produtoId}`, dados, {
          withCredentials: true,
        });
        
        // Registrar despesa automaticamente se quantidade foi adicionada
        if (quantidadeAdicionar && parseInt(quantidadeAdicionar) > 0 && valorDaCompra) {
          const quantidadeAdicionada = parseInt(quantidadeAdicionar);
          const valorCompra = parseFloat(String(valorDaCompra).replace(",", "."));
          const valorTotalDespesa = quantidadeAdicionada * valorCompra;
          
          try {
            await axios.post(`${API_BASE_URL}/api/despesas`, {
              descricao: `Reposição de estoque - ${nome}`,
              valor: valorTotalDespesa,
              categoria: "Produtos",
              data: new Date().toISOString().split('T')[0]
            }, {
              withCredentials: true,
            });
            addNotification(`Despesa de R$ ${valorTotalDespesa.toFixed(2).replace('.', ',')} registrada automaticamente!`, "info");
          } catch (despesaErr) {
            console.error('Erro ao registrar despesa automática:', despesaErr);
            addNotification('Produto atualizado, mas erro ao registrar despesa automática', "warning");
          }
        }
        // Registrar evento de produto atualizado
        registrarEventoMovimentacao('produto', `Produto atualizado: ${nome}`, { produtoId, nomeProduto: nome });

        addNotification(`Produto "${nome}" atualizado com sucesso!`, "success");
      } else {
        const resp = await axios.post(API_URL, dados, {
          withCredentials: true,
        });
        const novoProduto = resp?.data?.produto;
        const nomeFinal = novoProduto?.nome || nome;
        const idFinal = novoProduto?.id || undefined;

        // Registrar evento de produto cadastrado
        registrarEventoMovimentacao('produto', `Produto cadastrado: ${nomeFinal}`, idFinal ? { produtoId: idFinal, nomeProduto: nomeFinal } : { nomeProduto: nomeFinal });

        addNotification(`Produto "${nomeFinal}" registrado com sucesso!`, "success");
      }

      setShowForm(false);
      setQuantidadeAdicionar(""); // Limpar campo após salvar
      fetchProdutos();
    } catch (err) {
      addNotification(
        err.response?.data?.error || "Erro ao salvar produto",
        "error"
      );
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir?")) return;
    try {
      const produto = produtos.find(p => p.id === id);
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });
      addNotification(`Produto "${produto?.nome || 'Item'}" excluído com sucesso!`, "success");
      fetchProdutos();
    } catch (err) {
      console.log('Erro completo:', err); // Debug completo
      console.log('Status:', err.response?.status); // Debug status
      console.log('Data completa:', err.response?.data); // Debug data
      console.log('Mensagem de erro:', err.response?.data?.error); // Debug mensagem
      
      // Verificar se é erro 500 (erro interno do servidor)
      if (err.response?.status === 500) {
        console.log('Erro 500 - Erro interno do servidor');
        // Pode ser que o produto tenha vendas e o backend não está tratando corretamente
        window.alert("Esse produto já realizou venda, não será possível excluir, contacte o suporte");
        return;
      }
      
      // Verificar múltiplas condições para garantir que capturamos o erro
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        console.log('Erro 400 detectado, dados:', errorData); // Debug
        
        if (errorData?.hasVendas === true || errorData?.error?.includes('já realizou venda')) {
          // Usar window.alert para garantir que o popup apareça
          window.alert("Esse produto já realizou venda, não será possível excluir, contacte o suporte");
          return; // Não mostrar notificação adicional
        }
      }
      
      // Erro genérico
      console.log('Mostrando erro genérico'); // Debug
      addNotification("Erro ao excluir produto", "error");
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Calcular lucro automaticamente
  useEffect(() => {
    if (valorDaCompra && valor) {
      const compra = parseFloat(String(valorDaCompra).replace(',', '.')) || 0;
      const venda = parseFloat(String(valor).replace(',', '.')) || 0;
      
      if (compra > 0 && venda > 0) {
        const lucro = venda - compra;
        const percentual = ((lucro / compra) * 100);
        
        setLucroTotal(lucro.toFixed(2));
        setLucroCalculado(`R$ ${lucro.toFixed(2).replace('.', ',')}`);
        setPorcentagemLucro(percentual.toFixed(1));
      } else {
        setLucroTotal("");
        setLucroCalculado("");
        setPorcentagemLucro(0);
      }
    } else {
      setLucroTotal("");
      setLucroCalculado("");
      setPorcentagemLucro(0);
    }
  }, [valorDaCompra, valor]);

  // Monitorar estado do modal para controlar visibilidade do footer
  useEffect(() => {
    if (showForm) {
      openModal();
    } else {
      closeModal();
    }
  }, [showForm, openModal, closeModal]);

  const filteredProdutos = produtos.filter(
    (p) => activeCategory === "Todos" || p.categoria === activeCategory
  );

  return (
    <section className="py-6 sm:py-8 lg:py-12 text-white">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header da Seção */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Gestão de Produtos
            </h1>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500" />
          </div>
          <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8 px-4">
            Organize seu estoque, controle quantidades e gerencie seu catálogo de produtos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              onClick={() => abrirModal()}
              className="group bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg shadow-xl sm:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
              <span className="hidden sm:inline">Adicionar Novo Produto</span>
              <span className="sm:hidden">Novo Produto</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors"></div>
            </button>



            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="group bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg shadow-xl sm:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 flex items-center gap-2 sm:gap-3"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
              <span className="hidden sm:inline">Escanear Código</span>
              <span className="sm:hidden">Scanner</span>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors"></div>
            </button>
          </div>
        </div>

        {/* Alerta de Duplicados Modernizado */}
        {produtosDuplicados.length > 0 && (
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/40 backdrop-blur-xl rounded-2xl p-6 mb-12 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-200">Produtos Duplicados Detectados</h3>
                <p className="text-orange-300/80 text-sm">Encontramos produtos com nomes similares que podem ser unificados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {produtosDuplicados.map((p, i) => (
                <div
                  key={p.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-medium">{p.nome}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4 text-white/60" />
                      <span className="text-white/60 text-sm">{p.quantidade} unidades</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center">
                    <span className="text-orange-200 font-bold text-sm">{i + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button  
                onClick={() => {
                  // Encontrar o produto com quantidade 0 e o com maior estoque
                  const produtoSemEstoque = produtosDuplicados.find(p => p.quantidade === 0);
                  const produtosComEstoque = produtosDuplicados.filter(p => p.quantidade > 0);
                  const produtoComMaiorEstoque = produtosComEstoque.reduce((prev, current) => 
                    (prev.quantidade > current.quantidade) ? prev : current
                  );
                  
                  if (produtoSemEstoque && produtoComMaiorEstoque) {
                    fundirDuplicado(produtoComMaiorEstoque.id, produtoSemEstoque.id);
                  }
                }}
                className="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Unificar Produtos
              </button>
            </div>
          </div>
        )}

      {/* Modal do Scanner de Código de Barras */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  Scanner de Código
                </h3>
                <button
                    onClick={() => {
                      setShowBarcodeScanner(false);
                      setScannerFromForm(false);
                      if (scannerFromForm) {
                        setShowForm(true); // Reabre o formulário se foi cancelado do formulário
                      }
                    }}
                    className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all duration-300"
                  >
                  <X size={16} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Aponte a câmera para o código de barras do produto
              </p>
            </div>
            <div className="p-6">
              <BarcodeScanner
                onScan={scannerFromForm ? handleBarcodeScannedFromForm : handleBarcodeScanned}
                onError={(error) => {
                  console.error('Erro no scanner:', error);
                  addNotification('Erro ao acessar a câmera', 'error');
                }}
              />
            </div>
          </div>
        </div>
      )}



        {/* Filtros de Categoria Modernizados */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-12">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`group px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 shadow-md sm:shadow-lg ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/25"
                    : "bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  {cat === "Todos" && <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />}
                  {cat === "Bebidas" && <span className="text-sm sm:text-base lg:text-lg">🥤</span>}
                  {cat === "Comidas" && <span className="text-sm sm:text-base lg:text-lg">🍕</span>}
                  {cat === "Variados" && <span className="text-sm sm:text-base lg:text-lg">📦</span>}
                  {cat === "Roupas" && <span className="text-sm sm:text-base lg:text-lg">👕</span>}
                  {cat === "Eletrônicos" && <span className="text-sm sm:text-base lg:text-lg">📱</span>}
                  {cat === "Suplementos" && <span className="text-sm sm:text-base lg:text-lg">💊</span>}
                  <span className="truncate">{cat}</span>
                  {isActive && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/80 rounded-full flex-shrink-0"></div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Grid de Produtos Modernizado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProdutos.map((p) => {
            const perc = p.estoque
              ? Math.min((p.quantidade / p.estoque) * 100, 100)
              : 0;
            
            const getStatusColor = () => {
              if (perc >= 70) return "from-emerald-500 to-green-500";
              if (perc >= 40) return "from-yellow-500 to-orange-500";
              return "from-red-500 to-red-600";
            };

            const getStatusIcon = () => {
              if (perc >= 70) return "✅";
              if (perc >= 40) return "⚠️";
              return "🔴";
            };

            return (
              <div
                key={p.id}
                className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/30 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl hover:from-white/20 hover:to-white/10 transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-2xl sm:hover:shadow-3xl cursor-pointer"
                onClick={() => abrirModal(p)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white group-hover:text-blue-200 transition-colors truncate">{p.nome}</h3>
                      <span className="text-xs text-white/60 bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{p.categoria}</span>
                    </div>
                  </div>
                  <span className="text-base sm:text-lg flex-shrink-0">{getStatusIcon()}</span>
                </div>

                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">Estoque</span>
                    <span className="text-white font-bold text-xs sm:text-sm">{p.quantidade}/{p.estoque}</span>
                  </div>
                  <div className="bg-white/20 h-2 sm:h-3 w-full rounded-full overflow-hidden">
                    <div
                      className={`bg-gradient-to-r ${getStatusColor()} h-full rounded-full transition-all duration-500 shadow-lg`}
                      style={{ width: `${perc}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                    <span className="text-white/60 text-xs">{perc.toFixed(0)}% disponível</span>
                    <span className="text-green-300 font-bold text-sm sm:text-base lg:text-lg">R$ {p.valor.toFixed(2)}</span>
                  </div>
                </div>

                {/* Seção de Lucro */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-white/70 text-xs sm:text-sm font-medium">Lucro</span>
                    <span className="text-yellow-300 font-bold text-xs sm:text-sm">{p.lucroTotal ? p.lucroTotal.toFixed(1) : '0.0'}%</span>
                  </div>
                  <div className="bg-white/20 h-2 sm:h-3 w-full rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min((p.lucroTotal || 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                    <span className="text-white/60 text-xs">margem de lucro</span>
                    {p.valorDaCompra && p.valor && (
                      <span className="text-yellow-300 font-bold text-xs">
                        R$ {(p.valor - p.valorDaCompra).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/20 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      abrirModal(p);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg sm:rounded-xl hover:from-blue-500 hover:to-cyan-500 text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 shadow-md sm:shadow-lg flex-1"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Editar</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExcluir(p.id);
                    }}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 shadow-md sm:shadow-lg flex-1"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Excluir</span>
                    <span className="sm:hidden">Del</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Otimizado para Mobile */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[95vh] overflow-y-auto p-4 sm:p-6 relative text-gray-800 border border-white/20">
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all duration-300 hover:scale-110"
              onClick={() => setShowForm(false)}
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
            
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                {editing ? <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> : <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                {editing ? "Editar Produto" : "Novo Produto"}
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 px-2">
                {editing ? "Atualize as informações do produto" : "Valores por unidade"}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Coca-Cola 350ml"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Código de Barras (Opcional)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: 7891234567890"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-purple-500 p-2 sm:p-3 pr-12 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false); // Fecha o modal do formulário
                      setScannerFromForm(true);
                      setShowBarcodeScanner(true);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    title="Escanear código de barras"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Seção de Múltiplos Códigos de Barras */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Múltiplos Códigos de Barras</label>
                
                {/* Campo para adicionar novo código */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Adicionar código de barras"
                      value={novoCodigoBarras}
                      onChange={(e) => setNovoCodigoBarras(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 sm:p-3 pr-12 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          adicionarCodigoBarras();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setScannerFromForm('multiple');
                        setShowBarcodeScanner(true);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Escanear código de barras"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <input
                      type="date"
                      placeholder="Data de vencimento (opcional)"
                      value={novaDataVencimento}
                      onChange={(e) => setNovaDataVencimento(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                      title="Data de vencimento (opcional)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={adicionarCodigoBarras}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-medium text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Lista de códigos adicionados */}
                {codigosBarras.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Códigos adicionados:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {codigosBarras.map((codigoObj, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                          <div className="flex-1">
                            <span className="text-sm font-mono text-gray-700 block">{codigoObj.codigo}</span>
                            {codigoObj.dataVencimento && (
                              <span className="text-xs text-gray-500">
                                Vence: {new Date(codigoObj.dataVencimento).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removerCodigoBarras(codigoObj.codigo)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Remover código"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Valor Venda (R$)</label>
                  <input
                    type="text"
                    placeholder="15,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-green-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-purple-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                  >
                    <option value="Bebidas">🥤 Bebidas</option>
                    <option value="Comidas">🍕 Comidas</option>
                    <option value="Variados">📦 Variados</option>
                    <option value="Roupas">👕 Roupas</option>
                    <option value="Eletrônicos">📱 Eletrônicos</option>
                    <option value="Suplementos">💊 Suplementos</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Valor da Compra (R$)</label>
                <input
                  type="text"
                  placeholder="10,00"
                  value={valorDaCompra}
                  onChange={(e) => setValorDaCompra(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Lucro Calculado (R$) – {porcentagemLucro}% de lucro
                </label>
                <input
                  type="text"
                  value={lucroCalculado}
                  readOnly
                  className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-100 cursor-not-allowed text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Qtd. Atual</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    readOnly={editing}
                    className={`w-full border-2 border-gray-200 ${editing ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-yellow-500 bg-white/80'} p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors backdrop-blur-sm text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Estoque Ideal</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-orange-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-white/80 backdrop-blur-sm text-sm"
                  />
                </div>
              </div>
              
              {editing && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">➕ Adicionar Quantidade</label>
                  <input
                    type="number"
                    placeholder="Ex: 10 (será somado à quantidade atual)"
                    value={quantidadeAdicionar}
                    onChange={(e) => setQuantidadeAdicionar(e.target.value)}
                    className="w-full border-2 border-green-200 focus:border-green-500 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors bg-green-50/80 backdrop-blur-sm text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">💡 Digite a quantidade que deseja adicionar ao estoque atual</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSalvar}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg mt-4 sm:mt-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2 sm:gap-3"
            >
              {editing ? (
                <>
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Salvar Alterações</span>
                  <span className="sm:hidden">Salvar</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Adicionar Produto</span>
                  <span className="sm:hidden">Adicionar</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsButtons;
