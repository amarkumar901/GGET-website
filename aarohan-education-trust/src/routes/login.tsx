import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Administrator sign in — Aarohan" }] }),
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0] || "Admin",
          callbackURL: "/admin",
        });
        if (res.error) throw new Error(res.error.message || "Could not create account");
      } else {
        const res = await authClient.signIn.email({ email, password, callbackURL: "/admin" });
        if (res.error) throw new Error(res.error.message || "Could not sign in");
      }
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-paper px-4">
      <div className="w-full max-w-md rounded-2xl bg-cream p-8 shadow-card">
        <p className="text-xs tracking-[0.18em] text-amber-deep uppercase">Aarohan</p>
        <h1 className="mt-2 font-display text-3xl text-navy-deep">Administrator sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Only trustees and staff should create accounts here. Donors do not need an account.
        </p>
        {authEnabled ? (
          <div className="mt-6 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/admin" })}
              >
                Continue with {p.label}
              </Button>
            ))}
            <div className="relative py-2 text-center text-xs text-ink-soft">
              <span className="bg-cream px-2">or email</span>
            </div>
            <form onSubmit={(e) => void onEmail(e)} className="space-y-3">
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  required
                />
              </Field>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "up" ? "Create admin account" : "Sign in"}
              </Button>
            </form>
            <button
              type="button"
              className="text-sm text-navy underline"
              onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
            >
              {mode === "in" ? "Need an account? Create one" : "Have an account? Sign in"}
            </button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">Sign-in is disabled.</p>
        )}
        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-ink-soft underline">
            Back to the public site
          </Link>
        </p>
      </div>
    </main>
  );
}
