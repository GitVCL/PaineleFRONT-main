import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, UserCheck, UserX, AlertCircle, X, Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { getUsuario } from '../../utils/usuario';
import { useNotification } from '../../contexts/NotificationContext';
import { useModal } from '../../contexts/ModalContext';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const UsuariosComponent = () => {
  const { addNotification } = useNotification();
  const { openModal, closeModal } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    ativo: true
  });

  // ✅ Verificar tipo do usuário atual
  const usuarioAtual = getUsuario();
  const isPrincipal = usuarioAtual?.tipo === 'PRINCIPAL';

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (showModal) {
      openModal();
    } else {
      closeModal();
    }
  }, [showModal, openModal, closeModal]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/usuarios`, {
        withCredentials: true
      });
      setUsers(response.data);
    } catch (error) {
      addNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    // Validação de senha apenas para novos usuários
    if (!editingUser && !formData.senha.trim()) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }
    
    try {
      if (editingUser) {
        // Editar usuário
        await api.put(`/api/usuarios/${editingUser.email}`, {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          ativo: formData.ativo
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar usuário
        const response = await api.post('/api/usuarios', {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone
        });
        
        const novoUsuario = response.data.usuario;
        toast.success(`Usuário criado com sucesso! ID: ${novoUsuario.id}`);
        
        // Copiar ID automaticamente
        copyToClipboard(novoUsuario.id);
      }
      
      setShowModal(false);
      resetForm();
      carregarUsuarios();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao salvar usuário';
      addNotification(errorMessage, 'error');
    }
  };

  const handleDelete = async (usuario) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      return;
    }

    try {
      await api.delete(`/api/usuarios/${usuario.email}`);
      
      addNotification(`Usuário ${usuario.nome} excluído com sucesso!`, 'success');
      carregarUsuarios();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao excluir usuário';
      addNotification(errorMessage, 'error');
    }
  };

  const openEditModal = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      senha: '',
      ativo: usuario.ativo
    });
    setShowModal(true);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      addNotification('ID copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      addNotification('Erro ao copiar ID', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      ativo: true
    });
    setEditingUser(null);
    setShowModal(false);
    setShowPassword(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getFilteredUsers = () => {
    if (searchTerm) {
      return users.filter(user => 
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return users;
  };

  return (
    <div className="bg-[#0f0b2e] text-white p-3 sm:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Gestão de Usuários
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {isPrincipal ? 'Crie usuários com acesso à mesma conta para vendas' : 'Visualização de usuários (somente leitura)'}
                </p>
              </div>
            </div>
            
            {/* Botão "Novo Usuário" - apenas para PRINCIPAL */}
            {isPrincipal && (
              <button 
                onClick={openCreateModal}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Novo Usuário
              </button>
            )}
          </div>
        </div>

        {/* Filtros e Estatísticas */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Total: {users.length}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                <UserCheck className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Ativos: {users.filter(u => u.ativo).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        {loading ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando usuários...</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 sm:p-6 flex-1">
            <div className="overflow-x-auto h-full">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-gray-300 font-medium text-sm">Usuário</th>
                    <th className="text-left p-2 text-gray-300 font-medium text-sm hidden sm:table-cell">Email</th>
                    <th className="text-left p-2 text-gray-300 font-medium text-sm hidden md:table-cell">Telefone</th>
                    <th className="text-left p-2 text-gray-300 font-medium text-sm hidden md:table-cell">ID do Usuário</th>
                    <th className="text-left p-2 text-gray-300 font-medium text-sm">Status</th>
                    <th className="text-left p-2 text-gray-300 font-medium text-sm hidden xl:table-cell">Criado em</th>
                    <th className="text-center p-2 text-gray-300 font-medium text-sm">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers().length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-400 mb-1">
                          {users.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum usuário encontrado'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {users.length === 0 ? 'Crie seu primeiro usuário para começar' : 'Tente ajustar os filtros de busca'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    getFilteredUsers().map(user => (
                      <tr key={user.email} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {user.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{user.nome}</div>
                              <div className="text-xs text-gray-400 sm:hidden">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-gray-300 text-sm hidden sm:table-cell">{user.email}</td>
                        <td className="p-2 text-gray-300 text-sm hidden md:table-cell">{user.telefone || '-'}</td>
                        <td className="p-2 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-700 px-2 py-1 rounded text-purple-300 font-mono">
                              {user.id.substring(0, 8)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(user.id)}
                              className={`p-1 rounded transition-colors ${
                                copiedId === user.id 
                                  ? 'text-green-400 bg-green-500/20' 
                                  : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/20'
                              }`}
                              title="Copiar ID completo"
                            >
                              {copiedId === user.id ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            user.ativo 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {user.ativo ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="p-2 text-gray-300 text-sm hidden xl:table-cell">
                          {new Date(user.criadoEm).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => copyToClipboard(user.id)}
                              className={`p-1.5 rounded transition-colors md:hidden ${
                                copiedId === user.id 
                                  ? 'text-green-400 bg-green-500/20' 
                                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                              }`}
                              title="Copiar ID"
                            >
                              {copiedId === user.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            
                            {/* Botão Editar - apenas para PRINCIPAL */}
                            {isPrincipal ? (
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1.5 text-gray-500 cursor-not-allowed" title="Sem permissão">
                                <Edit className="w-3.5 h-3.5" />
                              </span>
                            )}
                            
                            {/* Botão Excluir - apenas para PRINCIPAL */}
                            {isPrincipal ? (
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1.5 text-gray-500 cursor-not-allowed" title="Sem permissão">
                                <Trash2 className="w-3.5 h-3.5" />
                              </span>
                            )}
                            
                            {/* Mensagem para funcionários */}
                            {!isPrincipal && (
                              <span className="text-xs text-gray-500 italic">
                                Somente leitura
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Usuário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="nome" className="block text-xs font-medium text-gray-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-xs font-medium text-gray-300 mb-1">
                    Telefone (Opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o telefone"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label htmlFor="senha" className="block text-xs font-medium text-gray-300 mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="senha"
                        value={formData.senha}
                        onChange={(e) => setFormData({...formData, senha: e.target.value})}
                        className="w-full px-3 py-2 pr-10 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Digite a senha"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                {editingUser && (
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                        className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800"
                      />
                      Usuário ativo
                    </label>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-3 py-2 text-sm border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {editingUser ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosComponent;