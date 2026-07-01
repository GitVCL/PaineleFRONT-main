import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { MobileHeader } from "../components/Layout/MobileHeader";
import { DashboardRelatorios } from "../components/Relatorio/DashboardRelatorios";
import PageShell from "../components/Layout/PageShell";
import HomeButton from "../components/HomeButton";

export const Relatorio = () => {
  return (
    <>
      <HomeButton />
      <MobileHeader />
      <Navbar />
      <PageShell>
        <DashboardRelatorios />
        <Footer />
      </PageShell>
    </>
  );
};
