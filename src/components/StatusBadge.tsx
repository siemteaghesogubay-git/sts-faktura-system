import type { InvoiceStatus, ContractStatus } from "../types/database";

const statusConfig: Record<InvoiceStatus, { label: string; bg: string; text: string }> = {
  draft: { label: "Utkast", bg: "var(--color-surface-elevated)", text: "var(--color-text-secondary)" },
  sent: { label: "Skickad", bg: "var(--color-info-muted)", text: "var(--color-info)" },
  paid: { label: "Betald", bg: "var(--color-success-muted)", text: "var(--color-success)" },
  overdue: { label: "Förfallen", bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  credited: { label: "Krediterad", bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  cancelled: { label: "Makulerad", bg: "var(--color-surface-elevated)", text: "var(--color-text-muted)" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

const contractStatusConfig: Record<ContractStatus, { label: string; bg: string; text: string }> = {
  draft: { label: "Utkast", bg: "var(--color-surface-elevated)", text: "var(--color-text-secondary)" },
  sent: { label: "Skickat", bg: "var(--color-info-muted)", text: "var(--color-info)" },
  signed: { label: "Signerat", bg: "var(--color-success-muted)", text: "var(--color-success)" },
  terminated: { label: "Avslutat", bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = contractStatusConfig[status];
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
