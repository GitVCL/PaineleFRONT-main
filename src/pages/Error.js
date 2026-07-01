

import { Footer } from "../components/Layout/Footer";
import { Wrong }  from "../components/Msg/Wrong";
import { Navbar } from "../components/Layout/Navbar";


export const Error = () => {
  return (
     <div className="min-h-screen bg-[#1e1b4b] ">
      <main className="max-w-7xl mx-auto px-4 py-10 min-h-screen">

         
        <Wrong/>               
        <Navbar />
        <Footer />
      </main>
      
    </div>
  );
};
