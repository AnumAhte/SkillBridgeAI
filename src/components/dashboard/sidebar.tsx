"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain,
  Sparkles,
  Languages,
  GraduationCap,
  Briefcase,
  LineChart,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/components/language-provider";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useI18n();

  const nav = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/career-navigator", label: t.nav.career, icon: Brain },
    { href: "/learning", label: t.nav.learning, icon: Sparkles },
    { href: "/tutor", label: t.nav.tutor, icon: Languages },
    { href: "/educator", label: t.nav.educator, icon: GraduationCap },
    { href: "/jobs", label: t.nav.jobs, icon: Briefcase },
    { href: "/insights", label: t.nav.insights, icon: LineChart },
  ];

  const initials = user?.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b p-3 md:h-screen md:w-64 md:border-b-0 md:border-r">
      <Link href="/" className="mb-4 flex items-center gap-2 px-2 py-2 font-bold">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">SB</div>
        SkillBridge AI
      </Link>
      <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
        {nav.map((item) => {
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

      <div className="mt-auto hidden flex-col gap-3 md:flex">
        <div className="flex items-center justify-between px-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
        {user && (
          <div className="flex items-center gap-2 rounded-lg border p-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.isDemo ? t.common.demoUser : user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              title={t.common.signOut}
              aria-label={t.common.signOut}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
