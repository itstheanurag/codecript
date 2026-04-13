import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

// Initialize mermaid with dark theme for consistent aesthetics
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
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

      // Use mermaid.render for more control if contentLoaded isn't enough,
      // but contentLoaded is safer for React refs in many cases.
      // For Vite/React apps, often we need to re-render it explicitly:
      const renderChart = async () => {
        try {
          // Unique ID for each diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid render error:", error);
          if (ref.current) {
            ref.current.innerHTML =
              '<div class="text-red-500">Failed to render diagram</div>';
          }
        }
      };

      renderChart();
    }
  }, [chart]);

  return (
    <div
      className="mermaid flex justify-center py-6 px-4 bg-neutral-900/50 rounded-xl border border-neutral-800 my-6 overflow-x-auto"
      ref={ref}
    />
  );
};

export default Mermaid;
