import { createContext, useContext, useState, useEffect } from 'react';
import { getUsuario } from '../utils/usuario';

const LightModeContext = createContext();

export const useLightMode = () => {
  const context = useContext(LightModeContext);
  if (!context) {
    throw new Error('useLightMode deve ser usado dentro de um LightModeProvider');
  }
  return context;
};

export const LightModeProvider = ({ children }) => {
  // Sempre manter o modo light ativo como padrão
  const [isLightMode] = useState(true);

  useEffect(() => {
    // Garantir que o localStorage sempre tenha o modo light ativo
    localStorage.setItem('lightMode', JSON.stringify(true));
  }, []);

  // Função de toggle desabilitada - não faz nada
  const toggleLightMode = () => {
    // Função mantida para compatibilidade, mas não altera o estado
    console.log('Modo light está sempre ativo');
  };

  // Manter compatibilidade: expor isFuncionario
  const usuario = getUsuario();
  const isFuncionario = usuario?.tipo === 'FUNCIONARIO';

  return (
    <LightModeContext.Provider value={{
      isLightMode,
      toggleLightMode,
      isFuncionario
    }}>
      {children}
    </LightModeContext.Provider>
  );
};