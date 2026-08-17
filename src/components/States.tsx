import type { ReactNode } from "react";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingState({ label = "Laddar…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-text-secondary)]">
      <span
        className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)] px-6 py-10 text-center"
    >
      <p className="text-sm text-[var(--color-danger)]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Försök igen
        </Button>
      )}
    </div>
  );
}
