import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { MobileHeader } from "../components/Layout/MobileHeader";
import { DashboardResumo } from "../components/Inicio/DashboardResumo";
import PageShell from "../components/Layout/PageShell";

export const Home = () => {
  return (
    <>
      <MobileHeader />
      <Navbar />
      <PageShell>
        <DashboardResumo />
        <Footer />
      </PageShell>
    </>
  );
};
