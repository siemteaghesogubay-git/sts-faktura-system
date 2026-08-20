import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Contract, Company } from "../types/database";

// Samma medvetna val som fakturans PDF: inget externt typsnitt registreras
// (standard-Helvetica täcker å/ä/ö via WinAnsi), och minustecken normaliseras
// om det någonsin skulle behövas — se InvoicePdfDocument.tsx för bakgrund.

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  companyName: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  logo: { width: 64, height: 64, objectFit: "contain", marginBottom: 8 },
  muted: { color: "#666666" },
  docTitle: { fontSize: 20, fontWeight: 600, textAlign: "right" },
  metaBlock: { marginTop: 8, textAlign: "right" },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, marginTop: 16 },
  partyBlock: { width: "45%" },
  partyLabel: { fontSize: 8, color: "#999999", textTransform: "uppercase", marginBottom: 4 },
  sectionLabel: { fontSize: 8, color: "#999999", textTransform: "uppercase", marginBottom: 4, marginTop: 20 },
  bodyText: { lineHeight: 1.5 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  detailItem: { width: "33%", marginBottom: 10 },
  detailLabel: { fontSize: 8, color: "#999999", textTransform: "uppercase", marginBottom: 2 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#999999" },
});

function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" })
    .format(amount)
    .replace(/\u2212/g, "-");
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(dateStr)
  );
}

const FEE_TYPE_LABELS: Record<string, string> = {
  fixed: "Fast pris",
  hourly: "Löpande räkning (timpris)",
  monthly: "Månadsvis",
};

export function ContractPdfDocument({ contract, issuer }: { contract: Contract; issuer: Company }) {
  return (
    <Document title={`Avtal — ${contract.client_name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {issuer.logo_url && <Image style={styles.logo} src={issuer.logo_url} />}
            <Text style={styles.companyName}>{issuer.name}</Text>
            {issuer.address_line1 && <Text style={styles.muted}>{issuer.address_line1}</Text>}
            {(issuer.postal_code || issuer.city) && (
              <Text style={styles.muted}>
                {issuer.postal_code} {issuer.city}
              </Text>
            )}
            <Text style={styles.muted}>Org.nr: {issuer.org_number}</Text>
            {issuer.vat_number && <Text style={styles.muted}>Momsreg.nr: {issuer.vat_number}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>UPPDRAGSAVTAL</Text>
            <View style={styles.metaBlock}>
              <Text>Avtalsdatum: {formatDate(contract.contract_date)}</Text>
              <Text style={styles.muted}>Startdatum: {formatDate(contract.start_date)}</Text>
              <Text style={styles.muted}>
                Slutdatum: {contract.end_date ? formatDate(contract.end_date) : "Löpande"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Klient</Text>
            <Text style={{ fontWeight: 600 }}>{contract.client_name}</Text>
            {contract.client_address && <Text>{contract.client_address}</Text>}
            {contract.client_org_number && (
              <Text style={styles.muted}>Org.nr: {contract.client_org_number}</Text>
            )}
            {contract.client_contact_person && (
              <Text style={styles.muted}>Kontaktperson: {contract.client_contact_person}</Text>
            )}
            {contract.client_email && <Text style={styles.muted}>{contract.client_email}</Text>}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Uppdragets omfattning</Text>
        <Text style={styles.bodyText}>{contract.scope_of_work}</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ersättningsform</Text>
            <Text>{FEE_TYPE_LABELS[contract.fee_type] ?? contract.fee_type}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Belopp</Text>
            <Text>{formatSEK(contract.fee_amount)}</Text>
          </View>
          {contract.payment_terms && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Betalningsvillkor</Text>
              <Text>{contract.payment_terms}</Text>
            </View>
          )}
        </View>

        {contract.additional_terms && (
          <>
            <Text style={styles.sectionLabel}>Särskilda villkor</Text>
            <Text style={styles.bodyText}>{contract.additional_terms}</Text>
          </>
        )}

        <Text style={styles.footer}>
          {issuer.name} · Org.nr {issuer.org_number}
          {issuer.email ? ` · ${issuer.email}` : ""}
          {issuer.phone ? ` · ${issuer.phone}` : ""}
        </Text>
      </Page>
    </Document>
  );
}