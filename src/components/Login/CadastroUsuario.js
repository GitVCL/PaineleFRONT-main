import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../ui/LoadingSpinner";
import { API_BASE_URL } from "../../utils/apiBaseUrl";

export const CadastroUsuario = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // evita double click
    setErro("");
    setSucesso("");
    setIsSubmitting(true);

    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      setIsSubmitting(false);
      return;
    }

    try {
      const resposta = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        setSucesso("Conta criada com sucesso! Faça login para entrar.");
        setTimeout(() => {
          setIsSubmitting(false);
          navigate(`/login`);
        }, 500);
      } else {
        setErro(data.message || data.mensagem || "Erro ao criar conta");
        setIsSubmitting(false);
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] text-white">
      <h1 className="text-4xl font-bold mb-8">Criar Conta</h1>

      <form
        onSubmit={handleCadastro}
        className="bg-[#1f1b4d] p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-5"
      >
        {erro && (
          <div className="text-red-400 bg-red-900/20 p-2 rounded text-sm text-center">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="text-green-400 bg-green-900/20 p-2 rounded text-sm text-center">
            {sucesso}
          </div>
        )}

        <input
          type="text"
          placeholder="Seu nome"
          className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar Senha"
          className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <LoadingSpinner size={20} color="#ffffff" />}
          <span>Criar Conta</span>
        </button>

        <div className="text-center">
          <Link to="/login" className="text-purple-300 hover:underline text-sm">
            Já tem conta? Entrar
          </Link>
        </div>
      </form>
    </div>
  );
};
