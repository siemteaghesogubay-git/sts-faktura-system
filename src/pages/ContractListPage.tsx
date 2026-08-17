import { useMemo, useState } from "react";
import { useContracts } from "../lib/useContracts";
import { formatSEK, formatDate } from "../lib/format";
import { ContractStatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { supabase } from "../lib/supabase";
import type { Contract, ContractStatus } from "../types/database";

const FILTERS: { value: ContractStatus | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "draft", label: "Utkast" },
  { value: "sent", label: "Skickade" },
  { value: "signed", label: "Signerade" },
  { value: "terminated", label: "Avslutade" },
];

const FEE_TYPE_LABELS: Record<string, string> = {
  fixed: "Fast pris",
  hourly: "Löpande räkning",
  monthly: "Månadsvis",
};

export function ContractListPage({
  onCreate,
  onEdit,
}: {
  onCreate: () => void;
  onEdit: (contract: Contract) => void;
}) {
  const { contracts, loading, error, refetch } = useContracts();
  const [activeFilter, setActiveFilter] = useState<ContractStatus | "all">("all");

  const filtered = useMemo(
    () => (activeFilter === "all" ? contracts : contracts.filter((c) => c.status === activeFilter)),
    [contracts, activeFilter]
  );

  async function updateStatus(contract: Contract, status: ContractStatus) {
    await supabase.from("contracts").update({ status }).eq("id", contract.id);
    refetch();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Kunduppdragsavtal</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Endast synligt för superadmin — inga andra konton ser den här sidan.
          </p>
        </div>
        <Button variant="primary" onClick={onCreate}>
          Nytt avtal
        </Button>
      </header>

      <div
        role="tablist"
        aria-label="Filtrera avtal"
        className="mt-6 flex gap-1 overflow-x-auto rounded-[var(--radius-md)] bg-[var(--color-surface)] p-1"
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

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Hämtar avtal…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={contracts.length === 0 ? "Inga avtal än" : "Inga avtal matchar filtret"}
            description={
              contracts.length === 0
                ? "Skapa ditt första kunduppdragsavtal."
                : "Byt filter för att se fler avtal."
            }
            actionLabel={contracts.length === 0 ? "Nytt avtal" : undefined}
            onAction={contracts.length === 0 ? onCreate : undefined}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((contract) => (
              <li
                key={contract.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button onClick={() => onEdit(contract)} className="text-left">
                    <p className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                      {contract.client_name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      Start {formatDate(contract.start_date)}
                      {contract.end_date ? ` – ${formatDate(contract.end_date)}` : " – löpande"}
                    </p>
                  </button>
                  <ContractStatusBadge status={contract.status} />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3 text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    {formatSEK(contract.fee_amount)} · {FEE_TYPE_LABELS[contract.fee_type]}
                  </span>
                  <div className="flex gap-2">
                    {contract.status === "sent" && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(contract, "signed")}>
                        Markera signerat
                      </Button>
                    )}
                    {contract.status !== "terminated" && contract.status !== "draft" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(contract, "terminated")}>
                        Avsluta avtal
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
