import React, { useState, useEffect } from 'react';
import { User, Building2, Mail } from 'lucide-react';
import { getUsuario } from '../../utils/usuario';
import { useLightMode } from '../../contexts/LightModeContext';

const Sidebar = () => {
  const [usuario, setUsuario] = useState({});
  const { isLightMode } = useLightMode();

  useEffect(() => {
    const userData = getUsuario();
    setUsuario(userData);
  }, []);

  // Função para gerar iniciais do nome
  const getInitials = (nome) => {
    if (!nome) return 'U';
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  return (
    <div className={`fixed left-0 top-0 h-full w-64 z-30 hidden md:block transition-all duration-300 ${
      isLightMode 
        ? 'bg-gradient-to-br from-[#0a0825] to-[#1a1640] border-r border-purple-800/30 shadow-2xl backdrop-blur-sm' 
        : 'bg-slate-900 border-r border-slate-700'
    }`}>
      {/* Header da Sidebar */}
      <div className={`p-6 border-b ${
        isLightMode ? 'border-purple-700/30' : 'border-slate-700'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className={`font-semibold text-lg ${
            isLightMode ? 'text-white' : 'text-white'
          }`}>
            Painelé
          </h2>
        </div>
      </div>

      {/* Perfil do Usuário */}
      <div className="p-6">
        {/* Avatar e Nome */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${
            isLightMode 
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
              : 'bg-purple-600 text-white'
          }`}>
            {getInitials(usuario.nome)}
          </div>
          
          <h3 className={`font-semibold text-lg mb-1 ${
            isLightMode ? 'text-white' : 'text-white'
          }`}>
            {usuario.nome || 'Usuário'}
          </h3>
        </div>

        {/* Informações do Usuário */}
        <div className="space-y-4">
          {/* Email */}
          <div className={`p-3 rounded-lg ${
            isLightMode ? 'bg-purple-900/20 border border-purple-700/20' : 'bg-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <Mail className={`w-4 h-4 ${
                isLightMode ? 'text-purple-300' : 'text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${
                  isLightMode ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  Email
                </p>
                <p className={`text-sm truncate ${
                  isLightMode ? 'text-white' : 'text-white'
                }`}>
                  {usuario.email || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          {/* Telefone removido do sidebar */}

          {/* Empresa (se disponível) */}
          {usuario.empresa && (
            <div className={`p-3 rounded-lg ${
              isLightMode ? 'bg-purple-900/20 border border-purple-700/20' : 'bg-slate-800'
            }`}>
              <div className="flex items-center space-x-3">
                <Building2 className={`w-4 h-4 ${
                  isLightMode ? 'text-purple-300' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${
                    isLightMode ? 'text-purple-200' : 'text-gray-400'
                  }`}>
                    Empresa
                  </p>
                  <p className={`text-sm ${
                    isLightMode ? 'text-white' : 'text-white'
                  }`}>
                    {usuario.empresa}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tipo de Usuário */}
          <div className={`p-3 rounded-lg ${
            isLightMode ? 'bg-purple-900/20 border border-purple-700/20' : 'bg-slate-800'
          }`}>
            <div className="flex items-center space-x-3">
              <User className={`w-4 h-4 ${
                isLightMode ? 'text-purple-300' : 'text-gray-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${
                  isLightMode ? 'text-purple-200' : 'text-gray-400'
                }`}>
                  Tipo de Conta
                </p>
                <p className={`text-sm ${
                  isLightMode ? 'text-white' : 'text-white'
                }`}>
                  {usuario.tipo === 'PRINCIPAL' ? 'Proprietário' : 
                   usuario.tipo === 'FUNCIONARIO' ? 'Funcionário' : 
                   usuario.tipo === 'ADMIN' ? 'Administrador' :
                   usuario.tipo === 'COLABORADOR' ? 'Colaborador' :
                   'Usuário'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data de Criação */}
        {usuario.criadoEm && (
          <div className={`mt-6 pt-4 border-t text-center ${
            isLightMode ? 'border-purple-700/30' : 'border-slate-700'
          }`}>
            <p className={`text-xs ${
              isLightMode ? 'text-purple-200' : 'text-gray-400'
            }`}>
              Membro desde {new Date(usuario.criadoEm).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;