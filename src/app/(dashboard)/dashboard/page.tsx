"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
  BookOpen,
  GraduationCap,
  Languages,
  Map,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/components/language-provider";
import { listArtifacts } from "@/lib/storage";
import type {
  Artifact,
  AssessmentPayload,
  GeneratedCourse,
  TutorSessionPayload,
} from "@/types";

const LANG_FLAGS: Record<string, string> = { uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧" };

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Artifact<AssessmentPayload>[]>([]);
  const [courses, setCourses] = useState<Artifact<GeneratedCourse>[]>([]);
  const [tutorSessions, setTutorSessions] = useState<Artifact<TutorSessionPayload>[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [a, c, s] = await Promise.all([
        listArtifacts<AssessmentPayload>(user, "assessment"),
        listArtifacts<GeneratedCourse>(user, "course"),
        listArtifacts<TutorSessionPayload>(user, "tutor"),
      ]);
      if (cancelled) return;
      setAssessments(a);
      setCourses(c);
      setTutorSessions(s);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  }

  const latest = assessments[0]?.payload.analysis ?? null;
  const previous = assessments[1]?.payload.analysis ?? null;
  const delta = latest && previous ? latest.readinessScore - previous.readinessScore : null;
  const roadmap = latest?.roadmap ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t.dashboard.welcome}, {user?.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
      </div>

      {/* Progress summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t.dashboard.latestReadiness}</CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-3xl">
              {latest ? `${latest.readinessScore}%` : "—"}
              {delta !== null && delta !== 0 && (
                <span
                  className={`flex items-center text-sm font-semibold ${
                    delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {delta > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
              {delta === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latest ? (
              <>
                <Progress value={latest.readinessScore} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {latest.targetRole}
                  {delta !== null && ` · ${delta > 0 ? "+" : ""}${delta} ${t.dashboard.sinceLast}`}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{t.dashboard.emptyAssessments}</p>
            )}
          </CardContent>
        </Card>

        <StatCard icon={TrendingUp} label={t.dashboard.assessments} value={assessments.length} />
        <StatCard icon={GraduationCap} label={t.dashboard.courses} value={courses.length} />
        <StatCard icon={Languages} label={t.dashboard.tutorSessions} value={tutorSessions.length} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Recent assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" /> {t.dashboard.recentAssessments}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.length === 0 ? (
              <EmptyState
                icon={Brain}
                message={t.dashboard.emptyAssessments}
                action={
                  <Link href="/career-navigator" className={buttonVariants({ size: "sm" })}>
                    {t.dashboard.analyzeCta} <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
            ) : (
              assessments.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {a.payload.analysis.readinessScore}%
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.payload.analysis.targetRole}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.payload.sourceFile ? `${a.payload.sourceFile} · ` : ""}
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                  <div className="hidden w-24 sm:block">
                    <Progress value={a.payload.analysis.readinessScore} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Latest roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5 text-primary" /> {t.dashboard.savedRoadmap}
            </CardTitle>
            {latest && (
              <CardDescription>
                {latest.targetRole} · {roadmap.length} {t.dashboard.steps}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {roadmap.length === 0 ? (
              <EmptyState
                icon={Map}
                message={t.dashboard.emptyRoadmap}
                action={
                  <Link href="/career-navigator" className={buttonVariants({ size: "sm", variant: "outline" })}>
                    {t.dashboard.analyzeCta}
                  </Link>
                }
              />
            ) : (
              roadmap.slice(0, 4).map((item) => (
                <div key={item.position} className="flex items-center gap-3 rounded-lg border p-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.position}
                  </span>
                  <p className="flex-1 truncate text-sm font-medium">{item.title}</p>
                  <span className="text-xs text-muted-foreground">~{item.estWeeks}w</span>
                </div>
              ))
            )}
            {roadmap.length > 0 && (
              <Link
                href="/learning"
                className={buttonVariants({ size: "sm", variant: "outline" }) + " mt-1 w-full"}
              >
                {t.nav.learning} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Tutor activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-primary" /> {t.dashboard.tutorActivity}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tutorSessions.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                message={t.dashboard.emptyTutor}
                action={
                  <Link href="/tutor" className={buttonVariants({ size: "sm", variant: "outline" })}>
                    {t.dashboard.askTutorCta}
                  </Link>
                }
              />
            ) : (
              tutorSessions.slice(0, 3).map((s) => (
                <Link
                  key={s.id}
                  href="/tutor"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <span className="text-lg">{LANG_FLAGS[s.payload.language] ?? "💬"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.payload.messages.length} messages · {timeAgo(s.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Generated courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" /> {t.dashboard.generatedCourses}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                message={t.dashboard.emptyCourses}
                action={
                  <Link href="/educator" className={buttonVariants({ size: "sm", variant: "outline" })}>
                    {t.dashboard.createCourseCta}
                  </Link>
                }
              />
            ) : (
              courses.slice(0, 3).map((c) => (
                <Link
                  key={c.id}
                  href="/educator"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.payload.modules.length} modules · {timeAgo(c.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary">{c.payload.level}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Brain;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5">
          <Icon className="h-4 w-4" /> {label}
        </CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
