// PageShell.jsx - Wrapper global para padronizar layout de todas as páginas
import { useLightMode } from "../../contexts/LightModeContext";
import LightModeHeader from "./LightModeHeader";
import { LightModeFooter } from "./LightModeFooter";
import Sidebar from "./Sidebar";

export default function PageShell({ children, className = "" }) {
  const { isLightMode } = useLightMode();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f0b2e] to-[#1e1b4b] text-white fixed top-0 left-0 right-0 bottom-0 overflow-auto">
      {/* Sidebar - apenas desktop */}
      <Sidebar />
      
      {/* Header do modo light */}
      <LightModeHeader />
      
      {/* Conteúdo compensado pelo Sidebar e pelo header/footer do modo light */}
      <main className={`min-h-screen px-4 overflow-x-hidden ${
        isLightMode 
          ? 'pt-20 pb-20 md:ml-64' // Padding top para header, bottom para footer e left margin para sidebar no desktop
          : 'py-16 md:ml-64 md:px-8' // Layout normal com sidebar maior (w-64 = 256px) e mais padding
      } ${className}`}>
        {children}
      </main>

      {/* Footer do modo light */}
      <LightModeFooter />
    </div>
  );
}