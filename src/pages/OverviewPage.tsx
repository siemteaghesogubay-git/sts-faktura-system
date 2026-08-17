import { useMemo } from "react";
import { FileText, Building2, Users, CalendarDays, PlusCircle, UserPlus, FileSignature, BarChart3 } from "lucide-react";
import { useInvoices } from "../lib/useInvoices";
import { useDashboardStats } from "../lib/useDashboardStats";
import { formatSEK, formatDate, isOverdue } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState, ErrorState } from "../components/States";
import { Button } from "../components/Button";
import type { Invoice } from "../types/database";
import type { NavSection } from "../components/sidebar";

export function OverviewPage({
  companyId,
  companyName,
  showContractsAction,
  onCreateInvoice,
  onOpenInvoice,
  onNavigate,
}: {
  companyId: string;
  companyName: string;
  showContractsAction: boolean;
  onCreateInvoice: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onNavigate: (section: NavSection) => void;
}) {
  const { invoices, loading, error, refetch } = useInvoices(companyId);
  const { stats, loading: statsLoading } = useDashboardStats(companyId);

  const recentInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
        .slice(0, 5),
    [invoices]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-[var(--color-text-primary)]">
          Välkommen tillbaka, <span className="text-[var(--color-primary)]">{companyName}!</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Här får du en snabb översikt av ditt företags fakturering och verksamhet.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<FileText size={18} />}
          iconBg="var(--color-success-muted)"
          iconColor="var(--color-success)"
          label="Fakturor skapade"
          value={statsLoading ? "…" : String(stats?.totalInvoices ?? 0)}
          hint="Totalt antal fakturor"
        />
        <StatCard
          icon={<Building2 size={18} />}
          iconBg="var(--color-warning-muted)"
          iconColor="var(--color-warning)"
          label="Företag"
          value="1"
          hint="Ditt aktiva företag"
        />
        <StatCard
          icon={<Users size={18} />}
          iconBg="var(--color-info-muted)"
          iconColor="var(--color-info)"
          label="Kunder"
          value={statsLoading ? "…" : String(stats?.totalCustomers ?? 0)}
          hint="Totalt antal kunder"
        />
        <StatCard
          icon={<CalendarDays size={18} />}
          iconBg="var(--color-primary-muted)"
          iconColor="var(--color-primary)"
          label="Fakturor denna månad"
          value={statsLoading ? "…" : String(stats?.invoicesThisMonth ?? 0)}
          hint="Skapade fakturor"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">
              Senaste fakturor
            </h2>
            <Button variant="primary" size="sm" onClick={onCreateInvoice} icon={<PlusCircle size={16} />}>
              Skapa ny faktura
            </Button>
          </div>

          {loading ? (
            <LoadingState label="Hämtar fakturor…" />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : recentInvoices.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">Inga fakturor skapade än.</p>
          ) : (
            <>
              <div className="mt-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                      <th className="px-4 py-3 font-medium">Fakturanr</th>
                      <th className="px-4 py-3 font-medium">Kund</th>
                      <th className="px-4 py-3 font-medium">Datum</th>
                      <th className="px-4 py-3 text-right font-medium">Belopp</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        tabIndex={0}
                        onClick={() => onOpenInvoice(invoice)}
                        onKeyDown={(e) => e.key === "Enter" && onOpenInvoice(invoice)}
                        className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)]"
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
                        <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                          {formatSEK(invoice.total)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={isOverdue(invoice.due_date, invoice.status) ? "overdue" : invoice.status}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => onNavigate("invoices")}
                className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
              >
                Visa alla fakturor →
              </button>
            </>
          )}
        </div>

        {/* Snabbåtgärder */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">Snabbåtgärder</h2>
          <div className="mt-3 flex flex-col gap-1">
            <QuickAction
              icon={<PlusCircle size={16} />}
              iconBg="var(--color-success-muted)"
              iconColor="var(--color-success)"
              label="Skapa ny faktura"
              hint="Skapa och skicka en ny faktura"
              onClick={onCreateInvoice}
            />
            <QuickAction
              icon={<UserPlus size={16} />}
              iconBg="var(--color-info-muted)"
              iconColor="var(--color-info)"
              label="Ny kund"
              hint="Lägg till en ny kund"
              onClick={() => onNavigate("customers")}
            />
            {showContractsAction && (
              <QuickAction
                icon={<FileSignature size={16} />}
                iconBg="var(--color-warning-muted)"
                iconColor="var(--color-warning)"
                label="Nytt avtal"
                hint="Skapa ett nytt avtal"
                onClick={() => onNavigate("contracts")}
              />
            )}
            <QuickAction
              icon={<BarChart3 size={16} />}
              iconBg="var(--color-primary-muted)"
              iconColor="var(--color-primary)"
              label="Visa rapporter"
              hint="Se och analysera rapporter"
              onClick={() => onNavigate("reports")}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
        OBS: I STS Faktura kan du skapa och hantera fakturor. Betalningar hanteras utanför systemet.
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <p className="mt-2.5 font-heading text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

function QuickAction({
  icon,
  iconBg,
  iconColor,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left hover:bg-[var(--color-surface-elevated)]"
    >
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-sm)]"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        <span className="block truncate text-xs text-[var(--color-text-muted)]">{hint}</span>
      </span>
    </button>
  );
}