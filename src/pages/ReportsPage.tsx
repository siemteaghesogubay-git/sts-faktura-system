import { lazy, Suspense, useMemo } from "react";
import { useReportsData } from "../lib/useReportsData";
import { formatSEK } from "../lib/format";
import { LoadingState, ErrorState, EmptyState } from "../components/States";

const RevenueChart = lazy(() => import("../components/RevenueChart"));

const STATUS_LABELS: Record<string, string> = {
  draft: "Utkast",
  sent: "Skickade",
  overdue: "Förfallna",
  paid: "Betalda",
  credited: "Krediterade",
  cancelled: "Makulerade",
};

export function ReportsPage({ companyId }: { companyId: string }) {
  const { loading, error, refetch, revenueByMonth, statusBreakdown, topCustomers, avgPaymentDays, hasInvoices } =
    useReportsData(companyId);

  const totalRevenueThisYear = useMemo(
    () => revenueByMonth.reduce((sum, m) => sum + m.omsattning, 0),
    [revenueByMonth]
  );

  if (loading) return <LoadingState label="Beräknar rapporter…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-semibold text-[var(--color-text-primary)]">Rapporter</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Baserat på era {hasInvoices ? "faktiska" : "hittills inga"} fakturor.
      </p>

      {!hasInvoices ? (
        <div className="mt-6">
          <EmptyState
            title="Inget att rapportera än"
            description="Rapporterna fylls i automatiskt så snart ni har skapat era första fakturor."
          />
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">
                Omsättning per månad ({new Date().getFullYear()})
              </h2>
              <span className="font-heading text-lg font-semibold text-[var(--color-primary)]">
                {formatSEK(totalRevenueThisYear)}
              </span>
            </div>
            <div className="mt-4 h-64">
              <Suspense fallback={<LoadingState label="Ritar diagram…" />}>
                <RevenueChart data={revenueByMonth} />
              </Suspense>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Endast betalda fakturor räknas som omsättning.
            </p>
          </section>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">
                Fakturor per status
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {Object.entries(statusBreakdown)
                  .filter(([, v]) => v.count > 0)
                  .map(([status, v]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">{STATUS_LABELS[status] ?? status}</span>
                      <span className="text-[var(--color-text-primary)]">
                        {v.count} st · {formatSEK(v.sum)}
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">
                Genomsnittlig betaltid
              </h2>
              {avgPaymentDays === null ? (
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                  Inga betalda fakturor att räkna på än.
                </p>
              ) : (
                <>
                  <p className="mt-3 font-heading text-2xl font-semibold text-[var(--color-text-primary)]">
                    {avgPaymentDays} dagar
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Uppskattat — baseras på när fakturan senast redigerades, inte ett exakt betaldatum.
                  </p>
                </>
              )}
            </section>
          </div>

          <section className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="font-heading text-sm font-medium text-[var(--color-text-secondary)]">
              Största kunder (betalda fakturor)
            </h2>
            {topCustomers.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">Inga betalda fakturor att räkna på än.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {topCustomers.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-primary)]">{c.name}</span>
                    <span className="text-[var(--color-text-secondary)]">
                      {formatSEK(c.total)} · {c.count} {c.count === 1 ? "faktura" : "fakturor"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}