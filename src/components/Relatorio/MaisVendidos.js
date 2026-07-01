import { useEffect, useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { getUsuario } from "../../utils/usuario";

const categories = ["Todos", "Bebidas", "Comidas", "Variados", "Roupas", "Eletrônicos", "Suplementos"];
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const MaisVendidos = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [produtos, setProdutos] = useState([]);
  
  // ✅ Usando helper seguro para carregar usuário
  const usuario = getUsuario();

  useEffect(() => {
    if (usuario?.id) {
      axios
        .get(`${API_URL}/api/produtos`, {
          withCredentials: true
        })
        .then((res) => {
          setProdutos(res.data);
        })
        .catch((err) => {});
    }
  }, [usuario?.id]);

  const calcularNivel = (vendidos) => {
    if (!produtos.length) return 0;
    const max = Math.max(...produtos.map((p) => p.vendidos || 0));
    return max === 0 ? 0 : Math.round((vendidos / max) * 100);
  };

  const produtosFiltrados = produtos.filter(
    (p) => activeCategory === "Todos" || p.categoria === activeCategory
  );

  return (
    <section id="skills" className="py-24 px-4 bg-[#1e1b4b] min-h-screen text-gray-900">
      <div className="container mx-auto max-w-5xl bg-[#1e1b4b]">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          Mais Vendidos
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-violet-600 text-gray-900"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-900"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto, key) => (
            <div
              key={key}
              className="bg-card p-6 rounded-lg shadow-xs card-hover text-gray-900 border border-white/10"
            >
              <div className="text-left mb-4">
                <h3 className="font-semibold text-lg">{produto.nome}</h3>
              </div>

              <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full origin-left animate-[grow_1.5s_ease-out]"
                  style={{ width: `${calcularNivel(produto.vendidos)}%` }}
                />
              </div>

              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span className="text-left">
                  Vendidos: <strong>{produto.vendidos}</strong>
                </span>
                <span className="text-right">
                  {calcularNivel(produto.vendidos)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
