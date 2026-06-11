import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">SB</div>
          SkillBridge AI
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </header>
      <main className="container flex flex-1 items-center justify-center py-10">{children}</main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        Data stays under your control · GDPR-aligned · Built for Digital Uzbekistan 2030
      </footer>
    </div>
  );
}
