import { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useCustomers } from "../lib/useCustomers";
import { formatSEK } from "../lib/format";
import { Button } from "../components/Button";
import { TextField, SelectField } from "../components/FormField";
import { LoadingState } from "../components/States";

interface DraftLine {
  key: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

const VAT_RATES = [25, 12, 6, 0];

function emptyLine(): DraftLine {
  return { key: crypto.randomUUID(), description: "", quantity: 1, unit_price: 0, vat_rate: 25 };
}

export function InvoiceFormPage({
  companyId,
  onSaved,
  onCancel,
}: {
  companyId: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { customers, loading: customersLoading } = useCustomers(companyId);
  const [customerId, setCustomerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totals = useMemo(() => {
    let subtotal = 0;
    let vatTotal = 0;
    for (const line of lines) {
      const lineTotal = line.quantity * line.unit_price;
      subtotal += lineTotal;
      vatTotal += lineTotal * (line.vat_rate / 100);
    }
    return { subtotal, vatTotal, total: subtotal + vatTotal };
  }, [lines]);

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!customerId) newErrors.customer = "Välj en kund.";
    if (!dueDate) newErrors.dueDate = "Ange förfallodatum.";
    if (dueDate < invoiceDate) newErrors.dueDate = "Förfallodatum kan inte vara före fakturadatum.";
    const hasValidLine = lines.some((l) => l.description.trim() && l.quantity > 0 && l.unit_price >= 0);
    if (!hasValidLine) newErrors.lines = "Lägg till minst en rad med beskrivning, antal och pris.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    try {
      const { data: numberData, error: numberError } = await supabase.rpc("generate_invoice_number", {
        p_company_id: companyId,
      });
      const numberRow = (numberData as { invoice_number: string; invoice_sequence: number }[] | null)?.[0];
      if (numberError || !numberRow) throw numberError ?? new Error("Kunde inte generera fakturanummer");

      const { invoice_number, invoice_sequence } = numberRow;

      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          company_id: companyId,
          customer_id: customerId,
          invoice_number,
          invoice_sequence,
          invoice_date: invoiceDate,
          due_date: dueDate,
          status: "draft",
          notes: notes || null,
        })
        .select()
        .single();

      if (invoiceError || !invoice) throw invoiceError ?? new Error("Kunde inte skapa faktura");

      const validLines = lines.filter((l) => l.description.trim());
      const { error: linesError } = await supabase.from("invoice_lines").insert(
        validLines.map((l, idx) => ({
          invoice_id: invoice.id,
          position: idx,
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
          vat_rate: l.vat_rate,
          line_total: l.quantity * l.unit_price,
        }))
      );

      if (linesError) throw linesError;

      onSaved();
    } catch {
      setErrors({ form: "Något gick fel när fakturan skulle sparas. Försök igen." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Ny faktura</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Fakturanummer och OCR genereras automatiskt när du sparar.
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          Avbryt
        </Button>
      </header>

      {customersLoading ? (
        <LoadingState label="Laddar kunder…" />
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Kund och datum</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SelectField
                label="Kund"
                id="customer"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                error={errors.customer}
              >
                <option value="">Välj kund…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Fakturadatum"
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
              <TextField
                label="Förfallodatum"
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                error={errors.dueDate}
              />
            </div>
            {customers.length === 0 && (
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                Du har inga kunder ännu. Lägg till en kund innan du kan skapa en faktura.
              </p>
            )}
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">Fakturarader</h2>
              <Button variant="outline" size="sm" onClick={() => setLines((prev) => [...prev, emptyLine()])}>
                Lägg till rad
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {lines.map((line) => (
                <div
                  key={line.key}
                  className="grid grid-cols-1 gap-2 border-b border-[var(--color-border)] pb-3 last:border-0 sm:grid-cols-[1fr_80px_100px_90px_100px_auto] sm:items-end"
                >
                  <TextField
                    label="Beskrivning"
                    id={`desc-${line.key}`}
                    value={line.description}
                    onChange={(e) => updateLine(line.key, { description: e.target.value })}
                    placeholder="T.ex. Webbutveckling"
                  />
                  <TextField
                    label="Antal"
                    id={`qty-${line.key}`}
                    type="number"
                    min={0}
                    step="0.5"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
                  />
                  <TextField
                    label="À-pris"
                    id={`price-${line.key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) => updateLine(line.key, { unit_price: Number(e.target.value) })}
                  />
                  <SelectField
                    label="Moms"
                    id={`vat-${line.key}`}
                    value={line.vat_rate}
                    onChange={(e) => updateLine(line.key, { vat_rate: Number(e.target.value) })}
                  >
                    {VAT_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </SelectField>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">Summa</span>
                    <span className="flex h-10 items-center text-sm text-[var(--color-text-secondary)]">
                      {formatSEK(line.quantity * line.unit_price)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(line.key)}
                    aria-label="Ta bort rad"
                    disabled={lines.length === 1}
                  >
                    Ta bort
                  </Button>
                </div>
              ))}
            </div>
            {errors.lines && <p className="mt-2 text-xs text-[var(--color-danger)]">{errors.lines}</p>}

            <div className="mt-5 flex flex-col items-end gap-1 border-t border-[var(--color-border)] pt-4 text-sm">
              <div className="flex w-48 justify-between text-[var(--color-text-secondary)]">
                <span>Delsumma</span>
                <span>{formatSEK(totals.subtotal)}</span>
              </div>
              <div className="flex w-48 justify-between text-[var(--color-text-secondary)]">
                <span>Moms</span>
                <span>{formatSEK(totals.vatTotal)}</span>
              </div>
              <div className="flex w-48 justify-between text-base font-semibold text-[var(--color-text-primary)]">
                <span>Totalt</span>
                <span>{formatSEK(totals.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <label htmlFor="notes" className="text-sm font-medium text-[var(--color-text-primary)]">
              Anteckningar (visas på fakturan)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              placeholder="T.ex. betalningsvillkor eller referens"
            />
          </section>

          {errors.form && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {errors.form}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Avbryt
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Spara faktura
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
