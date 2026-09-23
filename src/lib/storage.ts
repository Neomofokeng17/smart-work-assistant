import { useCallback, useEffect, useState } from "react";

export function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("awpa-storage", { detail: key }));
  } catch {
    /* quota */
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readLS(key, fallback));
    setHydrated(true);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === key) setValue(readLS(key, fallback));
    };
    window.addEventListener("awpa-storage", onChange);
    return () => window.removeEventListener("awpa-storage", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeLS(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

/* ---------------- stats ---------------- */

export type Stats = {
  emails: number;
  plans: number;
  research: number;
  chats: number;
  generations: number;
};

export const EMPTY_STATS: Stats = { emails: 0, plans: 0, research: 0, chats: 0, generations: 0 };
export const STATS_KEY = "awpa:stats";

export function bumpStat(kind: keyof Stats) {
  const stats = readLS<Stats>(STATS_KEY, EMPTY_STATS);
  const next = { ...stats, [kind]: (stats[kind] ?? 0) + 1, generations: stats.generations + 1 };
  writeLS(STATS_KEY, next);
}

// Rough, clearly-labelled estimates of time saved per generation type.
export function estimatedHoursSaved(s: Stats) {
  const minutes = s.emails * 12 + s.plans * 20 + s.research * 25 + s.chats * 5;
  return Math.round((minutes / 60) * 10) / 10;
}

/* ---------------- history ---------------- */

export type HistoryItem = {
  id: string;
  tool: "email" | "planner" | "research";
  title: string;
  output: string;
  prompt: string;
  createdAt: number;
};

export const HISTORY_KEY = "awpa:history";

export function saveHistory(item: HistoryItem) {
  const list = readLS<HistoryItem[]>(HISTORY_KEY, []);
  writeLS(HISTORY_KEY, [item, ...list].slice(0, 50));
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
