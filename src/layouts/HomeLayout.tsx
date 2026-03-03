import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomeLayout = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <div className="max-w-[90rem] mx-auto border-x border-neutral-800 flex-1 w-full">
        <main className="h-full">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
