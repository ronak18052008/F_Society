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
      <span className="block text-xs font-semibold uppercase tracking-wider text-[#3e5244] dark:text-[#a5b8aa] mb-1.5">
        {label}
        {required ? <span className="text-[#c24b4b] ml-0.5">*</span> : null}
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
          "w-full rounded-xl border bg-[#fdfcf9] dark:bg-[#152219] px-4 py-2.5 text-sm text-[#1a281f] dark:text-[#f5f9f6] placeholder:text-[#8fa89b] transition-all outline-none focus:border-[#6e9271] focus:ring-2 focus:ring-[#6e9271]/20",
          disabled && "opacity-60 cursor-not-allowed bg-[#f3efe6]/40 dark:bg-[#1d2d22]/40",
          error
            ? "border-[#e08b8b] dark:border-[#963737] focus:ring-[#c24b4b]/20"
            : "border-[#e3dfd5] dark:border-[#2a3f31]",
        )}
      />
      {hint ? <p className="mt-1.5 text-xs text-[#5e7565] dark:text-[#8ea393]">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-[#c24b4b] font-medium">{error}</p> : null}
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
        <span className="block text-xs font-semibold uppercase tracking-wider text-[#3e5244] dark:text-[#a5b8aa] mb-1.5">
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
          "w-full rounded-xl border bg-[#fdfcf9] dark:bg-[#152219] px-4 py-3 text-sm text-[#1a281f] dark:text-[#f5f9f6] placeholder:text-[#8fa89b] transition-all outline-none focus:border-[#6e9271] focus:ring-2 focus:ring-[#6e9271]/20",
          error
            ? "border-[#e08b8b] dark:border-[#963737] focus:ring-[#c24b4b]/20"
            : "border-[#e3dfd5] dark:border-[#2a3f31]",
        )}
      />
      {error ? <p className="mt-1.5 text-xs text-[#c24b4b] font-medium">{error}</p> : null}
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
      <span className="block text-xs font-semibold uppercase tracking-wider text-[#3e5244] dark:text-[#a5b8aa] mb-1.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#e3dfd5] dark:border-[#2a3f31] bg-[#fdfcf9] dark:bg-[#152219] px-4 py-2.5 text-sm text-[#1a281f] dark:text-[#f5f9f6] transition-all outline-none focus:border-[#6e9271] focus:ring-2 focus:ring-[#6e9271]/20 cursor-pointer"
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
