import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { MobileHeader } from "../components/Layout/MobileHeader";
import DespesasComponent from "../components/Despesas/DespesasComponent";
import PageShell from "../components/Layout/PageShell";
import HomeButton from "../components/HomeButton";

export const Despesas = () => {
  return (
    <>
      <HomeButton />
      <MobileHeader />
      <Navbar />
      <PageShell>
        <DespesasComponent />
        <Footer />
      </PageShell>
    </>
  );
};

export default Despesas;