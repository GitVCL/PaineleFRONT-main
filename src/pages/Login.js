

import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { Usuario } from "../components/Login/Usuario";
import PageShell from "../components/Layout/PageShell";

export const Login = () => {
  return (
    <div className="min-h-screen bg-[#1e1b6b] text-white overflow-x-hidden">
          <main className="min-h-screen flex flex-col justify-between pb-20">
            
             <Usuario />
           
            
          </main>
        </div>
  );
};
