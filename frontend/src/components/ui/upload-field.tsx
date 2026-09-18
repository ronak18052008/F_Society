"use client";

import { useRef, useState } from "react";

export function UploadField({
  label,
  accept,
  onSelect,
  hint,
}: {
  label: string;
  accept?: string;
  onSelect: (file: File) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className="w-full border border-dashed border-line px-4 py-8 text-left hover:border-bronze"
        onClick={() => inputRef.current?.click()}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          {label}
        </p>
        <p className="mt-2 text-sm">{name ?? "Choose a file from this device"}</p>
        {hint ? <p className="mt-2 text-xs text-ink-soft">{hint}</p> : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setName(file.name);
          onSelect(file);
        }}
      />
    </div>
  );
}
