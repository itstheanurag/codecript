import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomeLayout from "./layouts/HomeLayout";
import DocLayout from "./layouts/DocLayout";
import CoffeeButton from "./components/CoffeeButton";
import HomePage from "./pages/HomePage";
import DocContentPage from "./pages/DocContentPage";

// The playground pulls in the PostgreSQL WASM engine (~3 MB), so it stays out
// of the main bundle and only loads when someone opens /playground.
const PlaygroundPage = lazy(() => import("./pages/PlaygroundPage"));

const PlaygroundFallback = () => (
  <div className="flex h-dvh items-center justify-center bg-paper-100 px-6">
    <p className="font-sans text-sm text-ink-muted">
      Loading the SQL playground…
    </p>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-paper-100 font-sans selection:bg-paper-300 selection:text-ink text-ink">
        <Routes>
          {/* Home — with footer */}
          <Route element={<HomeLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* SQL playground — a standalone tool, outside the content shell */}
          <Route
            path="/playground"
            element={
              <Suspense fallback={<PlaygroundFallback />}>
                <PlaygroundPage />
              </Suspense>
            }
          />

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

        {/* Global Floating Buy Me A Coffee Button */}
        <CoffeeButton />
      </div>
    </HelmetProvider>
  );
}

export default App;
