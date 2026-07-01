import { useEffect, useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, X, Copy, CheckCircle, Eye, EyeOff, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import { getUsuario } from '../../utils/usuario';
import { useNotification } from '../../contexts/NotificationContext';
import { useModal } from '../../contexts/ModalContext';

export const FuncionariosComponent = () => {
  const { addNotification } = useNotification();
  const { openModal, closeModal } = useModal();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    permissoes: [] // Usuário deve escolher as páginas que o funcionário pode acessar
  });

  // Verificar tipo do usuário atual
  const usuarioAtual = getUsuario();
  const isPrincipal = usuarioAtual?.tipo === 'PRINCIPAL';
  const planoAtual = (usuarioAtual?.assinatura || '').toLowerCase();
  const planosLimite5 = ['teste', 'premium', 'versao', 'versão'];
  const planLimit = planosLimite5.includes(planoAtual) ? 5 : 2;
  const atingiuLimite = funcionarios.length >= planLimit;

  useEffect(() => {
    // Só carregar funcionários se for usuário PRINCIPAL
    if (isPrincipal) {
      carregarFuncionarios();
    } else {
      setLoading(false);
    }
  }, [isPrincipal]);

  useEffect(() => {
    if (showModal) {
      openModal();
    } else {
      closeModal();
    }
  }, [showModal, openModal, closeModal]);

  const carregarFuncionarios = async () => {
    // Verificar se é usuário PRINCIPAL antes de fazer a requisição
    if (!isPrincipal) {
      addNotification('Acesso negado. Apenas usuários PRINCIPAL podem gerenciar funcionários.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/funcionarios');
      setFuncionarios(response.data.funcionarios || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      addNotification('Erro ao carregar funcionários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('=== DEBUG FUNCIONÁRIO ===');
      console.log('FormData completo:', formData);
      console.log('Permissões selecionadas:', formData.permissoes);
      console.log('Editando funcionário:', editingFuncionario);
      
      if (editingFuncionario) {
        // Atualizar funcionário existente
        const updateData = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          permissoes: formData.permissoes
        };
        
        console.log('Dados de atualização:', updateData);
        await api.put(`/api/funcionarios/${editingFuncionario.id}`, updateData);
        addNotification('Funcionário atualizado com sucesso!', 'success');
      } else {
        // Criar novo funcionário
        console.log('Dados para criação:', formData);
        const response = await api.post('/api/funcionarios', formData);
        console.log('Resposta do backend:', response.data);
        addNotification('Funcionário criado com sucesso!', 'success');
      }
      
      resetForm();
      carregarFuncionarios();
    } catch (error) {
      console.error('=== ERRO DETALHADO ===');
      console.error('Erro completo:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      addNotification(
        error.response?.data?.message || 'Erro ao salvar funcionário', 
        'error'
      );
    }
  };

  const handleDelete = async (funcionario) => {
    if (window.confirm(`Tem certeza que deseja excluir o funcionário ${funcionario.nome}?`)) {
      try {
        await api.delete(`/api/funcionarios/${funcionario.id}`);
        addNotification('Funcionário excluído com sucesso!', 'success');
        carregarFuncionarios();
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        addNotification('Erro ao excluir funcionário', 'error');
      }
    }
  };

  const openEditModal = (funcionario) => {
    setEditingFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      senha: '',
      telefone: funcionario.telefone || '',
      permissoes: funcionario.permissoes || []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      permissoes: []
    });
    setEditingFuncionario(null);
    setShowModal(false);
    setShowPassword(false);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      addNotification('ID copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      addNotification('Erro ao copiar ID', 'error');
    }
  };

  const getFilteredFuncionarios = () => {
    if (!searchTerm) return funcionarios;
    
    const term = searchTerm.toLowerCase();
    return funcionarios.filter(funcionario => 
      funcionario.nome.toLowerCase().includes(term) ||
      funcionario.email.toLowerCase().includes(term) ||
      funcionario.id.toLowerCase().includes(term)
    );
  };

  const handleToggleStatus = async (funcionario) => {
    try {
      await api.put(`/api/funcionarios/${funcionario.id}`, {
        ...funcionario,
        ativo: !funcionario.ativo
      });
      addNotification(
        `Funcionário ${funcionario.ativo ? 'desativado' : 'ativado'} com sucesso!`, 
        'success'
      );
      carregarFuncionarios();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      addNotification('Erro ao alterar status do funcionário', 'error');
    }
  };

  const getFilteredAndSortedFuncionarios = () => {
    let filtered = getFilteredFuncionarios();
    
    // Ordenar por nome
    filtered.sort((a, b) => a.nome.localeCompare(b.nome));
    
    // Colocar funcionários ativos primeiro
    filtered.sort((a, b) => {
      if (a.ativo && !b.ativo) return -1;
      if (!a.ativo && b.ativo) return 1;
      return 0;
    });
    
    return funcionarios;
  };

  return (
    <div className="bg-[#0f0b2e] text-white p-3 sm:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto h-full">
        {/* Verificar se é usuário PRINCIPAL */}
        {!isPrincipal ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 flex-1">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                Acesso Restrito
              </h3>
              <p className="text-sm text-gray-500">
                Apenas usuários PRINCIPAL podem gerenciar funcionários.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Você está logado como: {usuarioAtual?.tipo || 'Desconhecido'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Gestão de Funcionários
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Gerencie os funcionários da sua empresa
                </p>
              </div>
              
              <button
                onClick={() => {
                  if (atingiuLimite) {
                    addNotification(`Seu plano permite no máximo ${planLimit} funcionários.`, 'error');
                    return;
                  }
                  setShowModal(true);
                }}
                disabled={atingiuLimite}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  atingiuLimite
                    ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transform hover:scale-105'
                }`}
              >
                <Plus className="w-4 h-4" />
                Novo Funcionário
              </button>
            </div>
            <div className="mb-4 text-xs text-gray-400">
              Limite do plano: até {planLimit} funcionários.
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <p className="text-lg font-semibold text-white mt-1">{funcionarios.length}</p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Ativos</span>
                </div>
                <p className="text-lg font-semibold text-white mt-1">
                  {funcionarios.filter(f => f.ativo).length}
                </p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-gray-400">Inativos</span>
                </div>
                <p className="text-lg font-semibold text-white mt-1">
                  {funcionarios.filter(f => !f.ativo).length}
                </p>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Filtrados</span>
                </div>
                <p className="text-lg font-semibold text-white mt-1">
                  {getFilteredFuncionarios().length}
                </p>
              </div>
            </div>

            {/* Filtros e Estatísticas */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar funcionários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Total: {funcionarios.length}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                    <UserCheck className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Ativos: {funcionarios.filter(f => f.ativo).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Funcionários */}
            {loading ? (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Carregando funcionários...</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 sm:p-6 flex-1">
                <div className="overflow-x-auto h-full">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm">Nome</th>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm hidden sm:table-cell">Email</th>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm hidden md:table-cell">Telefone</th>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm hidden lg:table-cell">Permissões</th>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm hidden md:table-cell">ID do Funcionário</th>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm">Status</th>
                        <th className="text-left p-2 text-gray-300 font-medium text-sm hidden xl:table-cell">Criado em</th>
                        <th className="text-center p-2 text-gray-300 font-medium text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredFuncionarios().length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-400 mb-1">
                              {funcionarios.length === 0 ? 'Nenhum funcionário cadastrado' : 'Nenhum funcionário encontrado'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {funcionarios.length === 0 ? 'Crie seu primeiro funcionário para começar' : 'Tente ajustar os filtros de busca'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        getFilteredFuncionarios().map(funcionario => (
                          <tr key={funcionario.id} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {funcionario.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-white text-sm">{funcionario.nome}</div>
                                  <div className="text-xs text-gray-400 sm:hidden">{funcionario.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-gray-300 text-sm hidden sm:table-cell">{funcionario.email}</td>
                            <td className="p-2 text-gray-300 text-sm hidden md:table-cell">{funcionario.telefone || '-'}</td>
                            <td className="p-2 hidden lg:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {(funcionario.permissoes || ['vendas']).map((permissao) => (
                                  <span key={permissao} className="px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded-full border border-blue-600/30">
                                    {permissao}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-2 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-slate-700/50 px-2 py-1 rounded text-gray-300 font-mono">
                                  {funcionario.id.slice(0, 8)}...
                                </code>
                                <button
                                  onClick={() => copyToClipboard(funcionario.id)}
                                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Copiar ID completo"
                                >
                                  {copiedId === funcionario.id ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                funcionario.ativo 
                                  ? 'bg-green-600/20 text-green-300 border border-green-600/30' 
                                  : 'bg-red-600/20 text-red-300 border border-red-600/30'
                              }`}>
                                {funcionario.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="p-2 text-gray-400 text-xs hidden xl:table-cell">
                              {new Date(funcionario.criadoEm).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openEditModal(funcionario)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded transition-colors"
                                  title="Editar funcionário"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(funcionario)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors"
                                  title="Excluir funcionário"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            )}
          </>
        )}

        {/* Modal de Criar/Editar Funcionário */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 z-50">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">
                    {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
                  </h2>
                  <button 
                    onClick={resetForm}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Telefone (opcional)
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o telefone"
                    />
                  </div>

                  {!editingFuncionario && (
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.senha}
                          onChange={(e) => setFormData({...formData, senha: e.target.value})}
                          className="w-full px-3 py-2 pr-10 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  
                  {/* Seção de Permissões */}
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Páginas de Acesso
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'dashboard', label: 'Dashboard', description: 'Acessar painel principal e estatísticas' },
                        { id: 'vendas', label: 'Vendas', description: 'Gerenciar vendas e clientes' },
                        { id: 'produtos', label: 'Produtos', description: 'Gerenciar catálogo de produtos' },
                        { id: 'relatorios', label: 'Relatórios', description: 'Visualizar relatórios e estatísticas' },
                        { id: 'despesas', label: 'Despesas', description: 'Gerenciar despesas do negócio' },
                        { id: 'assinatura', label: 'Assinatura', description: 'Gerenciar planos e assinaturas' },
                      ].map((permissao) => (
                        <label key={permissao.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissoes.includes(permissao.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissoes: [...formData.permissoes, permissao.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissoes: formData.permissoes.filter(p => p !== permissao.id)
                                });
                              }
                            }}
                            className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">{permissao.label}</div>
                            <div className="text-xs text-gray-400">{permissao.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  
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
                      disabled={!editingFuncionario && atingiuLimite}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        !editingFuncionario && atingiuLimite
                          ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {editingFuncionario ? 'Atualizar' : 'Criar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuncionariosComponent;

