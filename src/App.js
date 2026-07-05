import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { Cadastro } from "./pages/Cadastro";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { NotFound } from "./pages/NotFound";
import { Selling } from "./pages/Selling";
import { Despesas } from "./pages/Despesas";
import { Usuarios } from "./pages/Usuarios";
import { Relatorio } from "./pages/Relatorio";
import { Obrigado } from "./pages/Obrigado";
import { Error } from "./pages/Error";
import AddBarcode from "./pages/AddBarcode";
import { EsqueceuSenha } from "./components/Login/EsqueceuSenha";
import { ResetSenha } from "./components/Login/Resetsenha";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlanProtectedRoute from "./components/Auth/PlanProtectedRoute";
import PermissionProtectedRoute from "./components/Auth/PermissionProtectedRoute";

import { Toaster } from "./components/ui/toaster";
import { LightModeProvider } from "./contexts/LightModeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ModalProvider } from "./contexts/ModalContext";
import { DesktopNotificationBell } from "./components/Layout/DesktopNotificationBell";



const BellWrapper = () => {
  const location = useLocation();
  const hidePaths = ["/login", "/", "/cadastro", "/esqueceusenha", "/resetsenha"];
  if (hidePaths.includes(location.pathname)) return null;
  return <DesktopNotificationBell />;
};

function App() {
  return (
    <LightModeProvider>
      <NotificationProvider>
        <ModalProvider>
           <BrowserRouter>
             {/* Sino de notificação para desktop, oculto na página de login */}
             <BellWrapper />
             {/* Toast notifications */}
             <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
             
  <Routes>
              <Route path="login" element={<Login />} /> {/* login como principal */}
              <Route path="cadastro" element={<Cadastro />} />

              <Route path="esqueceusenha" element={<EsqueceuSenha />} />
            <Route path="resetsenha" element={<ResetSenha />} />
              
              {/* Rotas protegidas com controle de planos */}
            <Route path="home" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO', 'COLABORADOR', 'ADMIN']}>
                <Home />
              </PlanProtectedRoute>
            } />
            <Route path="products" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO']}>
                <PermissionProtectedRoute requiredPermissions={['produtos']}>
                  <Products />
                </PermissionProtectedRoute>
              </PlanProtectedRoute>
            } />
            <Route path="addbarcode" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO']}>
                <PermissionProtectedRoute requiredPermissions={['produtos']}>
                  <AddBarcode />
                </PermissionProtectedRoute>
              </PlanProtectedRoute>
            } />
            <Route path="despesas" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO']}>
                <PermissionProtectedRoute requiredPermissions={['despesas']}>
                  <Despesas />
                </PermissionProtectedRoute>
              </PlanProtectedRoute>
            } />
            <Route path="relatorio" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO']}>
                <PermissionProtectedRoute requiredPermissions={['relatorios']}>
                  <Relatorio />
                </PermissionProtectedRoute>
              </PlanProtectedRoute>
            } />
            <Route path="funcionarios" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO']} requiresFuncionarios={true}>
                <Usuarios />
              </PlanProtectedRoute>
            } />

            
            {/* Rota acessível para ambos os tipos */}
            <Route path="selling" element={
              <PlanProtectedRoute allowedRoles={['PRINCIPAL', 'FUNCIONARIO']}>
                <PermissionProtectedRoute requiredPermissions={['vendas']}>
                  <Selling />
                </PermissionProtectedRoute>
              </PlanProtectedRoute>
            } />
            

            
            {/* Rotas públicas */}
            {/* Página inicial agora é a Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="obrigado" element={<Obrigado />} />
            <Route path="error" element={<Error />} />
            
            <Route path="*" element={<NotFound />} />
  </Routes>
        </BrowserRouter>
        </ModalProvider>
      </NotificationProvider>
    </LightModeProvider>
  );
}

export default App;
