import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const CronometroReverso = ({ dataExpiracao, className = "" }) => {
  const [tempoRestante, setTempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
    expirado: false
  });

  useEffect(() => {
    if (!dataExpiracao) return;

    const calcularTempoRestante = () => {
      const agora = new Date().getTime();
      const expira = new Date(dataExpiracao).getTime();
      const diferenca = expira - agora;

      if (diferenca <= 0) {
        setTempoRestante({
          dias: 0,
          horas: 0,
          minutos: 0,
          segundos: 0,
          expirado: true
        });
        return;
      }

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setTempoRestante({
        dias,
        horas,
        minutos,
        segundos,
        expirado: false
      });
    };

    // Calcular imediatamente
    calcularTempoRestante();

    // Atualizar a cada segundo
    const intervalo = setInterval(calcularTempoRestante, 1000);

    return () => clearInterval(intervalo);
  }, [dataExpiracao]);

  if (!dataExpiracao) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm">Sem data de expiração</span>
      </div>
    );
  }

  if (tempoRestante.expirado) {
    return (
      <div className={`flex items-center gap-2 text-red-400 ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Plano expirado</span>
      </div>
    );
  }

  const isUrgente = tempoRestante.dias <= 2;
  const isAviso = tempoRestante.dias <= 7 && tempoRestante.dias > 2;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className={`w-4 h-4 ${
        isUrgente ? 'text-red-400' : 
        isAviso ? 'text-yellow-400' : 
        'text-green-400'
      }`} />
      <div className={`flex items-center gap-1 text-sm font-mono ${
        isUrgente ? 'text-red-400' : 
        isAviso ? 'text-yellow-400' : 
        'text-green-400'
      }`}>
        {tempoRestante.dias > 0 && (
          <span className="bg-white/10 px-2 py-1 rounded">
            {tempoRestante.dias}d
          </span>
        )}
        <span className="bg-white/10 px-2 py-1 rounded">
          {String(tempoRestante.horas).padStart(2, '0')}h
        </span>
        <span className="bg-white/10 px-2 py-1 rounded">
          {String(tempoRestante.minutos).padStart(2, '0')}m
        </span>
        <span className="bg-white/10 px-2 py-1 rounded">
          {String(tempoRestante.segundos).padStart(2, '0')}s
        </span>
      </div>
      {isUrgente && (
        <span className="text-xs text-red-300 ml-2">
          ⚠️ Urgente!
        </span>
      )}
      {isAviso && (
        <span className="text-xs text-yellow-300 ml-2">
          ⚡ Expira em breve
        </span>
      )}
    </div>
  );
};

export default CronometroReverso;