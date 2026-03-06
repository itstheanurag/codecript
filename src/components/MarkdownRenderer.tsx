import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugify } from "../lib/slugify";
import CodeBlock from "./CodeBlock";
import CodeTabs from "./CodeTabs";
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
    bg: "bg-blue-900/10",
    border: "border-blue-800/50",
    text: "text-blue-400",
    label: "Note",
  },
  TIP: {
    icon: Lightbulb,
    bg: "bg-emerald-900/10",
    border: "border-emerald-800/50",
    text: "text-emerald-400",
    label: "Tip",
  },
  IMPORTANT: {
    icon: AlertCircle,
    bg: "bg-purple-900/10",
    border: "border-purple-800/50",
    text: "text-purple-400",
    label: "Important",
  },
  WARNING: {
    icon: AlertTriangle,
    bg: "bg-amber-900/10",
    border: "border-amber-800/50",
    text: "text-amber-400",
    label: "Warning",
  },
  CAUTION: {
    icon: Octagon,
    bg: "bg-red-900/10",
    border: "border-red-800/50",
    text: "text-red-400",
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
        blockquote: ({ children }) => {
          const { content, type } = processAlertContent(children);

          if (type) {
            const config = ALERT_CONFIG[type];
            const Icon = config.icon;
            return (
              <div
                className={`p-4 rounded-lg border-l-4 mb-6 ${config.bg} ${config.border} shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-2 font-bold tracking-tight">
                  <Icon size={18} className={config.text} />
                  <span className={`text-sm uppercase ${config.text}`}>
                    {config.label}
                  </span>
                </div>
                <div className="text-neutral-400 leading-relaxed italic">
                  {content}
                </div>
              </div>
            );
          }

          return (
            <blockquote className="border-l-2 border-neutral-800 pl-4 italic text-neutral-500 mb-4">
              {children}
            </blockquote>
          );
        },
        hr: () => <hr className="border-neutral-900 my-8" />,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
