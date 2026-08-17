# STS Faktura

Multi-tenant faktura-SaaS för svenska företag. React + TypeScript + Vite + Tailwind + Supabase.

## Kom igång i VS Code

### 1. Installera beroenden

```bash
npm install
```

### 2. Miljövariabler

```bash
cp .env.example .env
```

`.env` innehåller redan rätt Supabase-URL och publishable key för projektet
`sts-faktura` (id: `oicslonexyfahnvwhtxx`, region: eu-north-1/Stockholm).
Ingen ändring krävs för att komma igång.

### 3. Starta dev-servern

```bash
npm run dev
```

Öppna `http://localhost:5173`.

### 4. Skapa konto

Gå till appen → "Skapa konto" → registrera dig med din e-post. Om projektet
kräver e-postbekräftelse (Supabase-standard) får du ett mail att klicka på
innan du kan logga in.

**Superadmin:** `siemteaghes.98@gmail.com` är redan registrerad som
superadmin i databasen (tabellen `superadmins`) och får automatiskt access
till fliken "Avtal" när det kontot loggar in.

Efter inloggning: eftersom du är ny användare visas ett onboarding-steg där
du skapar ditt företag (namn + org.nummer). Du blir automatiskt `owner`.

## Databasen

Databasen är redan fullt uppsatt i Supabase — inga migrationer behöver köras
manuellt. Nuvarande migrationshistorik:

1. `initial_invoicing_schema` — companies, customers, invoices, invoice_lines,
   payments, invoice_emails, RLS, löpande fakturanummer, OCR-generering
2. `harden_function_security` — låst `search_path`, `anon`-behörigheter
   nollställda på känsliga funktioner
3. `gdpr_customer_anonymization` — `anonymize_customer_contact()`-funktion
4. `lock_down_function_grants` — korrigerad `PUBLIC`-behörighetsläcka
5. `restrict_gdpr_deletion_to_owner` — GDPR-radering låst till company owner
6. `reconfirm_is_company_owner_grants` — bekräftelse av behörigheter
7. `superadmin_and_contracts` — `superadmins`-tabell, `contracts`-tabell
   (kunduppdragsavtal, superadmin-only)
8. `lock_is_superadmin_grant` — låst `is_superadmin()`-behörighet

Om du vill se eller ändra schemat: logga in på
[supabase.com/dashboard](https://supabase.com/dashboard/project/oicslonexyfahnvwhtxx)
med det Supabase-konto som äger projektet.

## Struktur

```
src/
  lib/          Supabase-klient, auth-context, datahämtningshooks
  components/   Återanvändbara UI-komponenter (Button, Modal, FormField, etc.)
  pages/        Sidor: fakturor, kunder, avtal, inloggning, onboarding
  types/        TypeScript-typer som speglar databasschemat
```

## Viktigt att veta

- **Vite-version är låst till 5.4.x** i `package.json`. Uppgradera inte till
  Vite 8.x/Rolldown-baserade versioner utan att testa noga — en tidigare
  version av det projektet visade sig tysta bort applikationskoden ur
  produktionsbygget trots att `npm run build` rapporterade "lyckades".
  Verifiera alltid ett nytt bygge genom att faktiskt leta efter riktig UI-text
  i `dist/assets/*.js`, inte bara kolla exit-koden.
- **PDF-generering** (`@react-pdf/renderer`) är lazy-loaded — den laddas bara
  ner av webbläsaren när användaren klickar "Ladda ner PDF" på en faktura,
  inte vid varje appstart.
- **Ej byggt än:** e-postutskick av fakturor (SendGrid), "glömt lösenord",
  företagsswitcher för användare med flera företag, produktionsdeploy.

## Kommandon

```bash
npm run dev        # Dev-server med HMR
npm run build       # Produktionsbygge (tsc + vite build) till dist/
npm run preview      # Förhandsgranska produktionsbygget lokalt
```
