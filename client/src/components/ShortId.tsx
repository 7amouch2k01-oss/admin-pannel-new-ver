import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Entity IDs are 36-character UUIDs. Rendered in full they blow out table
 * columns, wrap modal titles onto three lines and turn a toast into a
 * paragraph — so only the first segment is shown, with the full value a click
 * away.
 *
 * Search still matches the full UUID, and because the short form is a prefix a
 * copied short id matches too.
 */
export const shortId = (id: string | number | null | undefined): string => {
  if (id === null || id === undefined) return "";
  const s = String(id);
  return s.length > 12 ? s.slice(0, 8) : s;
};

export function ShortId({
  id,
  prefix = "#",
  className = "",
  copyable = true,
}: {
  id: string | number | null | undefined;
  prefix?: string;
  className?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (id === null || id === undefined || id === "") return null;

  const full = String(id);
  const label = `${prefix}${shortId(full)}`;

  if (!copyable || full.length <= 12) {
    return <span className={`font-mono ${className}`}>{label}</span>;
  }

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — the title attribute still shows the full id */
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono whitespace-nowrap ${className}`}
      title={full}
    >
      {label}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy full ID ${full}`}
        className="opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none"
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </span>
  );
}
