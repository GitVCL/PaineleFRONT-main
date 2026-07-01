import { Navigate } from 'react-router-dom';
import { getUsuario } from '../../utils/usuario';

/**
 * Componente para proteger rotas baseado nas permissões específicas do funcionário
 * 
 * @param {Array} requiredPermissions - Permissões necessárias para acessar a rota
 * @param {React.Component} children - Componente filho a ser renderizado
 * @param {string} fallbackRoute - Rota para redirecionar se não tiver permissão (padrão: /selling)
 */
const PermissionProtectedRoute = ({ 
  requiredPermissions = [], 
  children, 
  fallbackRoute = '/selling' 
}) => {
  const usuario = getUsuario();
  const tipoUsuario = usuario?.tipo || 'PRINCIPAL';

  // Se não há usuário logado, redirecionar para login
  if (!usuario || !usuario.id) {
    return <Navigate to='/login' replace />;
  }

  // Se é usuário PRINCIPAL, sempre permitir acesso
  if (tipoUsuario === 'PRINCIPAL') {
    return children;
  }

  // Se é FUNCIONARIO, verificar permissões específicas
  if (tipoUsuario === 'FUNCIONARIO') {
    const permissoesFuncionario = usuario?.permissoes || [];
    
    // Se não há permissões necessárias, permitir acesso
    if (requiredPermissions.length === 0) {
      return children;
    }
    
    // Verificar se o funcionário tem pelo menos uma das permissões necessárias
    const temPermissao = requiredPermissions.some(permissao => 
      permissoesFuncionario.includes(permissao)
    );
    
    if (temPermissao) {
      return children;
    } else {
      // Redirecionar para rota de fallback se não tiver permissão
      return <Navigate to={fallbackRoute} replace />;
    }
  }

  // Tipo de usuário não reconhecido, redirecionar para login
  return <Navigate to='/login' replace />;
};

export default PermissionProtectedRoute;