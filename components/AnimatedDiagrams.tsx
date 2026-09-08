"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Network, Pause, Play } from "lucide-react";
import { useLocale } from "./LocaleProvider";

function useDiagramMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => setActive(visible && !document.hidden && !media.matches);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .15 });
    observer.observe(element);
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); media.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  return { ref, running: active && !paused, paused, toggle: () => setPaused(value => !value) };
}
function MotionToggle({ paused, toggle }: { paused: boolean; toggle: () => void }) {
  const { t } = useLocale();
  return <button type="button" className="diagram-toggle" onClick={toggle} aria-pressed={paused} aria-label={paused ? t.diagram.play : t.diagram.pause} title={paused ? t.diagram.play : t.diagram.pause}>{paused ? <Play size={11} /> : <Pause size={11} />}</button>;
}

export function AnimatedFlow({ steps, parallel }: { steps: string[]; parallel: boolean }) {
  const { t } = useLocale();
  const motion = useDiagramMotion();
  const cycle = steps.length * 1.1 + 1.2;
  return <div ref={motion.ref} className={`animated-flow diagram-motion ${parallel ? "flow-parallel" : ""}`} data-running={motion.running} style={{ "--cycle": `${cycle}s` } as CSSProperties}>
    <div className="flow-track">{steps.map((step, i) => <div className="flow-segment" key={i} style={{ "--delay": `${parallel ? 0 : i * 1.1}s`, "--packet-delay": `${i * 1.1 + .5}s` } as CSSProperties}>
      <div className="flow-node"><small aria-hidden="true">{String(i + 1).padStart(2, "0")}<i /></small><span>{step}</span></div>
      {i < steps.length - 1 && <div className="flow-connector" aria-hidden="true">{parallel ? <span>+</span> : <><ArrowRight size={14} /><i className="flow-packet" /></>}</div>}
    </div>)}</div>
    <div className="flow-caption"><span>{parallel ? t.diagram.parallel : t.diagram.sequence}</span><MotionToggle paused={motion.paused} toggle={motion.toggle} /></div>
  </div>;
}

const paths = ["M220 45 V122", "M369 170 H266", "M220 295 V218", "M71 170 H174"];
export function SystemsDiagram() {
  const { t } = useLocale();
  const motion = useDiagramMotion();
  return <div ref={motion.ref} className="systems-diagram diagram-motion" data-running={motion.running} role="group" aria-label={t.diagram.system}>
    <div className="systems-stage">
      <svg className="systems-wiring" viewBox="0 0 440 340" aria-hidden="true">
        <circle className="systems-orbit" cx="220" cy="170" r="125" />
        <circle className="systems-orbit-inner" cx="220" cy="170" r="88" />
        {paths.map((d, i) => <g key={d} style={{ "--node-delay": `${i * 1.25}s` } as CSSProperties}><path className="systems-wire" d={d} /><path className="systems-packet" d={d} pathLength="100" /></g>)}
      </svg>
      <div className="systems-hub"><span className="hub-halo" aria-hidden="true" /><Network size={28} /><b>{t.systems.core}</b><small>{t.systems.layer}</small></div>
      {t.systems.nodes.map((node, i) => <div className={`systems-satellite satellite-${i}`} key={i} style={{ "--node-delay": `${i * 1.25}s` } as CSSProperties}><i aria-hidden="true" /><span>{node}</span></div>)}
    </div>
    <MotionToggle paused={motion.paused} toggle={motion.toggle} />
  </div>;
}
