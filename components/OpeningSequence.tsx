"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Database, Wrench, Code2, Eye, Layers, BrainCircuit } from "lucide-react";
import { useLocale } from "./LocaleProvider";

const capabilities = [Search, Database, Wrench, Code2, Eye, Layers];
const positions = [[120, 140], [400, 60], [680, 140], [680, 340], [400, 420], [120, 340]];

/** A tool-orchestration story followed by the original brand reveal. */
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
      try { if (sessionStorage.getItem("jcl-intro-v2-seen")) return; } catch { /* Optional preference. */ }
    }
    try { sessionStorage.setItem("jcl-intro-v2-seen", "1"); } catch { /* Opening still works. */ }
    previousFocus.current = document.activeElement as HTMLElement | null;
    setPhase("assembly"); setExiting(false); setVisible(true); onActiveChange(true);
    return () => onActiveChange(false);
  }, [ready, request, onActiveChange]);

  useEffect(() => {
    if (!visible) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus({ preventScroll: true });
    const assemble = window.setTimeout(() => setPhase("brand"), 3600);
    const reveal = window.setTimeout(() => setExiting(true), 5450);
    const finish = window.setTimeout(complete, 6100);
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
    {phase === "assembly" ? <div className="agent-assembly" aria-hidden="true">
      <div className="assembly-grid" />
      <span className="assembly-caption">{t.intro.assemblyLabel}</span>
      <div className="assembly-stage">
        <div className="assembly-network">
          <svg className="assembly-wiring" viewBox="0 0 800 480" preserveAspectRatio="none">
            <path className="assembly-chain" d="M120 140 L400 60 L680 140 L680 340 L400 420 L120 340 Z" pathLength="100" />
            {positions.map(([x, y], i) => <g key={i} style={{ "--index": i } as React.CSSProperties}>
              <path className="assembly-link" d={`M${x} ${y} L400 240`} pathLength="100" />
              <path className="assembly-signal" d={`M${x} ${y} L400 240`} pathLength="100" />
            </g>)}
          </svg>
          {capabilities.map((Icon, i) => <div className="assembly-tool" key={i} style={{ left: `${positions[i][0] / 8}%`, top: `${positions[i][1] / 4.8}%`, "--index": i } as React.CSSProperties}>
            <div><Icon size={24} /><span>{t.intro.tools[i]}</span><small>0{i + 1}</small></div>
          </div>)}
        </div>
        <div className="assembly-core"><i /><i /><div><BrainCircuit /><b>{t.intro.agent}</b><span>JCL / 01</span></div></div>
      </div>
      <div className="assembly-stages">{t.intro.assemble.map((stage, i) => <span key={i} style={{ "--stage": i } as React.CSSProperties}><i />{stage}</span>)}</div>
    </div> : <><div className="agent-burst" aria-hidden="true"><i /><i />{Array.from({ length: 24 }, (_, i) => <span key={i} style={{ "--angle": `${i * 15}deg` } as React.CSSProperties} />)}</div>
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
