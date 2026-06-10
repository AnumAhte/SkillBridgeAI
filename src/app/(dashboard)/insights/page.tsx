import { TrendingUp, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MARKET_TRENDS, EMERGING_CAREERS } from "@/lib/data/market.mock";

export default function InsightsPage() {
  const trending = MARKET_TRENDS.filter((t) => t.category === "trending");
  const emerging = MARKET_TRENDS.filter((t) => t.category === "emerging");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Labor Market Insights</h1>
        <p className="text-muted-foreground">
          Demand signals across Uzbekistan&apos;s digital economy (sample dataset).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" /> Trending tech skills
            </CardTitle>
            <CardDescription>Highest current demand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trending.map((t) => (
              <SkillRow key={t.skill} {...t} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5 text-primary" /> Emerging skills
            </CardTitle>
            <CardDescription>Fastest-growing — invest early</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {emerging.map((t) => (
              <SkillRow key={t.skill} {...t} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emerging careers to watch</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {EMERGING_CAREERS.map((c) => (
            <div key={c.title} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.title}</p>
                <Badge variant="secondary">{c.demand}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SkillRow({ skill, demandIndex, growthPct }: { skill: string; demandIndex: number; growthPct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{skill}</span>
        <span className="text-muted-foreground">
          {demandIndex} · <span className="text-emerald-500">+{growthPct}%</span>
        </span>
      </div>
      <Progress value={demandIndex} />
    </div>
  );
}
