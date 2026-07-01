import { useState } from "react";
import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { MobileHeader } from "../components/Layout/MobileHeader";
import FuncionariosComponent from "../components/Usuarios/FuncionariosComponent";
import PageShell from "../components/Layout/PageShell";
import HomeButton from "../components/HomeButton";

export const Usuarios = () => {
  return (
    <>
      <HomeButton />
      <MobileHeader />
      <Navbar />
      <PageShell>
        <div className="bg-[#0f0b2e] text-white p-3 sm:p-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <FuncionariosComponent />
          </div>
        </div>
        <Footer />
      </PageShell>
    </>
  );
};
export default Usuarios;
