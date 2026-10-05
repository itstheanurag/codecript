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
  const [rawActiveIndex, setRawActiveIndex] = useState(0);
  const [rawVisibleIndex, setRawVisibleIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const transitionTimerRef = useRef<number | null>(null);

  const activeIndex = rawActiveIndex < tabs.length ? rawActiveIndex : 0;
  const visibleIndex = rawVisibleIndex < tabs.length ? rawVisibleIndex : 0;

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
    setRawActiveIndex(index);
    setOutgoingIndex(visibleIndex);
    setRawVisibleIndex(index);

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
    <div className="my-6 rounded-lg overflow-hidden border border-paper-300paper-300 bg-paper-50paper-50 shadow-2xs">
      <div className="relative border-b border-paper-300paper-300 bg-paper-200paper-200">
        <div
          className="pointer-events-none absolute top-1 bottom-1 rounded bg-paper-50paper-paper-30050 shadow-2xs transition-all duration-200 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />
        <div className="flex items-center gap-1 p-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab, index) => (
            <button
              key={index}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              onClick={() => handleTabChange(index)}
              className={`relative z-10 px-3 py-1 rounded text-xs font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap cursor-pointer font-sans font-sans ${
                activeIndex === index
                  ? "text-inkink"
                  : "text-ink-mutedink-muted hover:text-inkink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative p-2 pb-0">
        {outgoingIndex !== null && outgoingIndex !== visibleIndex && (
          <div className="pointer-events-none absolute inset-2 pb-0 code-tab-pane-exit">
            <CodeBlock
              code={tabs[outgoingIndex].code}
              language={
                tabs[outgoingIndex].language ??
                tabs[outgoingIndex].lang ??
                "text"
              }
            />
          </div>
        )}
        <div className="relative code-tab-pane-enter">
          <CodeBlock
            code={tabs[visibleIndex].code}
            language={
              tabs[visibleIndex].language ?? tabs[visibleIndex].lang ?? "text"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CodeTabs;
