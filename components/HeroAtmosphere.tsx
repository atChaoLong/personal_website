"use client";

import { useDiagramMotion } from "./AnimatedDiagrams";
import { useLocale } from "./LocaleProvider";
import { useKnowledgeUniverse } from "./useKnowledgeUniverse";
import "./HeroAtmosphere.css";

export default function HeroAtmosphere({ suspended }: { suspended: boolean }) {
  const { ref, running } = useDiagramMotion();
  const { t } = useLocale();
  useKnowledgeUniverse(ref, running && !suspended, t.knowledge);

  return <div ref={ref} className="hero-atmosphere" data-running={running && !suspended} aria-hidden="true">
    <canvas className="knowledge-canvas" />
    <div className="knowledge-singularity">
      <div className="blackhole-growth">
        <div className="blackhole-insight" />
        <div className="blackhole-bloom" />
        <div className="blackhole-disk blackhole-disk-back"><div className="blackhole-disk-flow" /><div className="blackhole-filaments" /></div>
        <div className="blackhole-lens" />
        <div className="blackhole-horizon" />
        <div className="blackhole-disk blackhole-disk-front"><div className="blackhole-disk-flow" /></div>
      </div>
    </div>
  </div>;
}
