import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLightMode } from '../contexts/LightModeContext';

const HomeButton = () => {
  const navigate = useNavigate();
  const { isLightMode } = useLightMode();

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/');
  };

  // Só renderiza se estiver no modo light
  if (!isLightMode) {
    return null;
  }

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 left-4 z-50 hidden lg:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-red-600"
    >
      <LogOut size={20} />
      <span className="font-medium">Logout</span>
    </button>
  );
};

export default HomeButton;