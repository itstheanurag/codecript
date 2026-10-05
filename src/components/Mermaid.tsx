import React, { useEffect, useRef } from "react";

interface MermaidProps {
  chart: string;
}

let mermaidPromise: Promise<(typeof import("mermaid"))["default"]> | null =
  null;

const getMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      const mermaidInstance = m.default;
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: "neutral",
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif",
        themeVariables: {
          background: "#f4eedf",
          primaryColor: "#e8decb",
          primaryBorderColor: "#d6c5ab",
          primaryTextColor: "#1c1917",
          lineColor: "#5c554e",
          textColor: "#2e2924",
          mainBkg: "#f4eedf",
          nodeBorder: "#d6c5ab",
        },
      });
      return mermaidInstance;
    });
  }
  return mermaidPromise;
};

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    if (ref.current) {
      ref.current.removeAttribute("data-processed");
      ref.current.innerHTML = chart;

      const renderChart = async () => {
        try {
          const mermaid = await getMermaid();
          if (cancelled || !ref.current) return;

          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          const { svg } = await mermaid.render(id, chart);
          if (!cancelled && ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid render error:", error);
          if (!cancelled && ref.current) {
            ref.current.innerHTML =
              '<div class="text-accent text-xs font-sans">Failed to render diagram</div>';
          }
        }
      };

      void renderChart();
    }

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div
      className="mermaid flex justify-center py-6 px-4 bg-paper-200 rounded-2xl border border-paper-300 my-6 overflow-x-auto shadow-2xs"
      ref={ref}
    />
  );
};

export default Mermaid;
