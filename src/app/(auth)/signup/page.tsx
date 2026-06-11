"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/components/language-provider";

export default function SignupPage() {
  const { signUp, enterDemo, supabaseEnabled } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signUp(name, email, password);
    setBusy(false);
    if (error) setError(error);
    else router.push("/dashboard");
  }

  async function demo() {
    await enterDemo();
    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{t.auth.createTitle}</CardTitle>
        <CardDescription>{t.auth.createSub}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {supabaseEnabled ? (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">{t.auth.fullName}</label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aziza Karimova" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t.auth.email}</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.uz" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t.auth.password}</label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.common.signUp}
            </Button>
          </form>
        ) : (
          <>
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{t.auth.cloudOff}</p>
            <Button variant="secondary" className="w-full" onClick={demo}>
              <PlayCircle className="h-4 w-4" /> {t.common.tryDemo}
            </Button>
          </>
        )}
        <p className="text-center text-sm text-muted-foreground">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t.common.signIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
