import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface ListItem {
  text: string;
  subItems: string[];
}

type Block =
  | { type: "h1"; content: string }
  | { type: "h2"; content: string }
  | { type: "h3"; content: string }
  | { type: "h4"; content: string }
  | { type: "hr" }
  | { type: "code"; language: string; content: string }
  | { type: "blockquote"; content: string }
  | { type: "ol"; items: ListItem[] }
  | { type: "ul"; items: ListItem[] }
  | { type: "p"; content: string };

/**
 * Tokenize and render inline markdown (bold, italic, code, link)
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Regex to match:
  // 1. `code`
  // 2. **bold** or __bold__
  // 3. *italic* or _italic_
  // 4. [link text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token.length}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="bg-slate-100 text-brand-800 text-xs px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      nodes.push(
        <strong key={key} className="font-bold text-slate-900">
          {renderInline(token.slice(2, -2))}
        </strong>
      );
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(
        <em key={key} className="italic text-slate-800">
          {renderInline(token.slice(1, -1))}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkHref = linkMatch[2];
        nodes.push(
          <a
            key={key}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:text-brand-700 underline font-medium"
          >
            {linkText}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes;
}

/**
 * Parse markdown text into structured blocks
 */
function parseMarkdownToBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Skip completely blank lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Fenced code block
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n"),
      });
      continue;
    }

    // 3. Horizontal Rule
    if (/^(---|===|\*\*\*|___)\s*$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 4. Headings
    if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h4", content: trimmed.slice(5).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", content: trimmed.slice(4).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", content: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", content: trimmed.slice(2).trim() });
      i++;
      continue;
    }

    // 5. Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join(" ") });
      continue;
    }

    // 6. Ordered List (1. ...)
    const olMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)/);
    if (olMatch && olMatch[1].length < 3) {
      const items: ListItem[] = [];
      let currentItem: ListItem = { text: olMatch[3], subItems: [] };
      items.push(currentItem);
      i++;

      while (i < lines.length) {
        const nextRaw = lines[i];
        const nextTrimmed = nextRaw.trim();

        if (!nextTrimmed) {
          // Check if followed by continuation of the list or end of list
          const nextNextRaw = lines[i + 1];
          if (nextNextRaw && /^\s*(\d+\.|[-*])\s+/.test(nextNextRaw)) {
            i++;
            continue;
          } else {
            break;
          }
        }

        // Sub-bullet under current ordered item (e.g. "   - Subitem")
        const subMatch = nextRaw.match(/^\s{2,}[-*]\s+(.*)/);
        if (subMatch) {
          currentItem.subItems.push(subMatch[1]);
          i++;
          continue;
        }

        // Another top-level ordered item
        const nextOlMatch = nextRaw.match(/^(\s*)(\d+)\.\s+(.*)/);
        if (nextOlMatch && nextOlMatch[1].length < 3) {
          currentItem = { text: nextOlMatch[3], subItems: [] };
          items.push(currentItem);
          i++;
          continue;
        }

        break;
      }

      blocks.push({ type: "ol", items });
      continue;
    }

    // 7. Unordered List (- ... or * ...)
    const ulMatch = rawLine.match(/^(\s*)[-*]\s+(.*)/);
    if (ulMatch && ulMatch[1].length < 3) {
      const items: ListItem[] = [];
      let currentItem: ListItem = { text: ulMatch[2], subItems: [] };
      items.push(currentItem);
      i++;

      while (i < lines.length) {
        const nextRaw = lines[i];
        const nextTrimmed = nextRaw.trim();

        if (!nextTrimmed) {
          const nextNextRaw = lines[i + 1];
          if (nextNextRaw && /^\s*[-*]\s+/.test(nextNextRaw)) {
            i++;
            continue;
          } else {
            break;
          }
        }

        // Sub-bullet under current unordered item
        const subMatch = nextRaw.match(/^\s{2,}[-*]\s+(.*)/);
        if (subMatch) {
          currentItem.subItems.push(subMatch[1]);
          i++;
          continue;
        }

        // Another top-level unordered item
        const nextUlMatch = nextRaw.match(/^(\s*)[-*]\s+(.*)/);
        if (nextUlMatch && nextUlMatch[1].length < 3) {
          currentItem = { text: nextUlMatch[2], subItems: [] };
          items.push(currentItem);
          i++;
          continue;
        }

        break;
      }

      blocks.push({ type: "ul", items });
      continue;
    }

    // 8. Paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith("```") &&
      !/^(---|===|\*\*\*|___)\s*$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*(\d+\.|[-*])\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        type: "p",
        content: paragraphLines.join(" "),
      });
    }
  }

  return blocks;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  if (!content || !content.trim()) {
    return <p className="text-slate-400 italic text-xs">No content provided.</p>;
  }

  const blocks = parseMarkdownToBlocks(content);

  return (
    <div className={`prose-academic text-slate-800 break-words leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={idx}
                className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-5 mt-2 tracking-tight first:mt-0"
              >
                {renderInline(block.content)}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={idx}
                className="text-lg md:text-xl font-bold text-brand-950 mt-6 mb-3 tracking-tight flex items-center gap-2 border-l-4 border-brand-600 pl-3 py-0.5"
              >
                {renderInline(block.content)}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={idx}
                className="text-base font-bold text-slate-800 mt-5 mb-2 tracking-tight"
              >
                {renderInline(block.content)}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={idx}
                className="text-sm font-semibold text-slate-700 mt-4 mb-1 tracking-tight"
              >
                {renderInline(block.content)}
              </h4>
            );
          case "hr":
            return <hr key={idx} className="border-t border-slate-200 my-6" />;
          case "code":
            return (
              <pre
                key={idx}
                className="bg-slate-900 text-brand-400 p-4 rounded-xl text-xs font-mono overflow-x-auto my-4 shadow-sm border border-slate-800"
              >
                <code>{block.content}</code>
              </pre>
            );
          case "blockquote":
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-brand-500 bg-brand-50/50 pl-4 pr-3 py-2.5 my-4 text-sm text-slate-700 italic rounded-r-lg"
              >
                {renderInline(block.content)}
              </blockquote>
            );
          case "ol":
            return (
              <ol
                key={idx}
                className="list-decimal pl-6 space-y-2 mb-4 text-sm text-slate-700"
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    <span>{renderInline(item.text)}</span>
                    {item.subItems.length > 0 && (
                      <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs text-slate-600">
                        {item.subItems.map((sub, subIdx) => (
                          <li key={subIdx} className="leading-relaxed">
                            {renderInline(sub)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            );
          case "ul":
            return (
              <ul
                key={idx}
                className="list-disc pl-6 space-y-2 mb-4 text-sm text-slate-700"
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed">
                    <span>{renderInline(item.text)}</span>
                    {item.subItems.length > 0 && (
                      <ul className="list-circle pl-5 mt-1.5 space-y-1 text-xs text-slate-600">
                        {item.subItems.map((sub, subIdx) => (
                          <li key={subIdx} className="leading-relaxed">
                            {renderInline(sub)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            );
          case "p":
            return (
              <p key={idx} className="text-sm leading-relaxed text-slate-700 mb-3.5">
                {renderInline(block.content)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
