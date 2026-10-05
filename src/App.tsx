import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomeLayout from "./layouts/HomeLayout";
import DocLayout from "./layouts/DocLayout";
import CoffeeButton from "./components/CoffeeButton";

const HomePage = lazy(() => import("./pages/HomePage"));
const DocContentPage = lazy(() => import("./pages/DocContentPage"));

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-paper-100 font-sans selection:bg-paper-300 selection:text-ink text-ink">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-paper-100 text-ink-muted text-xs font-sans">
              Loading...
            </div>
          }
        >
          <Routes>
            {/* Home — with footer */}
            <Route element={<HomeLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* Doc sections — sidebar + content, no footer */}
            <Route element={<DocLayout />}>
              <Route path="/languages" element={<DocContentPage />} />
              <Route path="/languages/*" element={<DocContentPage />} />
              <Route path="/ds" element={<DocContentPage />} />
              <Route path="/ds/*" element={<DocContentPage />} />
              <Route path="/algo" element={<DocContentPage />} />
              <Route path="/algo/*" element={<DocContentPage />} />
              <Route path="/sys-design" element={<DocContentPage />} />
              <Route path="/sys-design/*" element={<DocContentPage />} />
              <Route path="/building" element={<DocContentPage />} />
              <Route path="/building/*" element={<DocContentPage />} />
              <Route path="/behavioral" element={<DocContentPage />} />
              <Route path="/behavioral/*" element={<DocContentPage />} />
              <Route path="/lld" element={<DocContentPage />} />
              <Route path="/lld/*" element={<DocContentPage />} />
              <Route path="/fundamentals" element={<DocContentPage />} />
              <Route path="/fundamentals/*" element={<DocContentPage />} />
              <Route path="/databases" element={<DocContentPage />} />
              <Route path="/databases/*" element={<DocContentPage />} />
              <Route path="/api-design" element={<DocContentPage />} />
              <Route path="/api-design/*" element={<DocContentPage />} />
              <Route path="/concurrency" element={<DocContentPage />} />
              <Route path="/concurrency/*" element={<DocContentPage />} />
              <Route path="/devops" element={<DocContentPage />} />
              <Route path="/devops/*" element={<DocContentPage />} />
              <Route path="/testing" element={<DocContentPage />} />
              <Route path="/testing/*" element={<DocContentPage />} />
            </Route>
          </Routes>
        </Suspense>

        {/* Global Floating Buy Me A Coffee Button */}
        <CoffeeButton />
      </div>
    </HelmetProvider>
  );
}

export default App;
