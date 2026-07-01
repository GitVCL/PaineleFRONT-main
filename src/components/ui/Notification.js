import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Notification = ({ type = 'success', title, message, isVisible, onClose, duration = 2900 }) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(onClose, 300); // Aguarda a animação de saída
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'from-green-600/20 to-emerald-600/20 border-green-500/40';
      case 'error':
        return 'from-red-600/20 to-red-600/20 border-red-500/40';
      case 'info':
        return 'from-blue-600/20 to-cyan-600/20 border-blue-500/40';
      default:
        return 'from-green-600/20 to-emerald-600/20 border-green-500/40';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isShowing ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
          bg-gradient-to-r ${getColors()}
          backdrop-blur-xl border rounded-2xl p-4 shadow-2xl
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-1">
              {title}
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsShowing(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${
              type === 'success' ? 'from-green-400 to-emerald-400' :
              type === 'error' ? 'from-red-400 to-red-400' :
              'from-blue-400 to-cyan-400'
            } animate-[shrink_${duration}ms_linear_forwards]`}
          />
        </div>
      </div>
    </div>
  );
};

// Hook para usar notificações
export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  // Mostrar notificação automática após carregamento da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification({
         type: 'success',
         title: 'Sucesso!',
         message: 'Venda registrada com sucesso',
         duration: 2900,
         isVisible: true
       });
    }, 100); // Pequeno delay para garantir que a página carregou

    return () => clearTimeout(timer);
  }, []);

  const showNotification = ({ type = 'success', title, message, duration = 2900 }) => {
    setNotification({ type, title, message, duration, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = notification ? (
    <Notification
      {...notification}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent
  };
};

export default Notification;