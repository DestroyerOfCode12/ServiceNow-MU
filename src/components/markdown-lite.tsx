import { Fragment } from "react";

/**
 * Minimal, dependency-free renderer for the small markdown subset used in
 * seeded study content: paragraphs, "- " bullet lists, and **bold** spans.
 * Deliberately not a full markdown engine and never uses dangerouslySetInnerHTML.
 */
export function MarkdownLite({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const lines = text.split("\n").map((l) => l.trim());

  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("- ")) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.lines.push(line.slice(2));
      else blocks.push({ type: "ul", lines: [line.slice(2)] });
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground-muted">
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.lines.map((l, j) => (
              <li key={j}>{renderInline(l)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(b.lines[0])}</p>
        ),
      )}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <Fragment key={i}>
          <strong className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
        </Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
