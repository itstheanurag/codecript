import { useEffect, useState, useRef } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string;
}

const LANGUAGE_ALIAS_MAP: Record<string, string> = {
  cplusplus: "cpp",
  "c++": "cpp",
  csharp: "csharp",
  "c#": "csharp",
  cs: "csharp",
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
};

const normalizeLanguage = (rawLanguage: string): string => {
  const firstToken = rawLanguage.trim().split(/\s+/)[0] ?? "";
  const cleaned = firstToken.replace(/[{}]/g, "").toLowerCase();
  return LANGUAGE_ALIAS_MAP[cleaned] ?? (cleaned || "text");
};

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const normalizedLanguage = normalizeLanguage(language);
    const languageCandidates = Array.from(
      new Set([normalizedLanguage, language.toLowerCase(), "text"]),
    );

    const renderHighlightedCode = async () => {
      for (const lang of languageCandidates) {
        try {
          const result = await codeToHtml(code, {
            lang,
            theme: "everforest-light",
          });
          if (!cancelled) setHtml(result);
          return;
        } catch {
          // Try next language candidate.
        }
      }
      if (!cancelled) setHtml("");
    };

    void renderHighlightedCode();

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="relative group my-5 rounded-lg overflow-hidden border border-paper-300/80 bg-paper-200">
      <button
        onClick={handleCopy}
        className="absolute right-2.5 top-2.5 p-1.5 rounded bg-paper-300paper-300/60 text-ink-mutedink-muted opacity-0 group-hover:opacity-100 transition-all hover:bg-paper-400paper-400 hover:text-inkink z-10 cursor-pointer"
        title="Copy code"
        aria-label="Copy code to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>

      {html ? (
        <div
          ref={containerRef}
          className="shiki-wrapper overflow-x-auto text-[13.5px] font-mono leading-relaxed [&>pre]:p-4 [&>pre]:bg-paper-200paper-200! [&>pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="bg-paper-200paper-paper-300200 p-4 text-[13.5px] text-inkink font-mono overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
