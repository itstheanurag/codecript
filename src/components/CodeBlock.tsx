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
      <pre className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-400 font-mono overflow-x-auto mb-4">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="shiki-wrapper mb-4 rounded-lg overflow-x-auto border border-neutral-800 text-sm [&>pre]:p-4 [&>pre]:bg-neutral-900! [&>pre]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default CodeBlock;
