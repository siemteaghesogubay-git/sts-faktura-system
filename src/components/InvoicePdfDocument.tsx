import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { InvoiceDetail } from "../lib/useInvoiceDetail";


const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  companyName: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  logo: { width: 64, height: 64, objectFit: "contain", marginBottom: 8 },
  muted: { color: "#666666" },
  invoiceTitle: { fontSize: 20, fontWeight: 600, textAlign: "right" },
  metaBlock: { marginTop: 8, textAlign: "right" },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, marginTop: 16 },
  partyBlock: { width: "45%" },
  partyLabel: { fontSize: 8, color: "#999999", textTransform: "uppercase", marginBottom: 4 },
  table: { marginTop: 8, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    paddingVertical: 6,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e0e0e0", paddingVertical: 6 },
  colDescription: { width: "40%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "16%", textAlign: "right" },
  colVat: { width: "12%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },
  tableHeaderText: { fontSize: 8, color: "#999999", textTransform: "uppercase" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 3 },
  grandTotalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  grandTotalText: { fontSize: 12, fontWeight: 600 },
  paymentBlock: {
    marginTop: 32,
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 4,
  },
  paymentRow: { flexDirection: "row", marginBottom: 3 },
  paymentLabel: { width: 110, color: "#666666" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#999999" },
});

function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(dateStr)
  );
}

export function InvoicePdfDocument({ detail }: { detail: InvoiceDetail }) {
  const { invoice, lines, customer, company } = detail;

  return (
    <Document title={`Faktura ${invoice.invoice_number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {company.logo_url && <Image style={styles.logo} src={company.logo_url} />}
            <Text style={styles.companyName}>{company.name}</Text>
            {company.address_line1 && <Text style={styles.muted}>{company.address_line1}</Text>}
            {(company.postal_code || company.city) && (
              <Text style={styles.muted}>
                {company.postal_code} {company.city}
              </Text>
            )}
            <Text style={styles.muted}>Org.nr: {company.org_number}</Text>
            {company.vat_number && <Text style={styles.muted}>Momsreg.nr: {company.vat_number}</Text>}
            {company.f_skatt && <Text style={styles.muted}>Innehar F-skattsedel</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FAKTURA</Text>
            <View style={styles.metaBlock}>
              <Text>Fakturanr: {invoice.invoice_number}</Text>
              <Text style={styles.muted}>Fakturadatum: {formatDate(invoice.invoice_date)}</Text>
              <Text style={styles.muted}>Förfallodatum: {formatDate(invoice.due_date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Fakturan skickas till</Text>
            <Text style={{ fontWeight: 600 }}>{customer.name}</Text>
            {customer.address_line1 && <Text>{customer.address_line1}</Text>}
            {(customer.postal_code || customer.city) && (
              <Text>
                {customer.postal_code} {customer.city}
              </Text>
            )}
            {customer.org_number && <Text style={styles.muted}>Org.nr: {customer.org_number}</Text>}
            {customer.reference_person && (
              <Text style={styles.muted}>Er referens: {customer.reference_person}</Text>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>Beskrivning</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Antal</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>À-pris</Text>
            <Text style={[styles.colVat, styles.tableHeaderText]}>Moms</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>Summa</Text>
          </View>
          {lines.map((line) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={styles.colDescription}>{line.description}</Text>
              <Text style={styles.colQty}>
                {line.quantity} {line.unit}
              </Text>
              <Text style={styles.colPrice}>{formatSEK(line.unit_price)}</Text>
              <Text style={styles.colVat}>{line.vat_rate}%</Text>
              <Text style={styles.colTotal}>{formatSEK(line.line_total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Delsumma</Text>
            <Text>{formatSEK(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Moms</Text>
            <Text>{formatSEK(invoice.vat_total)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>Att betala</Text>
            <Text style={styles.grandTotalText}>{formatSEK(invoice.total)}</Text>
          </View>
        </View>

        <View style={styles.paymentBlock}>
          {company.bankgiro && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Bankgiro</Text>
              <Text>{company.bankgiro}</Text>
            </View>
          )}
          {company.plusgiro && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Plusgiro</Text>
              <Text>{company.plusgiro}</Text>
            </View>
          )}
          {invoice.ocr_number && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>OCR-nummer</Text>
              <Text>{invoice.ocr_number}</Text>
            </View>
          )}
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Förfallodatum</Text>
            <Text>{formatDate(invoice.due_date)}</Text>
          </View>
          {invoice.payment_terms && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Betalningsvillkor</Text>
              <Text>{invoice.payment_terms}</Text>
            </View>
          )}
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.partyLabel}>Anteckningar</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {company.name} · Org.nr {company.org_number}
          {company.email ? ` · ${company.email}` : ""}
          {company.phone ? ` · ${company.phone}` : ""}
        </Text>
      </Page>
    </Document>
  );
}