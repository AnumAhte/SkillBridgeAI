"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Languages,
  GraduationCap,
  Briefcase,
  LineChart,
  Sparkles,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/components/language-provider";

const MODULES = [
  { icon: Brain, title: "AI Career Navigator", desc: "Upload your CV — get a readiness score, skill gaps, and a roadmap." },
  { icon: Sparkles, title: "Adaptive Learning", desc: "Lessons that simplify or advance based on your quiz performance." },
  { icon: Languages, title: "Multilingual Tutor", desc: "Chat-based learning in Uzbek, Russian, and English." },
  { icon: GraduationCap, title: "Educator Copilot", desc: "Generate full courses, quizzes, and assignments from one prompt." },
  { icon: Briefcase, title: "Job Matchmaker", desc: "Match to real internships and jobs with a resume score." },
  { icon: LineChart, title: "Labor Market Insights", desc: "Trending and emerging skills across Uzbekistan's tech economy." },
];

export default function Landing() {
  const { user, enterDemo } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [demoBusy, setDemoBusy] = useState(false);

  async function startDemo() {
    setDemoBusy(true);
    if (!user) await enterDemo();
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">SB</div>
          SkillBridge AI
        </div>
        <nav className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
              {t.nav.dashboard}
            </Link>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              {t.common.signIn}
            </Link>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center gap-6 py-20 text-center">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> Powered by Gemini 2.5 Flash
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            {t.landing.heroTitle} <span className="text-primary">{t.landing.heroAccent}</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t.landing.heroSub}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={user ? "/career-navigator" : "/login"} className={buttonVariants({ size: "lg" })}>
              {t.landing.ctaPrimary} <ArrowRight className="h-4 w-4" />
            </Link>
            <Button size="lg" variant="outline" onClick={startDemo} disabled={demoBusy}>
              {demoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              {t.landing.ctaDemo}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>🇺🇿 O&apos;zbekcha</span><span>·</span><span>🇷🇺 Русский</span><span>·</span><span>🇬🇧 English</span>
          </div>
        </section>

        {/* Uzbekistan onboarding */}
        <section className="border-y bg-muted/30">
          <div className="container flex flex-col items-center gap-8 py-16 text-center">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl font-bold sm:text-3xl">{t.landing.onboardingTitle}</h2>
              <p className="text-muted-foreground">{t.landing.onboardingSub}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {t.landing.steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3 rounded-xl border bg-background p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="container grid gap-4 py-24 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <Card key={m.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <m.icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-lg">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{m.desc}</CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built for the Uzbekistan hackathon · Aligned with Digital Uzbekistan 2030 · Free-tier MVP
      </footer>
    </div>
  );
}
