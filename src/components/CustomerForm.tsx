import { useState } from "react";
import { supabase } from "../lib/supabase";
import { TextField } from "./FormField";
import { Button } from "./Button";
import type { Customer } from "../types/database";

export function CustomerForm({
  companyId,
  existing,
  canDeleteContactData,
  onSaved,
  onCancel,
}: {
  companyId: string;
  existing?: Customer;
  canDeleteContactData: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [orgNumber, setOrgNumber] = useState(existing?.org_number ?? "");
  const [referencePerson, setReferencePerson] = useState(existing?.reference_person ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [addressLine1, setAddressLine1] = useState(existing?.address_line1 ?? "");
  const [postalCode, setPostalCode] = useState(existing?.postal_code ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [saving, setSaving] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);
  const [confirmAnonymize, setConfirmAnonymize] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Ange kundens namn.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Ange en giltig e-postadress.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      company_id: companyId,
      name: name.trim(),
      org_number: orgNumber.trim() || null,
      reference_person: referencePerson.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address_line1: addressLine1.trim() || null,
      postal_code: postalCode.trim() || null,
      city: city.trim() || null,
    };

    const { error } = existing
      ? await supabase.from("customers").update(payload).eq("id", existing.id)
      : await supabase.from("customers").insert(payload);

    setSaving(false);

    if (error) {
      setErrors({ form: "Kunde inte spara kunden. Försök igen." });
      return;
    }

    onSaved();
  }

  async function handleAnonymize() {
    if (!existing) return;
    setAnonymizing(true);
    const { error } = await supabase.rpc("anonymize_customer_contact", {
      p_customer_id: existing.id,
    });
    setAnonymizing(false);

    if (error) {
      setErrors({ form: "Kunde inte radera kontaktuppgifterna. Försök igen." });
      return;
    }
    onSaved();
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Namn"
        id="c-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        placeholder="Företagsnamn eller kontaktperson"
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Org.nummer"
          id="c-org"
          value={orgNumber}
          onChange={(e) => setOrgNumber(e.target.value)}
          placeholder="556677-8899"
        />
        <TextField
          label="Referensperson"
          id="c-ref"
          value={referencePerson}
          onChange={(e) => setReferencePerson(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="E-post"
          id="c-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="namn@foretag.se"
        />
        <TextField
          label="Telefon"
          id="c-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <TextField
        label="Adress"
        id="c-address"
        value={addressLine1}
        onChange={(e) => setAddressLine1(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Postnummer"
          id="c-postal"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="123 45"
        />
        <TextField label="Stad" id="c-city" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>

      {errors.form && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {errors.form}
        </p>
      )}

      {existing && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-3">
          {existing.contact_anonymized_at ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Kontaktuppgifter raderade {new Date(existing.contact_anonymized_at).toLocaleDateString("sv-SE")}.
            </p>
          ) : !canDeleteContactData ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Endast företagets owner kan radera kontaktuppgifter (GDPR).
            </p>
          ) : !confirmAnonymize ? (
            <button
              type="button"
              onClick={() => setConfirmAnonymize(true)}
              className="text-xs text-[var(--color-danger)] hover:underline"
            >
              Radera kontaktuppgifter (GDPR)
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[var(--color-text-secondary)]">
                E-post, telefon, adress och referensperson raderas permanent. Namn och org.nummer
                behålls eftersom de krävs på redan utställda fakturor enligt bokföringslagen. Detta
                kan inte ångras.
              </p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleAnonymize} loading={anonymizing}>
                  Bekräfta radering
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmAnonymize(false)}>
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Avbryt
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          {existing ? "Spara ändringar" : "Lägg till kund"}
        </Button>
      </div>
    </div>
  );
}
