import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import CodeBlock from "./CodeBlock";

interface CodeTab {
  code: string;
  language?: string;
  lang?: string;
  label: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
}

const CodeTabs: React.FC<CodeTabsProps> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (tabs.length === 0) return;
    if (activeIndex >= tabs.length) {
      setActiveIndex(0);
    }
    if (visibleIndex >= tabs.length) {
      setVisibleIndex(0);
    }
  }, [activeIndex, visibleIndex, tabs.length]);

  const updateIndicator = useCallback(() => {
    const activeEl = tabRefs.current[activeIndex];
    if (!activeEl) return;
    setIndicatorStyle({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
      opacity: 1,
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    },
    [],
  );

  const handleTabChange = (index: number) => {
    if (tabs.length === 0) return;
    if (index === activeIndex) return;
    setActiveIndex(index);
    setOutgoingIndex(visibleIndex);
    setVisibleIndex(index);

    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = window.setTimeout(() => {
      setOutgoingIndex(null);
      transitionTimerRef.current = null;
    }, 220);
  };

  if (tabs.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/60 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-all hover:border-neutral-700">
      <div className="relative border-b border-neutral-800 bg-neutral-900/80">
        <div
          className="pointer-events-none absolute top-2 bottom-2 rounded-md border border-blue-500/25 bg-blue-500/10 shadow-[0_0_18px_rgba(59,130,246,0.18)] transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
        <div className="flex items-center gap-1 p-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab, index) => (
          <button
            key={index}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            onClick={() => handleTabChange(index)}
            className={`relative z-10 px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
              activeIndex === index
                ? "text-blue-300"
                : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>
      <div className="relative p-3 pb-0">
        {outgoingIndex !== null && outgoingIndex !== visibleIndex && (
          <div className="pointer-events-none absolute inset-3 pb-0 code-tab-pane-exit">
            <CodeBlock
              code={tabs[outgoingIndex].code}
              language={tabs[outgoingIndex].language ?? tabs[outgoingIndex].lang ?? "text"}
            />
          </div>
        )}
        <div className="relative code-tab-pane-enter">
          <CodeBlock
            code={tabs[visibleIndex].code}
            language={tabs[visibleIndex].language ?? tabs[visibleIndex].lang ?? "text"}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeTabs;
