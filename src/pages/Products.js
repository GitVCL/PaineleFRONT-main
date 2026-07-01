
import { Footer } from "../components/Layout/Footer";
import { Navbar } from "../components/Layout/Navbar";
import { MobileHeader } from "../components/Layout/MobileHeader";
import { ProductsButtons } from "../components/Produtos/ProductsButtons";
import PageShell from "../components/Layout/PageShell";
import HomeButton from "../components/HomeButton";

export const Products = () => {
  return (
    <>
      <HomeButton />
      <MobileHeader />
      <Navbar />
      <PageShell>
        <ProductsButtons />
        <Footer />
      </PageShell>
    </>
  );
};
