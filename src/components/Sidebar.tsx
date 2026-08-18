export type NavSection =
  | "overview"
  | "invoices"
  | "customers"
  | "contracts"
  | "all-companies"
  | "reports"
  | "settings";

export function Sidebar({
  active,
  onNavigate,
  companyName,
  companyLogoUrl,
  onSignOut,
  onShowPrivacyPolicy,
  showContractsTab,
}: {
  active: NavSection;
  onNavigate: (view: NavSection) => void;
  companyName: string;
  companyLogoUrl?: string | null;
  onSignOut: () => void;
  onShowPrivacyPolicy: () => void;
  showContractsTab: boolean;
}) {
  const items: { key: NavSection; label: string }[] = [
    { key: "overview", label: "Översikt" },
    { key: "invoices", label: "Fakturor" },
    { key: "customers", label: "Kunder" },
    ...(showContractsTab ? [{ key: "contracts" as const, label: "Avtal" }] : []),
    ...(showContractsTab ? [{ key: "all-companies" as const, label: "Alla företag" }] : []),
    { key: "reports", label: "Rapporter" },
    { key: "settings", label: "Inställningar" },
  ];

  return (
    <nav
      aria-label="Huvudnavigering"
      className="sticky top-0 flex h-screen w-[200px] flex-shrink-0 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5"
    >
      <div>
        <div className="px-2 pb-6 font-heading text-base font-semibold tracking-wide text-[var(--color-text-primary)]">
          STS Faktura
        </div>
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              aria-current={active === item.key ? "page" : undefined}
              className={`rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-medium transition-colors ${
                active === item.key
                  ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-4">
        {companyLogoUrl && (
          <img
            src={companyLogoUrl}
            alt=""
            className="mb-1.5 h-7 w-7 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-white object-contain"
          />
        )}
        <p className="truncate px-2 text-xs text-[var(--color-text-muted)]">{companyName}</p>
        <button
          onClick={onShowPrivacyPolicy}
          className="rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          Integritetspolicy
        </button>
        <button
          onClick={onSignOut}
          className="rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          Logga ut
        </button>
      </div>
    </nav>
  );
}