import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initErrorMonitoring() {
  if (!dsn) {
    // Ingen DSN konfigurerad — bevakning är avstängd (t.ex. i lokal utveckling).
    // Se README för hur du sätter upp Sentry och kopplar in e-postlarm.
    return;
  }
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

/**
 * Rapportera ett fel till bevakningen med kontext om var det hände.
 * Används i catch-block för kritiska operationer (registrering, fakturaskapande,
 * PDF-generering, RPC-anrop) så att både frontend-krascher och
 * databas-/behörighetsfel (RLS-avslag, function-fel) fångas på samma ställe.
 */
export function reportError(error: unknown, context: { area: string; [key: string]: unknown }) {
  if (dsn) {
    Sentry.captureException(error, { extra: context });
  }
  // Alltid logga lokalt också, så det syns i webbläsarkonsolen under utveckling.
  console.error(`[${context.area}]`, error, context);
}