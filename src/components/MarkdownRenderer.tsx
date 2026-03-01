import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-8 mb-5">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mt-10 mb-4">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-bold text-white mt-8 mb-3">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-zinc-300 leading-relaxed mb-4 text-[17px]">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-zinc-300 leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="text-white font-semibold">{children}</strong>
        ),
        code: ({ children, className }) => {
          const match = className?.match(/language-(\w+)/);
          if (match) {
            const code = String(children).replace(/\n$/, "");
            return <CodeBlock code={code} language={match[1]} />;
          }
          return (
            <code className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <>{children}</>,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-white/20">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left text-white font-semibold py-2 px-3">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="text-zinc-300 py-2 px-3 border-b border-white/5">
            {children}
          </td>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-white/20 pl-4 italic text-zinc-400 mb-4">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-white/10 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
