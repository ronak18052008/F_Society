"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

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
        className="group relative w-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 text-left transition-all hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 active:scale-[0.99] cursor-pointer"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {label}
            </p>
            {previewUrl ? (
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" />
                <div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{name || "Uploaded file"}</span>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">File attached & ready</p>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {uploading ? "Processing upload..." : name ?? "Click to browse or drop file here"}
              </p>
            )}
            {hint ? <p className="mt-1.5 text-xs text-slate-400">{hint}</p> : null}
          </div>
        </div>
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
