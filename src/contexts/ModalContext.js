import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  const openModal = () => {
    setIsAnyModalOpen(true);
  };

  const closeModal = () => {
    setIsAnyModalOpen(false);
  };

  return (
    <ModalContext.Provider value={{
      isAnyModalOpen,
      openModal,
      closeModal
    }}>
      {children}
    </ModalContext.Provider>
  );
};