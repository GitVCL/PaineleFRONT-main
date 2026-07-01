import { Navigate } from 'react-router-dom';
import { getUsuario } from '../../utils/usuario';

/**
 * Componente simplificado que apenas verifica autenticação
 * A lógica de planos foi removida conforme solicitação
 */
const PlanProtectedRoute = ({ 
  children, 
  allowedRoles = ['PRINCIPAL', 'FUNCIONARIO'],
  requiresFuncionarios = false,
  allowExpiredForAssinatura = false
}) => {
  const usuario = getUsuario();

  // Se não há usuário logado, redireciona para página inicial
  if (!usuario || !usuario.id) {
    return <Navigate to='/' replace />;
  }

  // Acesso sempre liberado
  return children;
};

export default PlanProtectedRoute;
