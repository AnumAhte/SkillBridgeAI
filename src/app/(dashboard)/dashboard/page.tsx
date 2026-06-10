import Link from "next/link";
import { ArrowRight, Brain, Briefcase, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default function DashboardPage() {
  // Demo snapshot — in production this reads from Supabase for the signed-in user.
  const readiness = 75;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back 👋</h1>
        <p className="text-muted-foreground">Here&apos;s your path to a Data Analyst role.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Readiness Score</CardDescription>
            <CardTitle className="text-3xl">{readiness}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={readiness} />
            <p className="mt-2 text-xs text-muted-foreground">Target: Data Analyst</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top skill gaps</CardDescription>
            <CardTitle className="text-lg">3 to close</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="warning">SQL</Badge>
            <Badge variant="warning">Power BI</Badge>
            <Badge variant="warning">Statistics</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Matched roles</CardDescription>
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Internships & jobs in Tashkent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickCard href="/career-navigator" icon={Brain} title="Analyze my CV" desc="Get skills, gaps & roadmap" />
        <QuickCard href="/learning" icon={Sparkles} title="Continue learning" desc="Adaptive lessons & quizzes" />
        <QuickCard href="/jobs" icon={Briefcase} title="View matched jobs" desc="See your best matches" />
      </div>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: typeof Brain;
  title: string;
  desc: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Icon className="h-6 w-6 text-primary" />
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Link href={href} className={buttonVariants({ variant: "outline", size: "sm" })}>
          Open <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
