

import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { Thnks } from "../components/Msg/Thnks";
import PageShell from "../components/Layout/PageShell";

export const Obrigado = () => {
  return (
    <>
      <Navbar />
      <PageShell>
        <Thnks />
        <Footer />
      </PageShell>
    </>
  );
};
