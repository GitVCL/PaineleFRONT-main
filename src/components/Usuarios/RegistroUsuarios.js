import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, UserCheck, UserX, AlertCircle, X, Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { getUsuario } from '../../utils/usuario';
import { toast } from 'react-toastify';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const RegistroUsuarios = () => {
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

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/usuarios');
      setUsers(response.data.usuarios || []);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      setUsers([]);
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
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao salvar usuário');
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/api/usuarios/${userId}`);
        toast.success('Usuário excluído com sucesso!');
        carregarUsuarios();
      } catch (error) {
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/api/usuarios/${user.email}/status`, {
        ativo: !user.ativo
      });
      toast.success(`Usuário ${user.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    toast.info('ID copiado para a área de transferência!');
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

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      ativo: user.ativo !== false
    });
    setShowModal(true);
  };

  const getFilteredUsers = () => {
    return users.filter(user => 
      user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telefone && user.telefone.includes(searchTerm))
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-3 sm:p-4">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Registro de Usuários
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Gerencie o cadastro de usuários do sistema
                </p>
              </div>
            </div>
            
            {/* Botão "Novo Usuário" */}
            <button 
              onClick={openCreateModal}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Novo Usuário
            </button>
          </div>
        </div>

        {/* Filtros e Estatísticas */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuários..."
                className="pl-10 pr-4 py-2 w-full bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <UserCheck className="h-4 w-4 text-green-400" />
              <span>{users.filter(u => u.ativo !== false).length} ativos</span>
              
              <span className="mx-2">•</span>
              
              <UserX className="h-4 w-4 text-red-400" />
              <span>{users.filter(u => u.ativo === false).length} inativos</span>
              
              <span className="mx-2">•</span>
              
              <Users className="h-4 w-4 text-purple-400" />
              <span>{users.length} total</span>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-700/50">
              <thead>
                <tr className="bg-slate-700/30">
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuário</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">ID</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-4 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                        <p>Carregando usuários...</p>
                      </div>
                    </td>
                  </tr>
                ) : getFilteredUsers().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-2 py-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="bg-slate-700/50 p-3 rounded-full mb-3">
                          <AlertCircle className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-1">
                          {users.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum usuário encontrado'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {users.length === 0 ? 'Crie seu primeiro usuário para começar' : 'Tente ajustar os filtros de busca'}
                        </p>
                      </div>
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
                            {user.id ? (user.id.substring(0, 8) + '...') : '-'}
                          </code>
                          <button 
                            onClick={() => user.id && copyToClipboard(user.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copiar ID"
                          >
                            {copiedId === user.id ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-2">
                        {user.ativo !== false ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1"></span>
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1 rounded-lg ${user.ativo !== false ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-green-500/20 text-green-400'} transition-colors`}
                            title={user.ativo !== false ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            {user.ativo !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 rounded-lg hover:bg-blue-500/20 text-blue-400 transition-colors"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
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

export default RegistroUsuarios;