import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

// Prerendered <head> tags exist for crawlers and no-JS clients. Once React is
// running, react-helmet-async owns the head; remove the static copies first so
// pages do not ship duplicate canonicals/descriptions/JSON-LD.
document.querySelectorAll('[data-rh]:not(title)').forEach((tag) => tag.remove());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
