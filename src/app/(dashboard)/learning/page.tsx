"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { nextDifficulty, difficultyLabel, feedbackFor } from "@/lib/services/learning";

// Demo quiz on the first roadmap skill (SQL).
const QUIZ = [
  {
    q: "Which SQL clause filters rows?",
    options: ["WHERE", "ORDER BY", "GROUP BY", "SELECT"],
    answer: 0,
  },
  {
    q: "Which JOIN returns only matching rows in both tables?",
    options: ["LEFT JOIN", "INNER JOIN", "FULL JOIN", "CROSS JOIN"],
    answer: 1,
  },
  {
    q: "How do you count rows?",
    options: ["SUM(*)", "TOTAL()", "COUNT(*)", "ROWS()"],
    answer: 2,
  },
];

export default function LearningPage() {
  const [difficulty, setDifficulty] = useState(2);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ score: number; next: number } | null>(null);

  function submit() {
    const correct = QUIZ.filter((q, i) => answers[i] === q.answer).length;
    const score = Math.round((correct / QUIZ.length) * 100);
    const next = nextDifficulty(difficulty, score);
    setResult({ score, next });
    setDifficulty(next);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Adaptive Learning Engine</h1>
        <p className="text-muted-foreground">
          Lessons adapt to your performance. Current level:{" "}
          <Badge variant="secondary">{difficultyLabel(difficulty)}</Badge>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson 1 · SQL Fundamentals</CardTitle>
          <CardDescription>
            {difficulty === 1
              ? "Simplified explanation: SQL is a language to ask questions of a database."
              : difficulty === 3
                ? "Advanced: explore query planning, indexes, and window functions."
                : "SQL lets you read and manipulate relational data using clauses like SELECT and WHERE."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {QUIZ.map((q, i) => (
            <div key={i}>
              <p className="mb-2 text-sm font-medium">
                {i + 1}. {q.q}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt, oi) => (
                  <Button
                    key={oi}
                    size="sm"
                    variant={answers[i] === oi ? "default" : "outline"}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={submit} disabled={Object.keys(answers).length < QUIZ.length}>
            Submit quiz
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardDescription>Your score</CardDescription>
            <CardTitle className="text-3xl">{result.score}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={result.score} />
            <p className="text-sm">{feedbackFor(result.score)}</p>
            <p className="text-sm text-muted-foreground">
              Next lesson difficulty adjusted to{" "}
              <Badge variant="secondary">{difficultyLabel(result.next)}</Badge>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
