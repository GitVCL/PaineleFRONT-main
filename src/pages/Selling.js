import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { MobileHeader } from "../components/Layout/MobileHeader";
import { Vender } from "../components/Vender/Vender";
import PageShell from "../components/Layout/PageShell";
import HomeButton from "../components/HomeButton";

export const Selling = () => {
  return (
    <>
      <HomeButton />
      <MobileHeader />
      <Navbar />
      <PageShell>
        <Vender />
        <Footer />
      </PageShell>
    </>
  );
};
