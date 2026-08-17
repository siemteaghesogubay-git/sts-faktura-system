import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, htmlFor, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {required && <span className="text-[var(--color-danger)]"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "h-10 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] disabled:opacity-50";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, required, id, className = "", ...props }: TextFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint} required={required}>
      <input
        id={id}
        className={`${inputBase} ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)] focus:border-[var(--color-primary)]"} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...props}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function SelectField({
  label,
  error,
  hint,
  required,
  id,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint} required={required}>
      <select
        id={id}
        className={`${inputBase} ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)] focus:border-[var(--color-primary)]"} ${className}`}
        aria-invalid={!!error}
        required={required}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
