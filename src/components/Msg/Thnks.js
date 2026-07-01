import { useEffect } from "react";

export const Thnks = () => {
  useEffect(() => {
    // Aqui você pode limpar estados temporários, logs etc
  }, []);

  return (
    <section className="py-24 px-4 bg-[#1e1b4b] min-h-screen text-white flex items-center justify-center">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Obrigado pela sua assinatura!</h1>
        <p className="text-lg text-gray-300">
          Recebemos seu pagamento com sucesso. Saia e entre novamente no sistema para ativar sua licença Pro.
        </p>
      </div>
    </section>
  );
};
