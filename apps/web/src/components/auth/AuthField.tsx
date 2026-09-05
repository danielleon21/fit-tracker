import type { InputHTMLAttributes } from "react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function AuthField({ label, hint, id, ...inputProps }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-label">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-xl border border-border-2 bg-surface-2 px-3.5 py-3 text-[15px] text-ink placeholder:text-placeholder focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent"
        {...inputProps}
      />
      {hint ? <span className="text-xs text-placeholder">{hint}</span> : null}
    </div>
  );
}
