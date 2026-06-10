"use client";

import { useState } from "react";
import { Loader2, BookOpen, ClipboardList, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { GeneratedCourse, Language } from "@/types";

export default function EducatorPage() {
  const [topic, setTopic] = useState("Beginner AI course");
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<GeneratedCourse | null>(null);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/educator/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, language }),
      });
      const json = await res.json();
      setCourse(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Educator Copilot</h1>
        <p className="text-muted-foreground">
          One prompt → full curriculum: modules, lessons, quizzes, assignments, outcomes.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Course topic</label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Beginner AI course" />
          </div>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
            <option value="en">English</option>
            <option value="ru">Russian</option>
            <option value="uz">Uzbek</option>
          </select>
          <Button onClick={generate} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Generating…" : "Generate course"}
          </Button>
        </CardContent>
      </Card>

      {course && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" /> Learning outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {course.outcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {course.modules.map((m, mi) => (
            <Card key={mi}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-primary" /> Module {mi + 1}: {m.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 font-medium">Lessons</p>
                  <ul className="space-y-1 text-muted-foreground">
                    {m.lessons.map((l, li) => (
                      <li key={li}>
                        <span className="font-medium text-foreground">{l.title}</span> — {l.summary}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 flex items-center gap-1 font-medium">
                    <ClipboardList className="h-4 w-4" /> Quiz
                  </p>
                  {m.quiz.map((q, qi) => (
                    <div key={qi} className="mb-2 rounded-md border p-2">
                      <p className="font-medium">{q.question}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {q.options.map((opt, oi) => (
                          <Badge key={oi} variant={oi === q.answerIndex ? "success" : "outline"}>
                            {opt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Assignment:</span> {m.assignment}
                </p>
              </CardContent>
            </Card>
          ))}
          {course.usedFallback && (
            <p className="text-center text-xs text-muted-foreground">
              Generated in offline demo mode — add a Gemini API key for richer, language-native courses.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
