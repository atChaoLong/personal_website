"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { messages, type Locale, type Messages } from "@/lib/messages";

const LocaleContext = createContext<{ locale: Locale; t: Messages; ready: boolean; setLocale: (locale: Locale) => void } | null>(null);
const valid = (value: string | null): value is Locale => value === "zh" || value === "en";

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("lang");
    let saved: string | null = null;
    try { saved = localStorage.getItem("jcl-locale"); } catch { /* Storage is optional. */ }
    updateLocale(valid(query) ? query : valid(saved) ? saved : initialLocale);
    setReady(true);
  }, [initialLocale]);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    try { document.cookie = `jcl-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`; } catch { /* Still usable when cookies are blocked. */ }
    try { localStorage.setItem("jcl-locale", locale); } catch { /* Still usable without storage. */ }
  }, [locale, ready]);
  function setLocale(next: Locale) {
    updateLocale(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(window.history.state, "", url);
  }
  return <LocaleContext.Provider value={{ locale, t: messages[locale], ready, setLocale }}>
    <title>{messages[locale].meta.title}</title>
    <meta name="description" content={messages[locale].meta.description} />
    {children}
  </LocaleContext.Provider>;
}
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale requires LocaleProvider");
  return context;
}
