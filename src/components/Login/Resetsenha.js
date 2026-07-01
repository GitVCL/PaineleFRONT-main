import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner.js';

export const ResetSenha = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    resetToken: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token) {
      setFormData(prev => ({ 
        ...prev, 
        resetToken: token,
        email: email || ''
      }));
    } else {
      toast.error('Token de recuperação não encontrado');
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.novaSenha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/reset-password', {
        email: formData.email,
        resetToken: formData.resetToken,
        novaSenha: formData.novaSenha
      });

      toast.success('Senha redefinida com sucesso!');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao redefinir senha';
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
          <h2 className="text-2xl font-bold mb-2">Redefinir Senha</h2>
          <p className="text-gray-300 text-sm">Digite sua nova senha</p>
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="novaSenha"
            placeholder="Nova Senha"
            className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.novaSenha}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div>
          <input
            type="password"
            name="confirmarSenha"
            placeholder="Confirmar Nova Senha"
            className="w-full px-4 py-3 rounded-lg bg-[#2a255c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <LoadingSpinner size={20} color="#ffffff" />}
          <span>Redefinir Senha</span>
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