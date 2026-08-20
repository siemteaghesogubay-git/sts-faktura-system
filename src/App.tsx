import { useState } from "react";
import { AuthProvider, useAuth } from "./lib/auth";
import { useCompanies } from "./lib/useCompanies";
import { useIsSuperAdmin } from "./lib/useIsSuperAdmin";
import { Sidebar, type NavSection } from "./components/Sidebar";
import { Modal } from "./components/Modal";
import { PrivacyPolicyContent } from "./components/PrivacyPolicyContent";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { InvoiceListPage } from "./pages/InvoiceListPage";
import { InvoiceFormPage } from "./pages/InvoiceFormPage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage";
import { CustomerListPage } from "./pages/CustomerListPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AllCompaniesPage } from "./pages/AllCompaniesPage";
import { ContractListPage } from "./pages/ContractListPage";
import { ContractFormPage } from "./pages/ContractFormPage";
import { LoadingState } from "./components/States";
import type { Invoice, Contract } from "./types/database";

type InvoiceView = { name: "list" } | { name: "create" } | { name: "detail"; invoice: Invoice };
type ContractView = { name: "list" } | { name: "create" } | { name: "edit"; contract: Contract };
type AuthScreen = "login" | "signup";

function AuthGate() {
  const [screen, setScreen] = useState<AuthScreen>("login");
  return screen === "login" ? (
    <LoginPage onSwitchToSignup={() => setScreen("signup")} />
  ) : (
    <SignupPage onSwitchToLogin={() => setScreen("login")} />
  );
}

function AuthenticatedApp() {
  const { signOut } = useAuth();
  const { memberships, loading, refetch } = useCompanies();
  const { isSuperAdmin } = useIsSuperAdmin();
  const [section, setSection] = useState<NavSection>("overview");
  const [invoiceView, setInvoiceView] = useState<InvoiceView>({ name: "list" });
  const [contractView, setContractView] = useState<ContractView>({ name: "list" });
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <LoadingState label="Laddar konto…" />
      </div>
    );
  }

  if (memberships.length === 0) {
    return <OnboardingPage onCreated={refetch} />;
  }

  const activeCompany = memberships[0].company;

  if (!activeCompany.is_active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
        <div className="max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <h1 className="text-lg font-medium text-[var(--color-text-primary)]">Kontot är inaktiverat</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {activeCompany.name} har inaktiverats. Kontakta oss om du tror att detta är ett misstag.
          </p>
          <button
            onClick={signOut}
            className="mt-4 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Logga ut
          </button>
        </div>
      </div>
    );
  }

  function handleNavigate(next: NavSection) {
    setSection(next);
    setInvoiceView({ name: "list" });
    setContractView({ name: "list" });
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <Sidebar
        active={section}
        onNavigate={handleNavigate}
        companyName={activeCompany.name}
        companyLogoUrl={activeCompany.logo_url}
        onSignOut={signOut}
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        showContractsTab={isSuperAdmin}
      />

      <main className="min-w-0 flex-1">
        {section === "overview" && (
          <OverviewPage
            companyId={activeCompany.id}
            companyName={activeCompany.name}
            showContractsAction={isSuperAdmin}
            onCreateInvoice={() => {
              setSection("invoices");
              setInvoiceView({ name: "create" });
            }}
            onOpenInvoice={(invoice) => {
              setSection("invoices");
              setInvoiceView({ name: "detail", invoice });
            }}
            onNavigate={handleNavigate}
          />
        )}

        {section === "customers" && (
          <CustomerListPage companyId={activeCompany.id} role={memberships[0].role} />
        )}

        {section === "reports" && <ReportsPage companyId={activeCompany.id} />}

        {section === "settings" && (
          <SettingsPage companyId={activeCompany.id} role={memberships[0].role} />
        )}

        {section === "all-companies" && isSuperAdmin && <AllCompaniesPage />}

        {section === "invoices" && invoiceView.name === "list" && (
          <InvoiceListPage
            companyId={activeCompany.id}
            onCreateInvoice={() => setInvoiceView({ name: "create" })}
            onOpenInvoice={(invoice) => setInvoiceView({ name: "detail", invoice })}
          />
        )}
        {section === "invoices" && invoiceView.name === "create" && (
          <InvoiceFormPage
            companyId={activeCompany.id}
            onSaved={() => setInvoiceView({ name: "list" })}
            onCancel={() => setInvoiceView({ name: "list" })}
          />
        )}
        {section === "invoices" && invoiceView.name === "detail" && (
          <InvoiceDetailPage invoiceId={invoiceView.invoice.id} onBack={() => setInvoiceView({ name: "list" })} />
        )}

        {section === "contracts" && isSuperAdmin && contractView.name === "list" && (
                    <ContractListPage
            issuerCompany={activeCompany}
            onCreate={() => setContractView({ name: "create" })}
            onEdit={(contract) => setContractView({ name: "edit", contract })}
          />
        )}
        {section === "contracts" && isSuperAdmin && contractView.name === "create" && (
          <ContractFormPage
            onSaved={() => setContractView({ name: "list" })}
            onCancel={() => setContractView({ name: "list" })}
          />
        )}
        {section === "contracts" && isSuperAdmin && contractView.name === "edit" && (
          <ContractFormPage
            existing={contractView.contract}
            onSaved={() => setContractView({ name: "list" })}
            onCancel={() => setContractView({ name: "list" })}
          />
        )}
      </main>

      {showPrivacyPolicy && (
        <Modal title="Integritetspolicy" onClose={() => setShowPrivacyPolicy(false)}>
          <PrivacyPolicyContent />
        </Modal>
      )}
    </div>
  );
}

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <LoadingState label="Laddar…" />
      </div>
    );
  }

  return session ? <AuthenticatedApp /> : <AuthGate />;
}

function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

export default App;