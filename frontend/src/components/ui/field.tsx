import { cn } from "@/lib/cn";

export function Field({
  label,
  name = "",
  id,
  type = "text",
  value,
  onChange,
  disabled = false,
  error,
  placeholder,
  required,
  hint,
  className,
}: {
  label: string;
  name?: string;
  id?: string;
  type?: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
        {label}
        {required ? <span className="text-[var(--error)] ml-0.5">*</span> : null}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className={cn(
          "w-full rounded-xl border bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-faint)] transition-all outline-none focus:border-[var(--primary-pista)] focus:ring-2 focus:ring-[var(--primary-pista-subtle)]",
          disabled && "opacity-60 cursor-not-allowed bg-[var(--bg-surface-elevated)]/40",
          error
            ? "border-[var(--error)]/60 focus:ring-[var(--error)]/20"
            : "border-[var(--border)]",
        )}
      />
      {hint ? <p className="mt-1.5 text-xs text-[var(--text-faint)]">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-[var(--error)] font-medium">{error}</p> : null}
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
        <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
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
          "w-full rounded-xl border bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-faint)] transition-all outline-none focus:border-[var(--primary-pista)] focus:ring-2 focus:ring-[var(--primary-pista-subtle)]",
          error
            ? "border-[var(--error)]/60 focus:ring-[var(--error)]/20"
            : "border-[var(--border)]",
        )}
      />
      {error ? <p className="mt-1.5 text-xs text-[var(--error)] font-medium">{error}</p> : null}
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
      <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-main)] transition-all outline-none focus:border-[var(--primary-pista)] focus:ring-2 focus:ring-[var(--primary-pista-subtle)] cursor-pointer"
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
