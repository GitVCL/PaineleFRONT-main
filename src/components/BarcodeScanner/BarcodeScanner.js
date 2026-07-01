import { useEffect, useRef, useState } from 'react';
import { Keyboard, CheckCircle, AlertCircle, Scan } from 'lucide-react';

const BarcodeScanner = ({ onScan, onError }) => {
  const [scannedCode, setScannedCode] = useState('');
  const [isListening, setIsListening] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focar no input invisível para capturar a entrada do scanner USB
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyPress = (event) => {
      // Prevenir que a entrada apareça em outros campos
      if (event.target !== inputRef.current) {
        return;
      }

      const currentTime = Date.now();
      
      // Se passou muito tempo desde a última tecla, limpar o código
      if (currentTime - lastScanTime > 100) {
        setScannedCode('');
      }
      
      setLastScanTime(currentTime);

      // Enter indica fim do código de barras
      if (event.key === 'Enter') {
        event.preventDefault();
        if (scannedCode.trim().length > 0) {
          console.log('Código escaneado:', scannedCode.trim());
          onScan(scannedCode.trim());
          setScannedCode('');
        }
        return;
      }

      // Acumular caracteres do código de barras
      if (event.key.length === 1) {
        setScannedCode(prev => prev + event.key);
      }
    };

    const handleFocus = () => {
      setIsListening(true);
    };

    const handleBlur = () => {
      // Refocar automaticamente para continuar capturando
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    };

    // Adicionar event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    if (inputRef.current) {
      inputRef.current.addEventListener('focus', handleFocus);
      inputRef.current.addEventListener('blur', handleBlur);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (inputRef.current) {
        inputRef.current.removeEventListener('focus', handleFocus);
        inputRef.current.removeEventListener('blur', handleBlur);
      }
    };
  }, [scannedCode, lastScanTime, onScan]);

  const handleManualInput = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const code = event.target.value.trim();
      if (code.length > 0) {
        onScan(code);
        event.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Input invisível para capturar scanner USB */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        autoFocus
        tabIndex={-1}
      />

      {/* Interface visual */}
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Scan className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Scanner USB Ativo</h3>
          <p className="text-gray-600 text-sm">
            Escaneie o código de barras com seu leitor USB
          </p>
        </div>

        {/* Indicador de status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Aguardando Leitura</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Posicione o código de barras no leitor USB e pressione o gatilho
          </p>
        </div>

        {/* Código sendo digitado */}
        {scannedCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Keyboard className="w-4 h-4" />
              <span className="font-medium">Lendo código...</span>
            </div>
            <p className="text-blue-600 text-sm mt-1 font-mono">
              {scannedCode}
            </p>
          </div>
        )}

        {/* Input manual como alternativa */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-500 text-sm mb-3">Ou digite manualmente:</p>
          <input
            type="text"
            placeholder="Digite o código de barras e pressione Enter"
            onKeyDown={handleManualInput}
            className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-lg transition-colors bg-white text-center"
          />
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Como usar o Scanner USB:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Certifique-se de que o scanner USB está conectado</li>
          <li>• Posicione o código de barras no leitor</li>
          <li>• Pressione o gatilho do scanner</li>
          <li>• O código será lido automaticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;