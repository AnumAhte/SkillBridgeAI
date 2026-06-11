"use client";

import { useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { saveArtifact } from "@/lib/storage";
import type { Language, TutorMessage, TutorSessionPayload } from "@/types";

const LANGS: { value: Language; label: string }[] = [
  { value: "uz", label: "🇺🇿 Uzbek" },
  { value: "ru", label: "🇷🇺 Russian" },
  { value: "en", label: "🇬🇧 English" },
];

export default function TutorPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>("uz");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Stable per-conversation id so each completed exchange upserts the same artifact.
  const sessionIdRef = useRef<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: TutorMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }

      // Persist the completed exchange (fire-and-forget — never blocks chat).
      if (user && acc) {
        sessionIdRef.current ??= crypto.randomUUID();
        const payload: TutorSessionPayload = {
          language,
          messages: [...next, { role: "assistant", content: acc }],
        };
        const title = next[0]?.content.slice(0, 60) || "Tutor session";
        saveArtifact(user, "tutor", title, payload, sessionIdRef.current).catch(() => {});
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Multilingual AI Tutor</h1>
          <p className="text-muted-foreground">Ask anything — explanations, homework, coding help.</p>
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          {LANGS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <Card ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
            <div>
              <p>Try: &quot;SQL JOIN nima?&quot; · &quot;Объясни рекурсию&quot; · &quot;Explain Big-O&quot;</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.content || (busy && i === messages.length - 1 ? "…" : "")}
            </span>
          </div>
        ))}
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !input.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
