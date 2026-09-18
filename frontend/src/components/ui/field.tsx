import { cn } from "@/lib/cn";

export function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "mt-2 w-full border bg-transparent px-3 py-3 text-sm outline-none focus:border-bronze",
          error ? "border-danger" : "border-line",
        )}
      />
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </label>
  );
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </span>
      <textarea
        name={name}
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "mt-2 w-full border bg-transparent px-3 py-3 text-sm outline-none focus:border-bronze",
          error ? "border-danger" : "border-line",
        )}
      />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-bronze"
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
