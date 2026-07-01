import { useState, useEffect } from "react"; 
import { ArrowDown } from "lucide-react";
import axios from "axios";
import { getUsuario } from "../../utils/usuario";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  YAxis,
  Legend,
} from "recharts";

const COLORS = ["#8B5CF6", "#4ADE80", "#F59E0B"];
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const Informacoes = () => {
  const [periodo, setPeriodo] = useState("Hoje");
  const [valores, setValores] = useState({
    Semana: "R$ 0,00",
    Mês: "R$ 0,00",
    Ano: "R$ 0,00",
  });
  const [chartData, setChartData] = useState({ line: [], pie: [], combo: [] });

  useEffect(() => {
    const usuario = getUsuario();
    
    if (!usuario?.id) {
      return;
    }

    axios
      .get(`${API_URL}/api/vendas/finalizadas/${usuario.id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const vendas = res.data;
        const totais = { Hoje: 0, Semana: 0, Mês: 0, Ano: 0 };
        const pieMap = {};
        const lineMap = {};
        const comboMap = {};

        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());

        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);

        for (const venda of vendas) {
          const dataVenda = new Date(venda.createdAt);

          let total = 0;
          for (const item of venda.items) {
            const itemTotal = item.preco * item.quantidade;
            total += itemTotal;
            pieMap[item.nome] = (pieMap[item.nome] || 0) + itemTotal;
            comboMap[item.nome] = comboMap[item.nome] || { name: item.nome, barras: 0, linha: 0 };
            comboMap[item.nome].barras += item.quantidade;
            comboMap[item.nome].linha += itemTotal;
          }

          if (dataVenda.toDateString() === hoje.toDateString()) totais.Hoje += total;
          if (dataVenda >= inicioSemana) totais.Semana += total;
          if (dataVenda >= inicioMes) totais.Mês += total;
          if (dataVenda >= inicioAno) totais.Ano += total;

          const mes = dataVenda.toLocaleString("default", { month: "short" });
          lineMap[mes] = (lineMap[mes] || 0) + total;
        }

        const formatar = (v) =>
          v.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
          });

        setValores({
          Semana: formatar(totais.Semana),
          Mês: formatar(totais.Mês),
          Ano: formatar(totais.Ano),
        });

        setChartData({
          line: Object.entries(lineMap).map(([name, value]) => ({ name, value })),
          pie: Object.entries(pieMap).map(([name, value]) => ({ name, value })),
          combo: Object.values(comboMap),
        });
      })
      .catch((err) => {});
  }, []);

  return (
    <section className="text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6"></h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.keys(valores).map((key, i) => (
            <div
              key={i}
              onClick={() => setPeriodo(key)}
              className={`cursor-pointer bg-gradient-to-br from-purple-700 to-violet-600 p-4 rounded-2xl shadow flex flex-col gap-1 hover:scale-[1.02] transition border border-white/10 ${
                periodo === key ? "ring-2 ring-white/50" : ""
              }`}
            >
              <p className="text-sm text-white/80 font-semibold">{key}</p>
              <p className="text-xl font-bold">{valores[key]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-20 gap-6">
       
         

    
        </div>

        <div className="mt-10 bg-white rounded-2xl p-6 shadow text-black">
          <h2 className="text-lg font-bold mb-4">Categorias Mais Vendidas + Receita</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData.combo}>
              <XAxis dataKey="name" stroke="#A78BFA" />
              <YAxis stroke="#A78BFA" />
              <Tooltip />
              <Legend />
              <Bar dataKey="barras" barSize={30} fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              <Line type="monotone" dataKey="linha" stroke="#A78BFA" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center animate-bounce">
        <span className="text-sm text-white/50 mb-1">Scroll</span>
        <ArrowDown className="h-5 w-5 text-white/80" />
      </div>
    </section>
  );
};