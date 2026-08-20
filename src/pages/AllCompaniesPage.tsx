import { useMemo, useState } from "react";
import { useAllCompanies } from "../lib/useAllCompanies";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/format";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { Button } from "../components/Button";
import { reportError } from "../lib/errorMonitoring";
import type { CompanyWithCounts } from "../lib/useAllCompanies";

export function AllCompaniesPage() {
  const { companies, loading, error, refetch } = useAllCompanies();
  const [query, setQuery] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<CompanyWithCounts | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.org_number.toLowerCase().includes(q)
    );
  }, [companies, query]);

  async function handleDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setDeleteError(null);

    const { error: deleteErr } = await supabase.from("companies").delete().eq("id", confirmTarget.id);

    setDeleting(false);

    if (deleteErr) {
      if (deleteErr.code === "23503") {
        setDeleteError("Kan inte tas bort — företaget har fakturor i systemet.");
      } else {
        reportError(deleteErr, { area: "superadmin_company_delete", companyId: confirmTarget.id });
        setDeleteError("Kunde inte ta bort företaget. Försök igen.");
      }
      return;
    }

    setConfirmTarget(null);
    refetch();
  }

  async function handleToggleActive(company: CompanyWithCounts) {
    setTogglingId(company.id);
    setToggleError(null);
    const { error: toggleErr } = await supabase
      .from("companies")
      .update({ is_active: !company.is_active })
      .eq("id", company.id);
    setTogglingId(null);

    if (toggleErr) {
      // Databasen blockerar medvetet inaktivering av företag där en
      // superadmin är medlem (se migrationen) — visa det tydligt istället
      // för att bara tyst misslyckas.
      if (toggleErr.message.includes("superadmin")) {
        setToggleError(`${company.name} kan inte inaktiveras eftersom en superadmin tillhör det.`);
      } else {
        reportError(toggleErr, { area: "superadmin_company_toggle_active", companyId: company.id });
        setToggleError("Kunde inte ändra status. Försök igen.");
      }
      return;
    }
    refetch();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-[var(--color-text-primary)]">
          Alla registrerade företag
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Samtliga företag (tenants) som skapat konto i tjänsten. Endast synligt för superadmin.
        </p>
      </header>

      {companies.length > 0 && (
        <label className="mt-6 block">
          <span className="sr-only">Sök företag eller org.nummer</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök företag eller org.nummer…"
            className="h-10 w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
          />
        </label>
      )}

      {toggleError && (
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {toggleError}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <LoadingState label="Hämtar företag…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          companies.length === 0 ? (
            <EmptyState title="Inga företag registrerade än" description="Inget företag har skapat konto ännu." />
          ) : (
            <EmptyState title="Inga företag matchar" description="Justera sökningen för att se fler resultat." />
          )
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3 font-medium">Företag</th>
                  <th className="px-4 py-3 font-medium">Org.nummer</th>
                  <th className="px-4 py-3 font-medium">Registrerat</th>
                  <th className="px-4 py-3 text-right font-medium">Medlemmar</th>
                  <th className="px-4 py-3 text-right font-medium">Fakturor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((company) => (
                  <tr key={company.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      <div className="flex items-center gap-2">
                        {company.logo_url && (
                          <img
                            src={company.logo_url}
                            alt=""
                            className="h-6 w-6 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-white object-contain"
                          />
                        )}
                        {company.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{company.org_number}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {formatDate(company.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {company.member_count}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {company.invoice_count}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: company.is_active
                            ? "var(--color-success-muted)"
                            : "var(--color-danger-muted)",
                          color: company.is_active ? "var(--color-success)" : "var(--color-danger)",
                        }}
                      >
                        {company.is_active ? "Aktivt" : "Inaktiverat"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(company)}
                          loading={togglingId === company.id}
                        >
                          {company.is_active ? "Inaktivera" : "Aktivera"}
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setConfirmTarget(company)}>
                          Ta bort
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmTarget && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)] p-4">
          <p className="text-sm text-[var(--color-text-primary)]">
            Ta bort företaget <strong>{confirmTarget.name}</strong> permanent? Detta raderar även deras
            medlemskap och kunder. Det går inte att ångra.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
              Ja, ta bort
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setConfirmTarget(null);
                setDeleteError(null);
              }}
            >
              Avbryt
            </Button>
          </div>
          {deleteError && <p className="mt-2 text-sm text-[var(--color-danger)]">{deleteError}</p>}
        </div>
      )}
    </div>
  );
}