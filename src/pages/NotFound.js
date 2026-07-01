import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import PageShell from "../components/Layout/PageShell";

export const NotFound = () => {
  return (
    <>
      <Navbar />
      <PageShell>
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-white mb-4">404 - Página não encontrada</h1>
          <p className="text-white/70">A página que você está procurando não existe.</p>
        </div>
        <Footer />
      </PageShell>
    </>
  );
};
