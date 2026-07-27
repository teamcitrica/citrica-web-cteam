"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownMessageProps {
  content: string;
  // Para burbujas con fondo oscuro (texto blanco)
  inverted?: boolean;
}

const MarkdownMessage = ({ content, inverted = false }: MarkdownMessageProps) => {
  const baseText = inverted ? "text-white" : "text-gray-800";
  const linkColor = inverted ? "text-white underline" : "text-[#265197] underline";

  return (
    <div className={`text-sm leading-relaxed break-words ${baseText}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mt-3 mb-1.5 first:mt-0">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-bold mt-2 mb-1 first:mt-0">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h5>,
          h6: ({ children }) => <h6 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h6>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className={linkColor}>
              {children}
            </a>
          ),
          code: ({ children, className }) => {
            // Con className (language-*) viene de un bloque ```; sin él es inline
            const isBlock = /language-/.test(className || "");
            if (isBlock) {
              return <code className={className}>{children}</code>;
            }
            return (
              <code className="bg-black/10 rounded px-1 py-0.5 font-mono text-[13px]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 text-xs font-mono overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-3 italic mb-2">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 font-semibold bg-black/5 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1 align-top">{children}</td>
          ),
          hr: () => <hr className="my-3 border-gray-300" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
