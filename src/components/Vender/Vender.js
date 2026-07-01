import { useState } from "react";
import { SellingButtons } from "./SellingButtons";
import { Sessoes } from "./Sessoes";

export const Vender = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [modalContext, setModalContext] = useState("");
  const [comandaId, setComandaId] = useState(null);

  return (
    <>
      <SellingButtons
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        productList={productList}
        setProductList={setProductList}
        modalContext={modalContext}
        setModalContext={setModalContext}
        comandaId={comandaId}
        setComandaId={setComandaId}
        fetchVendas={() => window.location.reload()}
      />
      <Sessoes
        setIsModalOpen={setIsModalOpen}
        setProductList={setProductList}
        setModalContext={setModalContext}
        setComandaId={setComandaId}
      />
    </>
  );
};