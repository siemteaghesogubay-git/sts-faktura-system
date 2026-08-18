import { useState } from "react";
import { useInvoiceDetail } from "../lib/useInvoiceDetail";
import { supabase } from "../lib/supabase";
import { formatSEK, formatDate, isOverdue } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { ErrorState, LoadingState } from "../components/States";
import { reportError } from "../lib/errorMonitoring";
import type { InvoiceStatus } from "../types/database";

export function InvoiceDetailPage({
  invoiceId,
  onBack,
  onCreditCreated,
}: {
  invoiceId: string;
  onBack: () => void;
  onCreditCreated?: (newInvoiceId: string) => void;
}) {
  const { detail, loading, error, refetch } = useInvoiceDetail(invoiceId);
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [crediting, setCrediting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "credit" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDownload() {
    if (!detail) return;
    setDownloading(true);
    try {
      // Lazy-laddas: @react-pdf/renderer är ett stort bibliotek (fontrendering,
      // bildstöd) som annars skulle bakas in i huvudbunten och göra att
      // *alla* användare laddar ner det vid varje appstart, även de som
      // aldrig laddar ner en PDF.
      const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../components/InvoicePdfDocument"),
      ]);
      const blob = await pdf(<InvoicePdfDocument detail={detail} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${detail.invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function updateStatus(status: InvoiceStatus) {
    if (!detail) return;
    setUpdatingStatus(true);
    await supabase.from("invoices").update({ status }).eq("id", detail.invoice.id);
    setUpdatingStatus(false);
    refetch();
  }

  async function handleDelete() {
    if (!detail) return;
    setDeleting(true);
    setActionError(null);
    const { error: deleteError } = await supabase.from("invoices").delete().eq("id", detail.invoice.id);
    setDeleting(false);

    if (deleteError) {
      reportError(deleteError, { area: "invoice_delete_draft", invoiceId: detail.invoice.id });
      setActionError("Kunde inte radera fakturan. Försök igen.");
      return;
    }
    onBack();
  }

  async function handleCredit() {
    if (!detail) return;
    setCrediting(true);
    setActionError(null);
    const { data: newInvoiceId, error: creditError } = await supabase.rpc("credit_invoice", {
      p_invoice_id: detail.invoice.id,
    });
    setCrediting(false);

    if (creditError || !newInvoiceId) {
      reportError(creditError, { area: "invoice_credit", invoiceId: detail.invoice.id });
      setActionError("Kunde inte skapa kreditfaktura. Försök igen.");
      return;
    }
    setConfirmAction(null);
    if (onCreditCreated) {
      onCreditCreated(newInvoiceId as string);
    } else {
      refetch();
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        ← Tillbaka till fakturor
      </button>

      {loading ? (
        <LoadingState label="Hämtar faktura…" />
      ) : error || !detail ? (
        <ErrorState message={error ?? "Fakturan kunde inte hittas."} onRetry={refetch} />
      ) : (
        <>
          <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                  {detail.invoice.invoice_number}
                </h1>
                <StatusBadge
                  status={
                    isOverdue(detail.invoice.due_date, detail.invoice.status) ? "overdue" : detail.invoice.status
                  }
                />
              </div>
              {detail.invoice.credited_invoice_id !== null && (
                <p className="mt-1 text-xs font-medium text-[var(--color-warning)]">
                  Kreditfaktura — motpost till en tidigare faktura
                </p>
              )}
              {detail.invoice.status === "cancelled" && (
                <p className="mt-1 text-xs font-medium text-[var(--color-danger)]">Makulerad faktura</p>
              )}
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{detail.customer.name}</p>
            </div>
            <Button variant="primary" onClick={handleDownload} loading={downloading}>
              Ladda ner PDF
            </Button>
          </header>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <InfoCell label="Fakturadatum" value={formatDate(detail.invoice.invoice_date)} />
            <InfoCell label="Förfaller" value={formatDate(detail.invoice.due_date)} />
            <InfoCell label="Delsumma" value={formatSEK(detail.invoice.subtotal)} />
            <InfoCell label="Totalt" value={formatSEK(detail.invoice.total)} emphasize />
          </div>

          <div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                  <th className="px-4 py-3 font-medium">Beskrivning</th>
                  <th className="px-4 py-3 text-right font-medium">Antal</th>
                  <th className="px-4 py-3 text-right font-medium">À-pris</th>
                  <th className="px-4 py-3 text-right font-medium">Moms</th>
                  <th className="px-4 py-3 text-right font-medium">Summa</th>
                </tr>
              </thead>
              <tbody>
                {detail.lines.map((line) => (
                  <tr key={line.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-primary)]">{line.description}</td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {line.quantity} {line.unit}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {formatSEK(line.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">{line.vat_rate}%</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-text-primary)]">
                      {formatSEK(line.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detail.invoice.ocr_number && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              OCR-nummer: {detail.invoice.ocr_number}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {detail.invoice.status === "draft" && (
              <Button variant="outline" onClick={() => updateStatus("sent")} loading={updatingStatus}>
                Markera som skickad
              </Button>
            )}
            {(detail.invoice.status === "sent" || isOverdue(detail.invoice.due_date, detail.invoice.status)) && (
              <Button variant="outline" onClick={() => updateStatus("paid")} loading={updatingStatus}>
                Markera som betald
              </Button>
            )}

            {detail.invoice.status === "draft" && (
              <Button variant="danger" onClick={() => setConfirmAction("delete")}>
                Ta bort faktura
              </Button>
            )}
            {detail.invoice.status !== "draft" &&
              detail.invoice.status !== "credited" &&
              detail.invoice.status !== "cancelled" && (
                <Button variant="danger" onClick={() => setConfirmAction("credit")}>
                  Makulera faktura
                </Button>
              )}
          </div>

          {detail.invoice.status === "credited" && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Den här fakturan har krediterats. En kreditfaktura har skapats som motpost.
            </p>
          )}

          {confirmAction && (
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-muted)] p-4">
              {confirmAction === "delete" ? (
                <>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    Ta bort utkastet <strong>{detail.invoice.invoice_number}</strong> permanent? Det går inte att
                    ångra. Eftersom fakturan aldrig skickats påverkar det inte nummerserien.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
                      Ja, ta bort
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
                      Avbryt
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    Fakturan <strong>{detail.invoice.invoice_number}</strong> är skickad och kan enligt
                    bokföringslagen inte raderas. En kreditfaktura skapas istället som speglar beloppet negativt —
                    originalet markeras "Krediterad" och båda posterna finns kvar i nummerserien.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="danger" size="sm" onClick={handleCredit} loading={crediting}>
                      Ja, skapa kreditfaktura
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>
                      Avbryt
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {actionError && (
            <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
              {actionError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function InfoCell({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p
        className={`mt-1 text-sm ${emphasize ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}
      >
        {value}
      </p>
    </div>
  );
}