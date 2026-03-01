import { useEffect, useState, useRef } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [html, setHtml] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    codeToHtml(code, {
      lang: language || "text",
      theme: "vitesse-dark",
    })
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml("");
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre className="bg-zinc-900 border border-white/10 rounded-lg p-4 text-sm text-zinc-300 font-mono overflow-x-auto mb-4">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="shiki-wrapper mb-4 rounded-lg overflow-x-auto border border-white/10 text-sm [&>pre]:p-4 [&>pre]:bg-zinc-900! [&>pre]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default CodeBlock;
