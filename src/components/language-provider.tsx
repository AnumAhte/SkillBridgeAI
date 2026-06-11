"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DICTIONARIES, type Dict } from "@/lib/i18n/dictionaries";
import type { Language } from "@/types";

const STORAGE_KEY = "sb:lang";

const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: Dict;
}>({ lang: "en", setLang: () => {}, t: DICTIONARIES.en });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  // Read after mount to avoid SSR/client hydration mismatch.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && saved in DICTIONARIES) setLangState(saved);
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: DICTIONARIES[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  return useContext(LanguageContext);
}
