"use client";

import { useEffect, useState } from "react";
import { Briefcase, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AiTransparency } from "@/components/ai-transparency";
import { matchJobs } from "@/lib/services/matching";
import { useAuth } from "@/components/auth-provider";
import { listArtifacts } from "@/lib/storage";
import type { AssessmentPayload } from "@/types";

const DEFAULT_SKILLS = ["Excel", "Python", "Communication", "SQL"];

export default function JobsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<string[] | null>(null);
  const [fromAssessment, setFromAssessment] = useState(false);

  // Match against the user's most recent assessed skills when available.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    listArtifacts<AssessmentPayload>(user, "assessment").then((assessments) => {
      if (cancelled) return;
      const detected = assessments[0]?.payload.analysis.haveSkills.map((s) => s.name);
      if (detected && detected.length > 0) {
        setSkills(detected);
        setFromAssessment(true);
      } else {
        setSkills(DEFAULT_SKILLS);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!skills) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  }

  const matches = matchJobs(skills);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Internship &amp; Job Matchmaker</h1>
        <p className="text-muted-foreground">
          Ranked by how well your current skills match each posting.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {fromAssessment ? "Matching with your assessed skills:" : "Matching with sample skills:"}
        </span>
        {skills.map((s) => (
          <Badge key={s} variant="secondary">
            {s}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4">
        {matches.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-primary" /> {job.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {job.company} · <MapPin className="h-3 w-3" /> {job.location}
                    {job.isInternship && <Badge variant="secondary">Internship</Badge>}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{job.matchScore}%</div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={job.matchScore} />
              {job.missingSkills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Next skills to improve match:</span>
                  {job.missingSkills.map((s) => (
                    <Badge key={s} variant="warning">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Badge variant="success">You meet all required skills 🎉</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AiTransparency
        rationale={
          fromAssessment
            ? "Match scores compare the skills detected in your most recent CV assessment against each posting's required skills — so improving a roadmap skill directly raises your match scores."
            : "Match scores compare a sample skill profile against each posting's required skills. Run a CV analysis in Career Navigator to match with your real skills."
        }
        usedFallback={!fromAssessment}
        confidence={fromAssessment ? "high" : "medium"}
        detectedSkills={skills}
        factors={[
          "Each posting lists required skills; your match score is the share of those you already have.",
          "Missing skills are shown per job so you know exactly what closes the gap.",
          "Postings are curated from Uzbekistan's tech employers (IT Park residents, Uzum, EPAM, MyTaxi).",
        ]}
      />
    </div>
  );
}
