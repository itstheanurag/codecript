import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomeLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <div className="max-w-[90rem] mx-auto border-x border-neutral-800 flex-1 w-full min-h-0 flex flex-col">
        <main className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
