import { useMemo, useState } from "react";
import { useInvoices } from "../lib/useInvoices";
import { formatSEK, formatDate, isOverdue } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import type { Invoice, InvoiceStatus } from "../types/database";

const FILTERS: { value: InvoiceStatus | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "draft", label: "Utkast" },
  { value: "sent", label: "Skickade" },
  { value: "overdue", label: "Förfallna" },
  { value: "paid", label: "Betalda" },
];

export function InvoiceListPage({
  companyId,
  onCreateInvoice,
  onOpenInvoice,
}: {
  companyId: string;
  onCreateInvoice: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
}) {
  const { invoices, loading, error, refetch } = useInvoices(companyId);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | "all">("all");

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "overdue"
            ? isOverdue(invoice.due_date, invoice.status)
            : invoice.status === activeFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        invoice.invoice_number.toLowerCase().includes(q) ||
        (invoice.customer?.name ?? "").toLowerCase().includes(q);

      return matchesFilter && matchesQuery;
    });
  }, [invoices, activeFilter, query]);

  const outstanding = useMemo(
    () =>
      invoices
        .filter((i) => i.status === "sent" || isOverdue(i.due_date, i.status))
        .reduce((sum, i) => sum + i.total, 0),
    [invoices]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Fakturor</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {invoices.length > 0
              ? `${formatSEK(outstanding)} utestående just nu`
              : "Hantera och skicka fakturor till dina kunder"}
          </p>
        </div>
        <Button variant="primary" onClick={onCreateInvoice}>
          Ny faktura
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filtrera fakturor"
          className="flex gap-1 overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-surface)] p-1"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              role="tab"
              aria-selected={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.value
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="relative w-full sm:w-64">
          <span className="sr-only">Sök faktura eller kund</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök fakturanr eller kund…"
            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />
        </label>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Hämtar fakturor…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          invoices.length === 0 ? (
            <EmptyState
              title="Inga fakturor än"
              description="Skapa din första faktura för att komma igång. Fakturanummer och OCR genereras automatiskt."
              actionLabel="Skapa faktura"
              onAction={onCreateInvoice}
            />
          ) : (
            <EmptyState
              title="Inga fakturor matchar"
              description="Justera sökningen eller filtret för att se fler resultat."
            />
          )
        ) : (
          <InvoiceTable invoices={filtered} onOpenInvoice={onOpenInvoice} />
        )}
      </div>
    </div>
  );
}

function InvoiceTable({
  invoices,
  onOpenInvoice,
}: {
  invoices: Invoice[];
  onOpenInvoice: (invoice: Invoice) => void;
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
              <th scope="col" className="px-4 py-3 font-medium">
                Fakturanr
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Kund
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Fakturadatum
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Förfaller
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Belopp
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const overdue = isOverdue(invoice.due_date, invoice.status);
              return (
                <tr
                  key={invoice.id}
                  tabIndex={0}
                  onClick={() => onOpenInvoice(invoice)}
                  onKeyDown={(e) => e.key === "Enter" && onOpenInvoice(invoice)}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] focus-visible:bg-[var(--color-surface)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {invoice.customer?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {formatDate(invoice.invoice_date)}
                  </td>
                  <td
                    className={`px-4 py-3 ${overdue ? "text-[var(--color-danger)]" : "text-[var(--color-text-secondary)]"}`}
                  >
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                    {formatSEK(invoice.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={overdue ? "overdue" : invoice.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {invoices.map((invoice) => {
          const overdue = isOverdue(invoice.due_date, invoice.status);
          return (
            <li key={invoice.id}>
              <button
                onClick={() => onOpenInvoice(invoice)}
                className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {invoice.invoice_number}
                  </span>
                  <StatusBadge status={overdue ? "overdue" : invoice.status} />
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {invoice.customer?.name ?? "—"}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span
                    className={overdue ? "text-[var(--color-danger)]" : "text-[var(--color-text-secondary)]"}
                  >
                    Förfaller {formatDate(invoice.due_date)}
                  </span>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {formatSEK(invoice.total)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
