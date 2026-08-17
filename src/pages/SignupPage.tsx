import { useState } from "react";
import { useAuth } from "../lib/auth";
import { TextField } from "../components/FormField";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { PrivacyPolicyContent } from "../components/PrivacyPolicyContent";

export function SignupPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consented, setConsented] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consented) {
      setError("Du måste godkänna integritetspolicyn för att skapa ett konto.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: signUpError, needsConfirmation } = await signUp(email, password);
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsConfirmation) setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
        <div className="max-w-sm rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
          <h1 className="text-lg font-medium text-[var(--color-text-primary)]">Kolla din e-post</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Vi har skickat en bekräftelselänk till <span className="text-[var(--color-text-primary)]">{email}</span>.
            Klicka på länken för att aktivera kontot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold text-[var(--color-text-primary)]">Skapa konto</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="E-post"
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Lösenord"
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            hint="Minst 6 tecken."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-border-strong)] bg-[var(--color-surface)]"
            />
            <span>
              Jag godkänner{" "}
              <button
                type="button"
                onClick={() => setShowPolicy(true)}
                className="text-[var(--color-primary)] hover:underline"
              >
                integritetspolicyn
              </button>{" "}
              och hur mina uppgifter behandlas.
            </span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full">
            Skapa konto
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Har du redan ett konto?{" "}
          <button onClick={onSwitchToLogin} className="text-[var(--color-primary)] hover:underline">
            Logga in
          </button>
        </p>
      </div>

      {showPolicy && (
        <Modal title="Integritetspolicy" onClose={() => setShowPolicy(false)}>
          <PrivacyPolicyContent />
        </Modal>
      )}
    </div>
  );
}
