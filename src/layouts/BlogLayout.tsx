import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export const BlogLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-[90rem] mx-auto border-x border-neutral-800 flex-1 w-full">
        <main className="max-w-6xl mx-auto px-6 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BlogLayout;
