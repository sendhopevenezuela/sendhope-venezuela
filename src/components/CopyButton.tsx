"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  if (value === "—") return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copiar ${value}`}
      className={`font-mono text-[10px] tracking-wider px-2 py-0.5 rounded transition-all duration-200 ${
        copied
          ? "bg-verified text-white"
          : "bg-navy/8 text-navy/50 hover:bg-navy/15 hover:text-navy"
      }`}
    >
      {copied ? "✓" : "copiar"}
    </button>
  );
}
