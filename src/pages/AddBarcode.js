import { useState, useEffect } from 'react';
import { Search, Package, Plus, Calendar, Scan, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../contexts/NotificationContext';
import AddBarcodeModal from '../components/AddBarcodeModal/AddBarcodeModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API_URL = `${API_BASE_URL}/api/produtos`;

const AddBarcode = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    // Filtrar produtos baseado no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredProdutos(produtos);
    } else {
      const filtered = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (produto.codigoBarras && produto.codigoBarras.includes(searchTerm))
      );
      setFilteredProdutos(filtered);
    }
  }, [searchTerm, produtos]);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        withCredentials: true
      });
      setProdutos(response.data);
      setFilteredProdutos(response.data);
    } catch (error) {
      addNotification('Erro ao carregar produtos. Faça login novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBarcode = (produto) => {
    setSelectedProduto(produto);
    setShowAddModal(true);
  };

  const handleBarcodeAdded = () => {
    // Recarregar produtos para mostrar o novo código
    fetchProdutos();
    addNotification('Código de barras adicionado com sucesso!', 'success');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      'Bebidas': 'bg-blue-100 text-blue-800',
      'Comidas': 'bg-orange-100 text-orange-800',
      'Variados': 'bg-purple-100 text-purple-800',
      'Roupas': 'bg-pink-100 text-pink-800',
      'Eletrônicos': 'bg-green-100 text-green-800',
      'Suplementos': 'bg-red-100 text-red-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/products')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Scan className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Adicionar Códigos de Barras</h1>
                  <p className="text-sm text-gray-600">Vincule códigos de barras com data de vencimento aos produtos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos por nome, categoria ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProdutos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente buscar com outros termos' : 'Cadastre produtos primeiro para adicionar códigos de barras'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProdutos.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden"
              >
                {/* Product Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-2">
                        {produto.nome}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(produto.categoria)}`}>
                        {produto.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Estoque:</span>
                      <span className="font-semibold">{produto.quantidade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Preço:</span>
                      <span className="font-semibold text-green-600">
                        R$ {produto.valor?.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Existing Barcodes */}
                  {produto.codigosBarras && produto.codigosBarras.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Códigos existentes ({produto.codigosBarras.length}):
                      </p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {produto.codigosBarras.slice(0, 3).map((codigo, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-xs text-gray-700">
                                {codigo.codigo}
                              </span>
                              {codigo.dataVencimento && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(codigo.dataVencimento)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {produto.codigosBarras.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{produto.codigosBarras.length - 3} mais
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleAddBarcode(produto)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Código
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Barcode Modal */}
      <AddBarcodeModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedProduto(null);
        }}
        produto={selectedProduto}
        onSuccess={handleBarcodeAdded}
      />
    </div>
  );
};

export default AddBarcode;