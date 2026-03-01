import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export const BlogLayout = () => {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-4">
        <Outlet />
      </main>
    </>
  );
};

export default BlogLayout;
