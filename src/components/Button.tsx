import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[#1a1508] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-primary-muted)] disabled:text-[var(--color-text-muted)]",
  secondary:
    "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-border)] disabled:opacity-50",
  outline:
    "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:border-[var(--color-primary)] disabled:opacity-50",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] disabled:opacity-50",
  danger:
    "bg-transparent text-[var(--color-danger)] border border-[var(--color-danger)]/40 hover:bg-[var(--color-danger-muted)] disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors duration-150 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
