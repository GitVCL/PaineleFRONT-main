import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { setUsuario } from '../../utils/usuario';
import LoadingSpinner from '../ui/LoadingSpinner.js';

export const Usuario = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const loginEndpoint = '/api/auth/login';
      
      const response = await api.post(loginEndpoint, { email, senha }, { withCredentials: true });

      if (response.data.usuario) {
        // ✅ Salvar dados do usuário com token usando helper seguro
        const dadosUsuario = {
          ...response.data.usuario,
          token: response.data.token
        };
        setUsuario(dadosUsuario);
        
        // Verificar se é funcionário e redirecionar baseado nas permissões
        
        if (dadosUsuario.tipo === 'FUNCIONARIO') {
          if (dadosUsuario.permissoes && dadosUsuario.permissoes.length > 0) {
            
            // Ordem de prioridade para redirecionamento
            const paginasPrioridade = [
              { permissao: 'dashboard', rota: '/home' },
              { permissao: 'vendas', rota: '/selling' },
              { permissao: 'produtos', rota: '/products' },
              { permissao: 'relatorios', rota: '/relatorio' },
              { permissao: 'despesas', rota: '/despesas' },
              { permissao: 'assinatura', rota: '/assinatura' }
            ];
            
            // Encontrar a primeira página que o funcionário tem acesso
            const paginaPermitida = paginasPrioridade.find(pagina => {
              return dadosUsuario.permissoes.includes(pagina.permissao);
            });
            
            if (paginaPermitida) {
              navigate(paginaPermitida.rota);
            } else {
              // Se não tem nenhuma permissão específica, vai para home (dashboard)
              navigate('/home');
            }
          } else {
            // Se não tem permissões definidas, vai para home (dashboard)
            navigate('/home');
          }
        } else if (dadosUsuario.tipo === 'COLABORADOR') {
          // Usuário colaborador vai para home (dashboard) com acesso limitado
          navigate('/home');
        } else if (dadosUsuario.tipo === 'ADMIN') {
          // Administrador vai para home (dashboard) com acesso completo
          navigate('/home');
        } else {
          // Usuário principal vai para home
          navigate('/home');
        }
      } else {
        setErro('Dados do usuário não retornados pelo servidor');
      }
    } catch (error) {
      const mensagem = error.response?.data?.message || 'Erro de conexão com o servidor';
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#1e1b8b] text-white">
      <h1 className="text-4xl font-bold mb-8">Painelé</h1>

      <form
        onSubmit={handleLogin}
        className="bg-[#1f1b4d] p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-6"
      >
        {erro && (
          <div className="text-red-400 bg-red-900/20 p-2 rounded text-sm text-center">
            {erro}
          </div>
        )}

        <div>
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <input
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400"
            onClick={() => setMostrarSenha((v) => !v)}
          >
            {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <LoadingSpinner size={20} color="#ffffff" />}
              <span>Entrar</span>
            </button>

        <div className="text-center space-y-2">
          <Link to="/esqueceusenha" className="text-purple-300 hover:underline text-sm block">
            Esqueceu a senha?
          </Link>
          <Link to="/cadastro" className="text-green-300 hover:underline text-sm block">
            Registre-se
          </Link>
        </div>
      </form>
    </div>
  );
};
