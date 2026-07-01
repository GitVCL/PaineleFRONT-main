import { useEffect } from "react";

export const Wrong = () => {
  useEffect(() => {
    // Aqui você pode limpar estados temporários, logs etc
  }, []);

  return (
    <section className="py-24 px-4 bg-[#1e1b4b] min-h-screen text-white flex items-center justify-center">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Tente novamente, o seu pagamento falhou.</h1>
        <p className="text-lg text-gray-300">
          Não conseguimos identificar o problema, retorne o processo e tente novamente.
        </p>
      </div>
    </section>
  );
};
