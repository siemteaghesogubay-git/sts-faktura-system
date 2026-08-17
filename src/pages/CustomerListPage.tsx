import { useMemo, useState } from "react";
import { useCustomers } from "../lib/useCustomers";
import { Button } from "../components/Button";
import { EmptyState, LoadingState } from "../components/States";
import { Modal } from "../components/Modal";
import { CustomerForm } from "../components/CustomerForm";
import type { Customer, CompanyRole } from "../types/database";

export function CustomerListPage({ companyId, role }: { companyId: string; role: CompanyRole }) {
  const { customers, loading, refetch } = useCustomers(companyId);
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState<
    { mode: "closed" } | { mode: "create" } | { mode: "edit"; customer: Customer }
  >({ mode: "closed" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q)
    );
  }, [customers, query]);

  function handleSaved() {
    setModalState({ mode: "closed" });
    refetch();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Kunder</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {customers.length} {customers.length === 1 ? "kund" : "kunder"} registrerade
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalState({ mode: "create" })}>
          Lägg till kund
        </Button>
      </header>

      {customers.length > 0 && (
        <label className="mt-6 block">
          <span className="sr-only">Sök kund</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök namn eller e-post…"
            className="h-10 w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />
        </label>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Hämtar kunder…" />
        ) : filtered.length === 0 ? (
          customers.length === 0 ? (
            <EmptyState
              title="Inga kunder än"
              description="Lägg till din första kund för att kunna skapa fakturor."
              actionLabel="Lägg till kund"
              onAction={() => setModalState({ mode: "create" })}
            />
          ) : (
            <EmptyState title="Inga kunder matchar" description="Justera sökningen för att se fler resultat." />
          )
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            {filtered.map((customer) => (
              <li key={customer.id}>
                <button
                  onClick={() => setModalState({ mode: "edit", customer })}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[var(--color-surface)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{customer.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {customer.email ?? customer.org_number ?? "Inga kontaktuppgifter"}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">Redigera</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modalState.mode !== "closed" && (
        <Modal
          title={modalState.mode === "create" ? "Lägg till kund" : "Redigera kund"}
          onClose={() => setModalState({ mode: "closed" })}
        >
          <CustomerForm
            companyId={companyId}
            existing={modalState.mode === "edit" ? modalState.customer : undefined}
            canDeleteContactData={role === "owner"}
            onSaved={handleSaved}
            onCancel={() => setModalState({ mode: "closed" })}
          />
        </Modal>
      )}
    </div>
  );
}
