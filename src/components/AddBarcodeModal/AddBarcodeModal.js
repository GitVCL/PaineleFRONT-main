import { useState, useEffect } from 'react';
import { X, Camera, Calendar, Package, Plus, Scan } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../../contexts/NotificationContext';
import BarcodeScanner from '../BarcodeScanner/BarcodeScanner';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const AddBarcodeModal = ({ isOpen, onClose, produto, onSuccess }) => {
  const { addNotification } = useNotification();
  const [codigoBarras, setCodigoBarras] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  // Limpar campos quando o modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setCodigoBarras('');
      setDataVencimento('');
      setShowScanner(false);
    }
  }, [isOpen]);

  const handleBarcodeScanned = (scannedCode) => {
    setCodigoBarras(scannedCode);
    setShowScanner(false);
    addNotification('Código de barras escaneado com sucesso!', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!codigoBarras.trim()) {
      addNotification('Digite um código de barras válido', 'error');
      return;
    }

    if (!dataVencimento) {
      addNotification('Selecione uma data de vencimento', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/codigosBarras/adicionar`,
        {
          produtoId: produto.id,
          codigo: codigoBarras.trim(),
          dataVencimento: new Date(dataVencimento).toISOString()
        },
        { withCredentials: true }
      );

      addNotification('Código de barras adicionado com sucesso!', 'success');
      onSuccess && onSuccess(response.data);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao adicionar código de barras';
      addNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Adicionar Código de Barras</h3>
                <p className="text-blue-100 text-sm">
                  {produto?.nome || 'Produto'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scanner Modal */}
        {showScanner && (
          <div className="absolute inset-0 bg-white z-10">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-blue-600" />
                  Scanner de Código
                </h3>
                <button
                  onClick={() => setShowScanner(false)}
                  className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all duration-300"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Aponte a câmera para o código de barras
              </p>
            </div>
            <div className="p-6">
              <BarcodeScanner
                onScan={handleBarcodeScanned}
                onError={(error) => {
                  console.error('Erro no scanner:', error);
                  addNotification('Erro ao acessar a câmera', 'error');
                }}
              />
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Produto Info */}
          {produto && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{produto.nome}</h4>
                  <p className="text-sm text-gray-600">
                    Categoria: {produto.categoria} • Estoque: {produto.quantidade}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Código de Barras */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Código de Barras *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Digite ou escaneie o código de barras"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 pr-12 rounded-xl transition-colors bg-white text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Escanear código de barras"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Data de Vencimento *
            </label>
            <div className="relative">
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border-2 border-gray-200 focus:border-green-500 p-3 pr-12 rounded-xl transition-colors bg-white text-sm"
                required
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {dataVencimento && (
              <p className="text-xs text-gray-600 mt-1">
                Vencimento: {formatDate(dataVencimento)}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adicionando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBarcodeModal;