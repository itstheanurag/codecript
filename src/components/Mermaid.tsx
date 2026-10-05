import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

// Initialize mermaid with neutral theme for consistent paper aesthetics
mermaid.initialize({
  startOnLoad: true,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "Plus Jakarta Sans, sans-serif",
  themeVariables: {
    background: "#f4eedf",
    primaryColor: "#e8decb",
    primaryBorderColor: "#d6c5ab",
    primaryTextColor: "#1c1917",
    lineColor: "#78716c",
    textColor: "#44403c",
    mainBkg: "#f4eedf",
    nodeBorder: "#d6c5ab",
  },
});

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Clear previous content
      ref.current.removeAttribute("data-processed");
      ref.current.innerHTML = chart;

      // Trigger rendering
      mermaid.contentLoaded();

      const renderChart = async () => {
        try {
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid render error:", error);
          if (ref.current) {
            ref.current.innerHTML =
              '<div class="text-accent text-xs">Failed to render diagram</div>';
          }
        }
      };

      renderChart();
    }
  }, [chart]);

  return (
    <div
      className="mermaid flex justify-center py-6 px-4 bg-paper-200 rounded-2xl border border-paper-300 my-6 overflow-x-auto shadow-2xs"
      ref={ref}
    />
  );
};

export default Mermaid;
