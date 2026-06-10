"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Sparkles, Languages, GraduationCap, Briefcase, LineChart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/career-navigator", label: "Career Navigator", icon: Brain },
  { href: "/learning", label: "Adaptive Learning", icon: Sparkles },
  { href: "/tutor", label: "AI Tutor", icon: Languages },
  { href: "/educator", label: "Educator Copilot", icon: GraduationCap },
  { href: "/jobs", label: "Job Matchmaker", icon: Briefcase },
  { href: "/insights", label: "Market Insights", icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b p-3 md:h-screen md:w-64 md:border-b-0 md:border-r">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 py-2 font-bold">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">SB</div>
        SkillBridge AI
      </Link>
      <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden items-center justify-between px-2 md:flex">
        <span className="text-xs text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
