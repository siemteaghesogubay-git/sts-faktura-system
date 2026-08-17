export function PrivacyPolicyContent() {
  return (
    <div className="flex flex-col gap-4 text-sm text-[var(--color-text-secondary)]">
      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Personuppgiftsansvarig</h3>
        <p className="mt-1">
          Det företag du registrerar och loggar in som är personuppgiftsansvarigt för de kunduppgifter
          som läggs in i tjänsten (kundnamn, kontaktuppgifter, fakturahistorik). STS Tech Solution
          tillhandahåller tjänsten som personuppgiftsbiträde.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Vilka uppgifter vi behandlar</h3>
        <p className="mt-1">
          Kontouppgifter (e-post) för inloggning, företagsuppgifter (namn, org.nummer, bankgiro/plusgiro)
          samt de kunduppgifter du själv registrerar för fakturering (namn, adress, e-post, telefon,
          referensperson).
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Rättslig grund och lagring</h3>
        <p className="mt-1">
          Fakturadata sparas i minst 7 år enligt Bokföringslagen (1999:1078) — detta är en rättslig
          skyldighet som går före en begäran om radering. Kontouppgifter sparas så länge kontot är
          aktivt. Kunders kontaktuppgifter (utöver det som krävs för bokföring) kan raderas på begäran,
          se nedan.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Var uppgifterna lagras</h3>
        <p className="mt-1">
          All data lagras hos Supabase i EU (Stockholm-regionen). Ingen data överförs utanför EU/EES.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Dina rättigheter</h3>
        <p className="mt-1">
          Du har rätt att begära utdrag, rättelse och radering av personuppgifter. Kunders
          kontaktuppgifter kan raderas direkt i kundvyn ("Radera kontaktuppgifter"). Observera att
          namn och org.nummer på redan utställda fakturor inte kan raderas, eftersom bokföringslagen
          kräver att verifikationer sparas oförändrade.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Cookies</h3>
        <p className="mt-1">
          Tjänsten använder endast en teknisk sessionscookie för inloggning. Ingen spårning eller
          marknadsföringscookies används.
        </p>
      </section>
    </div>
  );
}
