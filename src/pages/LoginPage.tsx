import { useState } from "react";
import { useAuth } from "../lib/auth";
import { TextField } from "../components/FormField";
import { Button } from "../components/Button";

export function LoginPage({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) setError(signInError);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-xl font-semibold text-[var(--color-text-primary)]">
          Logga in på STS Faktura
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="E-post"
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Lösenord"
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" loading={loading} className="mt-2 w-full">
            Logga in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Inget konto?{" "}
          <button onClick={onSwitchToSignup} className="text-[var(--color-primary)] hover:underline">
            Skapa konto
          </button>
        </p>
      </div>
    </div>
  );
}
