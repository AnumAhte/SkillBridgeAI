import { Briefcase, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { matchJobs } from "@/lib/services/matching";

export default function JobsPage() {
  // Demo learner skills — in production these come from the user's latest assessment.
  const userSkills = ["Excel", "Python", "Communication", "SQL"];
  const matches = matchJobs(userSkills);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Internship &amp; Job Matchmaker</h1>
        <p className="text-muted-foreground">
          Ranked by how well your current skills match each posting.
        </p>
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
    </div>
  );
}
