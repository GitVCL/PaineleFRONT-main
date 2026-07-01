import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner.js';

export const EsqueceuSenha = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      toast.success('Concluído, enviamos o link de recuperação para o seu e-mail. Vamos redirecionar você para o login em 3 segundos.');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao enviar email de recuperação';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#1e1b8b] text-white">
      <h1 className="text-4xl font-bold mb-8">Painelé</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1f1b4d] p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Recuperar Senha</h2>
          <p className="text-gray-300 text-sm">Digite seu email para receber o link de recuperação</p>
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <LoadingSpinner size={20} color="#ffffff" />}
          <span>Enviar Link de Recuperação</span>
        </button>

        <div className="text-center">
          <Link to="/" className="text-purple-300 hover:underline text-sm">
            Voltar para o Login
          </Link>
        </div>
      </form>
    </div>
  );
};