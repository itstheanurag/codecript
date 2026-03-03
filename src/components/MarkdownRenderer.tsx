import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import { slugify } from "../lib/slugify";

interface MarkdownRendererProps {
  content: string;
}

const getTextContent = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join("");
  if (
    children !== null &&
    children !== undefined &&
    typeof children === "object"
  ) {
    const childObj = children as unknown as {
      props?: { children?: React.ReactNode };
    };
    if (childObj.props?.children !== undefined) {
      return getTextContent(childObj.props.children);
    }
  }
  return "";
};

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1
            id={slugify(getTextContent(children))}
            className="text-3xl md:text-4xl font-semibold text-neutral-300 mt-8 mb-5"
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            id={slugify(getTextContent(children))}
            className="text-2xl font-semibold text-neutral-300 mt-10 mb-4"
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3
            id={slugify(getTextContent(children))}
            className="text-lg font-semibold text-neutral-300 mt-8 mb-3"
          >
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-neutral-400 leading-relaxed mb-4 text-base">
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
          <li className="text-neutral-400 leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="text-neutral-400 font-semibold">{children}</strong>
        ),
        code: ({ children, className }) => {
          const match = className?.match(/language-(\w+)/);
          if (match) {
            const code = String(children).replace(/\n$/, "");
            return <CodeBlock code={code} language={match[1]} />;
          }
          return (
            <code className="bg-neutral-900 text-neutral-200 px-1.5 py-0.5 rounded text-sm font-mono border border-neutral-800">
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
          <thead className="border-b border-neutral-800">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="text-left text-neutral-400 font-semibold py-2 px-3">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="text-neutral-400 py-2 px-3 border-b border-neutral-900">
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
          <blockquote className="border-l-2 border-neutral-800 pl-4 italic text-neutral-500 mb-4">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-neutral-900 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
