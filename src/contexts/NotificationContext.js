import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  React.useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    // Auto-remove após duração
    const timer = setTimeout(() => {
      handleRemove();
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'action':
        return <Zap className="w-5 h-5 text-purple-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'from-green-600/90 to-emerald-600/90 border-green-500/50';
      case 'error':
        return 'from-red-600/90 to-red-600/90 border-red-500/50';
      case 'info':
        return 'from-blue-600/90 to-cyan-600/90 border-blue-500/50';
      case 'action':
        return 'from-purple-600/90 to-violet-600/90 border-purple-500/50';
      default:
        return 'from-green-600/90 to-emerald-600/90 border-green-500/50';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-3
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        bg-gradient-to-r ${getColors()}
        backdrop-blur-xl border rounded-2xl p-4 shadow-2xl
        hover:shadow-3xl hover:scale-[1.02] transition-all duration-200
        max-w-sm w-full
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 animate-pulse">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white mb-1">
            {notification.title}
          </h4>
          <p className="text-sm text-white/90 leading-relaxed">
            {notification.message}
          </p>
        </div>
        
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors group"
        >
          <X className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
        </button>
      </div>
      
      {/* Barra de progresso animada */}
      <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${
            notification.type === 'success' ? 'from-green-400 to-emerald-400' :
            notification.type === 'error' ? 'from-red-400 to-red-500' :
            notification.type === 'info' ? 'from-blue-400 to-cyan-400' :
            'from-purple-400 to-violet-400'
          } transition-all duration-300`}
          style={{
            animation: `shrink ${notification.duration || 4000}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'success',
      duration: 4000,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Funções de conveniência
  const showSuccess = useCallback((title, message, duration) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title, message, duration) => {
    return addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title, message, duration) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const showAction = useCallback((title, message, duration) => {
    return addNotification({ type: 'action', title, message, duration });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showAction,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Container de notificações */}
      <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
        <div className="flex flex-col-reverse">
          {notifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <NotificationItem
                notification={notification}
                onRemove={removeNotification}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* CSS para animação da barra de progresso */}
      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;