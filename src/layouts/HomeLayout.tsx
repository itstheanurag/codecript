import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomeLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-paper-100 text-ink">
      <Navbar />
      <div className="max-w-[90rem] mx-auto md:border-x border-paper-300 flex-1 w-full min-h-0 flex flex-col bg-paper-100">
        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default HomeLayout;
