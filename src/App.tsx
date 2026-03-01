import { Routes, Route } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import BlogLayout from "./layouts/BlogLayout";
import DocLayout from "./layouts/DocLayout";
import HomePage from "./pages/HomePage";
import BlogListPage from "./pages/BlogListPage";
import BlogReadPage from "./pages/BlogReadPage";
import DocContentPage from "./pages/DocContentPage";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-white/30 text-white">
      <Routes>
        {/* Home — with footer */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Blog — no footer */}
        <Route element={<BlogLayout />}>
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogReadPage />} />
        </Route>

        {/* Doc sections — sidebar + content, no footer */}
        <Route element={<DocLayout />}>
          <Route path="/ds" element={<DocContentPage />} />
          <Route path="/ds/:slug" element={<DocContentPage />} />
          <Route path="/algo" element={<DocContentPage />} />
          <Route path="/algo/:slug" element={<DocContentPage />} />
          <Route path="/sys-design" element={<DocContentPage />} />
          <Route path="/sys-design/:slug" element={<DocContentPage />} />
          <Route path="/building" element={<DocContentPage />} />
          <Route path="/building/:slug" element={<DocContentPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
