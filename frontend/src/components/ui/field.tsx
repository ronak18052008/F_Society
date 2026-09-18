import { cn } from "@/lib/cn";

export function Field({
  label,
  name,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  hint,
  className,
}: {
  label: string;
  name: string;
  id?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
        {required ? <span className="text-rose-500 ml-0.5">*</span> : null}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-xl border bg-white dark:bg-slate-900/90 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          error
            ? "border-rose-400 dark:border-rose-600 focus:ring-rose-500/20"
            : "border-slate-200 dark:border-slate-800",
        )}
      />
      {hint ? <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-rose-600 dark:rose-400 font-medium">{error}</p> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  id,
  value,
  onChange,
  error,
  placeholder,
  rows = 4,
  className,
}: {
  label: string;
  name: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </span>
      ) : null}
      <textarea
        id={id}
        name={name}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-xl border bg-white dark:bg-slate-900/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          error
            ? "border-rose-400 dark:border-rose-600 focus:ring-rose-500/20"
            : "border-slate-200 dark:border-slate-800",
        )}
      />
      {error ? <p className="mt-1.5 text-xs text-rose-600 dark:rose-400 font-medium">{error}</p> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
