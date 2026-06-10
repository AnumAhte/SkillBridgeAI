"use client";

import { useState } from "react";
import { Lock, CheckCircle2, Loader2, FileCheck2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AiTransparency } from "@/components/ai-transparency";
import { CvDropzone } from "@/components/cv-dropzone";
import { ROLE_TITLES } from "@/lib/data/skills";
import type { CareerAnalysis } from "@/types";

const SAMPLE_CV = `Aziz Karimov — Tashkent, Uzbekistan
Junior analyst with 1 year experience. Proficient in Excel and basic Python.
Built reports for a retail company. Strong communication skills.
Education: BSc Economics, 2023. Languages: Uzbek, Russian, English.`;

export default function CareerNavigatorPage() {
  const [resumeText, setResumeText] = useState(SAMPLE_CV);
  const [targetRole, setTargetRole] = useState(ROLE_TITLES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<string | null>(null);

  // `text` override lets us analyze freshly-extracted CV text without waiting
  // for the resumeText state update to flush.
  async function analyze(text: string = resumeText) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: text, targetRole }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Analysis failed");
      setResult(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Called when a dropped/selected CV has been parsed to text server-side.
  function handleExtracted(text: string, filename: string) {
    setResumeText(text);
    setSourceFile(filename);
    setError(null);
    analyze(text); // auto-run skill analysis after extraction
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Career Navigator</h1>
        <p className="text-muted-foreground">
          Upload your CV (PDF/DOCX) or paste it, pick a target role, and we&apos;ll score your
          readiness and build a roadmap.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your CV</CardTitle>
          <CardDescription>
            Drag &amp; drop a file — we extract the text automatically and analyze it with AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CvDropzone onExtracted={handleExtracted} />

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or paste / edit text below
            <span className="h-px flex-1 bg-border" />
          </div>

          {sourceFile && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <FileCheck2 className="h-4 w-4" /> Extracted from <strong>{sourceFile}</strong>
            </p>
          )}

          <Textarea rows={8} value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Target role:</label>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              {ROLE_TITLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <Button onClick={() => analyze()} disabled={loading} className="ml-auto">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Analyzing…" : "Analyze my profile"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardDescription>Readiness for {result.targetRole}</CardDescription>
              <CardTitle className="text-4xl">{result.readinessScore}%</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={result.readinessScore} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium">✔ Skills you have</p>
                  <div className="flex flex-wrap gap-2">
                    {result.haveSkills.length ? (
                      result.haveSkills.map((s) => (
                        <Badge key={s.name} variant="success">
                          {s.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None detected</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">✖ Skills to build</p>
                  <div className="flex flex-wrap gap-2">
                    {result.gaps.map((g) => (
                      <Badge key={g.skill} variant="warning">
                        {g.skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your personalized roadmap</CardTitle>
              <CardDescription>Ordered to close your highest-priority gaps first.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.roadmap.map((item, i) => (
                <div key={item.position} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.position}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">~{item.estWeeks} weeks · {item.skill}</p>
                  </div>
                  {i === 0 ? (
                    <Button size="sm" variant="outline">
                      <CheckCircle2 className="h-4 w-4" /> Start
                    </Button>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <AiTransparency rationale={result.rationale} usedFallback={result.usedFallback} />
        </div>
      )}
    </div>
  );
}
