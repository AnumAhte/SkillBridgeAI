"use client";

import { useI18n } from "@/components/language-provider";
import { LANGUAGE_LABELS } from "@/lib/i18n/dictionaries";
import type { Language } from "@/types";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <select
      aria-label="Language"
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
      value={lang}
      onChange={(e) => setLang(e.target.value as Language)}
    >
      {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
        <option key={l} value={l}>
          {compact ? LANGUAGE_LABELS[l].slice(0, 4).trim() : LANGUAGE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
