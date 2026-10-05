import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { slugify } from "../lib/slugify";
import CodeBlock from "./CodeBlock";
import CodeTabs from "./CodeTabs";
import Mermaid from "./Mermaid";
import {
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  Octagon,
} from "lucide-react";

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

const ALERT_CONFIG = {
  NOTE: {
    icon: Info,
    bg: "bg-blue-50/40",
    border: "border-l-2 border-blue-600",
    text: "text-blue-700",
    label: "Note",
  },
  TIP: {
    icon: Lightbulb,
    bg: "bg-emerald-50/40",
    border: "border-l-2 border-emerald-600",
    text: "text-emerald-700",
    label: "Tip",
  },
  IMPORTANT: {
    icon: AlertCircle,
    bg: "bg-purple-50/40",
    border: "border-l-2 border-purple-600",
    text: "text-purple-700",
    label: "Important",
  },
  WARNING: {
    icon: AlertTriangle,
    bg: "bg-amber-50/40",
    border: "border-l-2 border-amber-600",
    text: "text-amber-800",
    label: "Warning",
  },
  CAUTION: {
    icon: Octagon,
    bg: "bg-red-50/40",
    border: "border-l-2 border-red-600",
    text: "text-red-700",
    label: "Caution",
  },
};

const processAlertContent = (
  children: React.ReactNode,
): { content: React.ReactNode; type: keyof typeof ALERT_CONFIG | null } => {
  let foundType: keyof typeof ALERT_CONFIG | null = null;

  const walk = (node: React.ReactNode): React.ReactNode => {
    if (foundType) return node;

    if (typeof node === "string") {
      const match = node.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
      if (match) {
        foundType = match[1].toUpperCase() as keyof typeof ALERT_CONFIG;
        return node.replace(
          /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
          "",
        );
      }
    }

    if (
      React.isValidElement(node) &&
      (node.props as { children?: React.ReactNode }).children
    ) {
      const newChildren = walk(
        (node.props as { children?: React.ReactNode }).children,
      );
      if (foundType) {
        return React.cloneElement(
          node as React.ReactElement<{ children?: React.ReactNode }>,
          { children: newChildren },
        );
      }
    }

    if (Array.isArray(node)) {
      const newNodes = [...node];
      for (let i = 0; i < newNodes.length; i++) {
        const result = walk(newNodes[i]);
        if (foundType) {
          newNodes[i] = result;
          return newNodes;
        }
      }
    }

    return node;
  };

  const content = walk(children);
  return { content, type: foundType };
};

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  // Pre-process content to group adjacent code blocks
  const processedContent = React.useMemo(() => {
    const lines = content.split("\n");
    const newLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith("```")) {
        const group: { language: string; code: string; label: string }[] = [];
        let j = i;

        while (j < lines.length) {
          if (lines[j].trim().startsWith("```")) {
            const lang = lines[j].trim().slice(3);
            let code = "";
            j++;
            while (j < lines.length && !lines[j].trim().startsWith("```")) {
              code += lines[j] + "\n";
              j++;
            }
            group.push({
              language: lang,
              code: code.trim(),
              label: lang || "Code",
            });
            j++; // skip closing ```

            // Peek ahead: is the next non-empty line another code block?
            let tempJ = j;
            while (tempJ < lines.length && lines[tempJ].trim() === "") tempJ++;
            if (tempJ < lines.length && lines[tempJ].trim().startsWith("```")) {
              j = tempJ;
              continue;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        if (group.length > 1) {
          // Wrap the group in a single block that we can intercept
          newLines.push("```code-tabs");
          newLines.push(JSON.stringify(group));
          newLines.push("```");
          i = j;
          continue;
        }
      }
      newLines.push(line);
      i++;
    }
    return newLines.join("\n");
  }, [content]);

  return (
    <div className="reading-content text-ink-secondary font-serif">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1
              id={slugify(getTextContent(children))}
              className="text-2xl sm:text-3xl font-bold font-sans text-ink mt-10 mb-4 tracking-tight leading-snug"
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={slugify(getTextContent(children))}
              className="text-xl sm:text-2xl font-bold font-sans text-ink mt-11 mb-3.5 tracking-tight leading-snug"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugify(getTextContent(children))}
              className="text-lg sm:text-xl font-semibold font-sans text-ink mt-8 mb-2.5 tracking-tight leading-snug"
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              id={slugify(getTextContent(children))}
              className="text-base font-semibold font-sans text-ink mt-6 mb-2 tracking-tight"
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-ink-secondary leading-[1.78] mb-5 text-[17px] font-serif">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc ml-6 mb-5 space-y-2 font-serif text-[17px] leading-[1.75] text-ink-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 mb-5 space-y-2 font-serif text-[17px] leading-[1.75] text-ink-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-ink-secondary leading-[1.75] pl-1 font-serif">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="text-ink font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => {
            const isTabs = className?.includes("language-code-tabs");
            if (isTabs) {
              try {
                const tabs = JSON.parse(String(children));
                return <CodeTabs tabs={tabs} />;
              } catch (err) {
                console.error("Failed to parse code-tabs", err);
                return null;
              }
            }

            const match = className?.match(/language-(\w+)/);
            if (match) {
              const lang = match[1].toLowerCase();
              const code = String(children).replace(/\n$/, "");

              if (lang === "mermaid") {
                return <Mermaid chart={code} />;
              }

              return <CodeBlock code={code} language={lang} />;
            }
            return (
              <code className="bg-paper-200 text-accent font-mono text-[0.875em] px-1.5 py-0.5 rounded-sm font-medium">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-paper-300">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left text-ink font-semibold py-2.5 px-3 font-sans text-xs uppercase tracking-wider">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-paper-300/50">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-paper-300/40 last:border-b-0">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="text-ink-secondary py-2.5 px-3 font-serif text-[15px] leading-normal">
              {children}
            </td>
          ),
          a: ({ children, href }) => {
            const isExternal =
              href?.startsWith("http") || href?.startsWith("mailto:");
            if (isExternal) {
              return (
                <a
                  href={href}
                  className="text-accent hover:underline hover:text-ink transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            }
            const toPath = href ? href.replace(/\.md(#.*)?$/, "$1") : "";
            return (
              <Link
                to={toPath}
                className="text-accent hover:underline hover:text-ink transition-colors font-medium"
              >
                {children}
              </Link>
            );
          },
          blockquote: ({ children }) => {
            const { content, type } = processAlertContent(children);

            if (type) {
              const config = ALERT_CONFIG[type];
              const Icon = config.icon;
              return (
                <div
                  className={`my-5 py-2.5 px-3.5 rounded-r-md ${config.border} ${config.bg}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 font-sans text-[11px] font-bold uppercase tracking-wider">
                    <Icon size={14} className={config.text} />
                    <span className={config.text}>{config.label}</span>
                  </div>
                  <div className="text-ink-secondary leading-relaxed font-serif text-[15px]">
                    {content}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="border-l-2 border-paper-400 pl-4 py-0.5 my-5 font-serif italic text-ink-muted text-[16.5px] leading-relaxed">
                {children}
              </blockquote>
            );
          },
          hr: () => <hr className="border-t border-paper-300 my-8" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg max-w-full h-auto my-6 shadow-2xs"
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
