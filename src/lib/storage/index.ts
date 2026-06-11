/**
 * Persistence for user-generated content (assessments, courses, tutor chats).
 *
 * Dual backend, selected automatically:
 *  - Supabase `user_artifacts` table (RLS-protected) for real signed-in users.
 *  - localStorage for demo mode / when Supabase isn't configured — so the
 *    full product experience works with zero cloud setup.
 *
 * All functions are client-side and fail soft: a storage error never breaks
 * the feature that produced the content.
 */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { AppUser, Artifact, ArtifactKind } from "@/types";

const MAX_LOCAL_ITEMS = 100;

function localKey(userId: string) {
  return `sb:artifacts:${userId}`;
}

function isLocalBackend(user: AppUser) {
  return user.isDemo || !isSupabaseConfigured;
}

// ── localStorage backend ──────────────────────────────────────────────

function readLocal(userId: string): Artifact[] {
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? (JSON.parse(raw) as Artifact[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(userId: string, items: Artifact[]) {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(items.slice(0, MAX_LOCAL_ITEMS)));
  } catch {
    // Quota exceeded / private mode — drop silently rather than break the UI.
  }
}

// ── Public API ────────────────────────────────────────────────────────

export async function listArtifacts<T = unknown>(
  user: AppUser,
  kind?: ArtifactKind,
): Promise<Artifact<T>[]> {
  if (isLocalBackend(user)) {
    const all = readLocal(user.id) as Artifact<T>[];
    const filtered = kind ? all.filter((a) => a.kind === kind) : all;
    return [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  try {
    const supabase = createClient();
    let query = supabase
      .from("user_artifacts")
      .select("id, kind, title, payload, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (kind) query = query.eq("kind", kind);
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id as string,
      kind: row.kind as ArtifactKind,
      title: row.title as string,
      payload: row.payload as T,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  } catch {
    return [];
  }
}

export async function saveArtifact<T>(
  user: AppUser,
  kind: ArtifactKind,
  title: string,
  payload: T,
  id?: string,
): Promise<Artifact<T>> {
  const now = new Date().toISOString();
  const artifact: Artifact<T> = {
    id: id ?? crypto.randomUUID(),
    kind,
    title,
    payload,
    createdAt: now,
    updatedAt: now,
  };

  if (isLocalBackend(user)) {
    const all = readLocal(user.id);
    const existing = all.find((a) => a.id === artifact.id);
    if (existing) {
      existing.title = title;
      existing.payload = payload;
      existing.updatedAt = now;
    } else {
      all.unshift(artifact as Artifact);
    }
    writeLocal(user.id, all);
    return existing ? ({ ...existing } as Artifact<T>) : artifact;
  }

  try {
    const supabase = createClient();
    await supabase.from("user_artifacts").upsert({
      id: artifact.id,
      user_id: user.id,
      kind,
      title,
      payload,
      updated_at: now,
    });
  } catch {
    // Network/RLS failure — content still lives in component state.
  }
  return artifact;
}

export async function deleteArtifact(user: AppUser, id: string): Promise<void> {
  if (isLocalBackend(user)) {
    writeLocal(user.id, readLocal(user.id).filter((a) => a.id !== id));
    return;
  }
  try {
    const supabase = createClient();
    await supabase.from("user_artifacts").delete().eq("id", id);
  } catch {
    // Ignore — list will refresh on next load.
  }
}
