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
            theme: "vitesse-dark",
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

  const CopyIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
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
      width="14"
      height="14"
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

  return (
    <div className="relative group mb-4">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 p-2 rounded-md bg-neutral-800/50 text-neutral-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-800 hover:text-neutral-200 z-10 border border-neutral-700/50"
        title="Copy code"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>

      {html ? (
        <div
          ref={containerRef}
          className="shiki-wrapper rounded-lg overflow-x-auto border border-neutral-800 text-sm [&>pre]:p-4 [&>pre]:bg-neutral-900! [&>pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-400 font-mono overflow-x-auto">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
