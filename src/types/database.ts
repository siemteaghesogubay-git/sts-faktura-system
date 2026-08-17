export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "credited" | "cancelled";
export type CompanyRole = "owner" | "admin" | "member";
export type ContractStatus = "draft" | "sent" | "signed" | "terminated";
export type FeeType = "fixed" | "hourly" | "monthly";

export interface Company {
  id: string;
  name: string;
  org_number: string;
  vat_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  bankgiro: string | null;
  plusgiro: string | null;
  f_skatt: boolean;
  invoice_prefix: string;
  next_invoice_number: number;
  default_payment_days: number;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  org_number: string | null;
  reference_person: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  contact_anonymized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  company_id: string;
  customer_id: string;
  invoice_number: string;
  invoice_sequence: number;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  ocr_number: string | null;
  payment_terms: string | null;
  notes: string | null;
  credited_invoice_id: string | null;
  subtotal: number;
  vat_total: number;
  total: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined at query time
  customer?: Customer;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  paid_at: string;
  method: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  linked_company_id: string | null;
  client_name: string;
  client_org_number: string | null;
  client_contact_person: string | null;
  client_email: string | null;
  client_address: string | null;
  contract_date: string;
  start_date: string;
  end_date: string | null;
  scope_of_work: string;
  fee_type: FeeType;
  fee_amount: number;
  payment_terms: string | null;
  additional_terms: string | null;
  status: ContractStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Minimal Database type so the Supabase client stays typed without
// generating the full CLI schema dump.
export type Database = {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: Partial<Company>;
        Update: Partial<Company>;
        Relationships: [];
      };
      customers: {
        Row: Customer;
        Insert: Partial<Customer>;
        Update: Partial<Customer>;
        Relationships: [];
      };
      invoices: {
        Row: Invoice;
        Insert: Partial<Invoice>;
        Update: Partial<Invoice>;
        Relationships: [];
      };
      invoice_lines: {
        Row: InvoiceLine;
        Insert: Partial<InvoiceLine>;
        Update: Partial<InvoiceLine>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: Partial<Payment>;
        Update: Partial<Payment>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_invoice_number: {
        Args: { p_company_id: string };
        Returns: { invoice_number: string; invoice_sequence: number }[];
      };
      generate_ocr_number: {
        Args: { p_base: string };
        Returns: string;
      };
      create_company_with_owner: {
        Args: { p_name: string; p_org_number: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
