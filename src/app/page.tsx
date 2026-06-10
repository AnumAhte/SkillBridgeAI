import Link from "next/link";
import { ArrowRight, Brain, Languages, GraduationCap, Briefcase, LineChart, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const MODULES = [
  { icon: Brain, title: "AI Career Navigator", desc: "Upload your CV — get a readiness score, skill gaps, and a roadmap." },
  { icon: Sparkles, title: "Adaptive Learning", desc: "Lessons that simplify or advance based on your quiz performance." },
  { icon: Languages, title: "Multilingual Tutor", desc: "Chat-based learning in Uzbek, Russian, and English." },
  { icon: GraduationCap, title: "Educator Copilot", desc: "Generate full courses, quizzes, and assignments from one prompt." },
  { icon: Briefcase, title: "Job Matchmaker", desc: "Match to real internships and jobs with a resume score." },
  { icon: LineChart, title: "Labor Market Insights", desc: "Trending and emerging skills across Uzbekistan's tech economy." },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">SB</div>
          SkillBridge AI
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <ThemeToggle />
          <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container flex flex-col items-center gap-6 py-20 text-center">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> Powered by Gemini 2.5 Flash
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            From your resume to a real job — <span className="text-primary">in your language.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            SkillBridge AI assesses your skills, builds a personalized multilingual learning roadmap,
            and matches you to internships and jobs in Uzbekistan&apos;s digital economy.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/career-navigator" className={buttonVariants({ size: "lg" })}>
              Get my Readiness Score <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See the demo
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>🇺🇿 Uzbek</span><span>·</span><span>🇷🇺 Russian</span><span>·</span><span>🇬🇧 English</span>
          </div>
        </section>

        {/* Modules */}
        <section className="container grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
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
