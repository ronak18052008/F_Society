"use client";

import { useRef, useState } from "react";

export function UploadField({
  label,
  accept,
  onSelect,
  hint,
  uploading,
  previewUrl,
}: {
  label: string;
  accept?: string;
  onSelect: (file: File) => void;
  hint?: string;
  uploading?: boolean;
  previewUrl?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        className="w-full border border-dashed border-line px-4 py-8 text-left transition-colors hover:border-bronze"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          {label}
        </p>
        {previewUrl ? (
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover border border-line" />
            <span className="text-xs text-ink-soft">{name || "Uploaded file"}</span>
          </div>
        ) : (
          <p className="mt-2 text-sm">
            {uploading ? "Uploading..." : name ?? "Choose a file from this device"}
          </p>
        )}
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
