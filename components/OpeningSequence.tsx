"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DeductionSequence from "./DeductionSequence";
import { useLocale } from "./LocaleProvider";

/** A cinematic deduction followed by the original brand reveal. */
export default function OpeningSequence({ request, onActiveChange }: { request: number; onActiveChange: (active: boolean) => void }) {
  const { t, ready } = useLocale();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState<"assembly" | "brand">("assembly");
  const skipRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const complete = useCallback(() => { setVisible(false); onActiveChange(false); }, [onActiveChange]);

  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    if (request === 0) {
      if (window.location.hash) return;
      try { if (sessionStorage.getItem("jcl-intro-v3-seen")) return; } catch { /* Optional preference. */ }
    }
    try { sessionStorage.setItem("jcl-intro-v3-seen", "1"); } catch { /* Opening still works. */ }
    previousFocus.current = document.activeElement as HTMLElement | null;
    setPhase("assembly"); setExiting(false); setVisible(true); onActiveChange(true);
    return () => onActiveChange(false);
  }, [ready, request, onActiveChange]);

  useEffect(() => {
    if (!visible) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus({ preventScroll: true });
    const assemble = window.setTimeout(() => setPhase("brand"), 5500);
    const reveal = window.setTimeout(() => setExiting(true), 7350);
    const finish = window.setTimeout(complete, 8000);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { if (media.matches) complete(); };
    media.addEventListener("change", change);
    return () => {
      window.clearTimeout(assemble); window.clearTimeout(reveal); window.clearTimeout(finish);
      media.removeEventListener("change", change);
      document.body.style.overflow = oldOverflow;
      const element = previousFocus.current;
      // Restore keyboard focus after the parent removes inert from the page.
      requestAnimationFrame(() => { if (element?.isConnected && element !== document.body) element.focus({ preventScroll: true }); });
    };
  }, [visible, complete]);

  if (!visible) return null;
  return <div className={`opening ${exiting ? "opening-exit" : ""}`} data-phase={phase} role="dialog" aria-modal="true" aria-label={t.intro.label} onKeyDown={event => {
    if (event.key === "Escape") complete();
    if (event.key === "Tab") { event.preventDefault(); skipRef.current?.focus(); }
  }}>
    <div className="opening-shutter opening-shutter-top" aria-hidden="true" /><div className="opening-shutter opening-shutter-bottom" aria-hidden="true" />
    {phase === "assembly" ? <DeductionSequence /> : <><div className="agent-burst" aria-hidden="true"><i /><i />{Array.from({ length: 24 }, (_, i) => <span key={i} style={{ "--angle": `${i * 15}deg` } as React.CSSProperties} />)}</div>
    <div className="opening-content" aria-hidden="true">
      <div className="opening-grid" />
      <div className="opening-orbits"><i /><i /><i /></div>
      <span className="opening-caption">{t.intro.caption}</span>
      <div className="opening-word">{"JCL.AI".split("").map((letter, i) => <span key={i} style={{ "--letter": i } as React.CSSProperties}>{letter}</span>)}</div>
      <p className="opening-line">{t.intro.line}</p>
      <div className="opening-stages">{t.intro.stages.map((stage, i) => <span key={stage} style={{ "--stage": i } as React.CSSProperties}>{stage}</span>)}</div>
    </div></>}
    <button ref={skipRef} type="button" className="opening-skip" onClick={complete}>{t.intro.skip}<span aria-hidden="true">↗</span></button>
  </div>;
}
